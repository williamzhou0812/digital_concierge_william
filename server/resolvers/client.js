import db from "../models";
import {
    processUpload,
    asyncForEach,
    processUploadMedia,
    checkUserLogin,
    processDeleteMedia,
    handleCreateActionActivityLog,
    handleUpdateActionActivityLog,
    processDelete
} from "../utils/constant";
import { UserInputError, AuthenticationError } from "apollo-server-express";

export default {
    Query: {
        client: async (_root, { id }) => {
            const client = await db.client.findByPk(id);
            // console.log(Object.keys(client.__proto__));
            return client;
        },
        clients: async (_root, _input, { user }) => {
            return await db.client.findAll({
                //CLIENT NOT EQUAL TO JOHN BATMAN GROUP
                where: { name: { [db.op.notLike]: "JOHN BATMAN GROUP" } }
            });
        },
        clientByUser: async (_root, _input, { user }) =>
            await db.client.findByPk(user.clientId),
        clientJBG: async (_root, _input, { user }) => {
            const client = await db.client.findOne({
                where: { name: { [db.op.like]: "JOHN BATMAN GROUP" } }
            });
            if (
                Boolean(user) &&
                Boolean(client) &&
                user.clientId === client.id
            ) {
                return client;
            } else {
                throw new AuthenticationError("Unauthorized");
            }
        }
    },
    Mutation: {
        async uploadFilesWithClientId(parent, { files, clientId }, { user }) {
            checkUserLogin(user);
            try {
                return await new Promise(async (resolve, reject) => {
                    let output = [];
                    asyncForEach(files, async file => {
                        try {
                            output.push(
                                await processUploadMedia(
                                    file,
                                    clientId,
                                    "image"
                                )
                            );
                            output.length === files.length && resolve(output);
                        } catch (err) {
                            reject(err);
                        }
                    });
                }).then(data => {
                    return data;
                });
            } catch (e) {
                throw new UserInputError(e);
            }
        },

        async deleteFiles(parent, { media }, { user }) {
            checkUserLogin(user);
            console.log(media);

            try {
                return await new Promise(async (resolve, reject) => {
                    let output = [];
                    asyncForEach(media, async each => {
                        try {
                            output.push(
                                await processDeleteMedia(each.key, each.id)
                            );
                            output.length === media.length && resolve(output);
                        } catch (err) {
                            reject(err);
                        }
                    });
                }).then(data => {
                    return data && { result: true };
                });
            } catch (e) {
                throw new UserInputError(e);
            }

            console.log(data);
            return { result: true };
        },

        createClient: async (
            _root,
            {
                input: {
                    name,
                    full_company_name = "",
                    nature_of_business,
                    venue_address,
                    venue_city,
                    venue_zip_code,
                    venue_state_id,
                    postal_address,
                    postal_city,
                    postal_zip_code,
                    postal_state_id,
                    phone,
                    email,
                    number_of_users,
                    file
                }
            },
            { user, clientIp }
        ) => {
            /**
             * Dummy avatar link
             */
            // const avatar =
            //     "https://s3-ap-southeast-2.amazonaws.com/digitalconcierge/cms_users/Holiday_Inn_Logo.png";
            // const venue_state = await db.state.findByPk(venue_state_id);
            // const postal_state = await db.state.findByPk(postal_state_id);
            // let create_client = db.client.build({
            //     name: full_company_name,
            //     full_company_name,
            //     nature_of_business,
            //     venue_address,
            //     venue_city,
            //     venue_zip_code,
            //     postal_address,
            //     postal_city,
            //     postal_zip_code,
            //     phone,
            //     email,
            //     number_of_users,
            //     avatar,
            //     venueStateId: venue_state.id,
            //     postalStateId: postal_state.id
            // });
            // await create_client.save();
            // return create_client;

            return new Promise((resolve, reject) => {
                processUpload(file).then(async data => {
                    let create_client = db.client.build({
                        name,
                        full_company_name,
                        nature_of_business,
                        venue_address,
                        venue_city,
                        venue_zip_code,
                        postal_address,
                        postal_city,
                        postal_zip_code,
                        phone,
                        email,
                        number_of_users,
                        avatar: data.location,
                        venueStateId: venue_state_id,
                        postalStateId: postal_state_id
                    });

                    await create_client.save();

                    handleCreateActionActivityLog(
                        create_client,
                        {
                            name,
                            full_company_name,
                            nature_of_business,
                            venue_address,
                            venue_city,
                            venue_zip_code,
                            postal_address,
                            postal_city,
                            postal_zip_code,
                            phone,
                            email,
                            number_of_users,
                            avatar: data.location,
                            venueStateId: venue_state_id,
                            postalStateId: postal_state_id
                        },
                        user,
                        clientIp
                    );

                    /**
                     * Add department relationships here
                     */
                    const departments = await db.department.findAll({
                        where: {
                            is_standard_department: true
                        }
                    });

                    //Duplicate standard roles here
                    await asyncForEach(departments, async department => {
                        const roles = await db.role.findAll({
                            where: {
                                departmentId: department.id,
                                is_standard_role: true
                            }
                        });

                        await asyncForEach(roles, async role => {
                            const duplicateRole = db.role.build({
                                name: role.name,
                                is_standard_role: false, //We do not want to duplicate these roles again in the future
                                departmentId: role.departmentId,
                                clientId: create_client.id
                            });

                            try {
                                await duplicateRole.save();
                            } catch (error) {
                                throw new UserInputError(
                                    `Unable to duplicate standard role ${name}.\nError Message: ${
                                        error.message
                                    }`
                                );
                            }

                            //Duplicating permissions assigned to standard roles
                            const permissions = await role.getPermissions();

                            //Try to assign same permissions to the duplicated permissions
                            try {
                                await duplicateRole.setPermissions(permissions);
                            } catch (error) {
                                throw new UserInputError(
                                    `Unable to duplicate permissions for role ID ${
                                        duplicateRole.id
                                    }.\nError message: ${error.message}`
                                );
                            }
                        });
                    });

                    try {
                        await create_client.addDepartments(departments);
                    } catch (error) {
                        throw new UserInputError(
                            `Unable to assign standard departments to client.\nError Message: ${
                                error.message
                            }`
                        );
                    }

                    resolve(await db.client.findByPk(create_client.id));
                });
            });
        },
        updateClient: async (
            _root,
            {
                input: {
                    id,
                    name,
                    full_company_name = "",
                    nature_of_business,
                    venue_address,
                    venue_city,
                    venue_zip_code,
                    venue_state_id,
                    postal_address,
                    postal_city,
                    postal_zip_code,
                    postal_state_id,
                    phone,
                    email
                }
            },
            { user, clientIp }
        ) => {
            const client = await db.client.findByPk(id);
            try {
                await client.update({
                    name,
                    full_company_name,
                    nature_of_business,
                    venue_address,
                    venue_city,
                    venue_zip_code,
                    postal_address,
                    postal_city,
                    postal_zip_code,
                    phone,
                    email,
                    venueStateId: venue_state_id,
                    postalStateId: postal_state_id
                });
            } catch (error) {
                throw new UserInputError(
                    `Unable to update Client ${id}.\nError Message: ${
                        error.message
                    }`
                );
            }

            //Console logging changes
            handleUpdateActionActivityLog(client, {}, user, clientIp);

            return await db.client.findByPk(id);
        },
        cancelClient: async (_root, { id }, { user, clientIp }) => {
            const client = await db.client.findByPk(id);
            if (!Boolean(client)) {
                //Client not found
                throw new UserInputError(
                    `Client ID ${id} was not found. Please try again.`
                );
            }
            // console.log(Object.keys(client.__proto__));

            //Deleting all users
            const users = await client.getUsers();
            await asyncForEach(users, async user => {
                try {
                    await user.destroy();
                } catch (error) {
                    throw new UserInputError(
                        `Unable to delete user ${user.id}.\nError: ${
                            error.message
                        }`
                    );
                }
            });

            //Deleting all license
            const licenses = await client.getLicenses();
            await asyncForEach(licenses, async license => {
                try {
                    await license.destroy();
                } catch (error) {
                    throw new UserInputError(
                        `Unable to delete license ${license.id}.\nError: ${
                            error.message
                        }`
                    );
                }
            });
            //Deleting all contracts
            const contracts = await client.getContracts();
            await asyncForEach(contracts, async contract => {
                const contractKey = contract.file_key;
                try {
                    await contract.destroy();
                } catch (error) {
                    throw new UserInputError(
                        `Unable to delete contract ${contract.id}.\nError: ${
                            error.message
                        }`
                    );
                }

                //Delete actual contract file
                await processDelete(contractKey);
            });

            //Deleting all payments
            const payments = await client.getPayments();
            await asyncForEach(payments, async payment => {
                try {
                    await payment.destroy();
                } catch (error) {
                    throw new UserInputError(
                        `Unable to delete payment ${payment.id}.\nError: ${
                            error.message
                        }`
                    );
                }
            });

            //Deleting all roles
            const roles = await client.getRoles();
            await asyncForEach(roles, async role => {
                //Removing all permissions from this role
                const permissions = await role.getPermissions();
                try {
                    await role.removePermissions(permissions);
                } catch (error) {
                    throw new UserInputError(
                        `Unable to remove permissions for role ${
                            role.id
                        }.\nError: ${error.message}`
                    );
                }

                //Delete the role
                try {
                    await role.destroy();
                } catch (error) {
                    throw new UserInputError(
                        `Unable to delete role ${role.id}.\nError: ${
                            error.message
                        }`
                    );
                }
            });

            //Deleting all departments
            const departments = await client.getDepartments();
            try {
                await client.removeDepartments(departments);
            } catch (error) {
                throw new UserInputError(
                    `Unable to remove departments for client ID: ${id}.\nError: ${
                        error.message
                    }`
                );
            }

            //Deleting all systems
            const systems = await client.getSystems();
            await asyncForEach(systems, async system => {
                //Deleting all themes
                const theme = await system.getTheme();
                try {
                    await theme.destroy();
                } catch (error) {
                    throw new UserInputError(
                        `Unable to delete theme ${theme.id}.\nError: ${
                            error.message
                        }`
                    );
                }

                //Deleting all features
                const features = await system.getFeatures();
                try {
                    await system.removeFeatures(features);
                } catch (error) {
                    throw new UserInputError(
                        `Unable to delete features for system ID: ${
                            system.id
                        }.\nError: ${error.message}`
                    );
                }

                //Delete the system
                try {
                    await system.destroy();
                } catch (error) {
                    throw new UserInputError(
                        `Unable to delete system ${system.id}.\nError: ${
                            error.message
                        }`
                    );
                }
            });

            //Deleting all media
            const media = await client.getMedia();
            await asyncForEach(media, async medium => {
                try {
                    await medium.destroy();
                } catch (error) {
                    throw new UserInputError(
                        `Unable to delete Media ${medium.id}.\nError: ${
                            error.message
                        }`
                    );
                }
            });

            //Finally attempt to delete client
            try {
                await client.destroy();
                return true;
            } catch (error) {
                throw new UserInputError(
                    `Unable to delete Client ${client.id}.\nError: ${
                        error.message
                    }`
                );
            }
        }
    },
    Client: {
        users: async client =>
            await db.user.findAll({ where: { clientId: client.id } }),
        departments: async client => {
            const departments = await db.department.findAll({
                include: [
                    {
                        model: db.client,
                        where: { id: client.id }
                    }
                ]
            });
            // console.log("Sample data: ", await departments[0].getRoles());
            return departments;
        },
        guests: async client =>
            await db.guest.findAll({ where: { clientId: client.id } }),
        rooms: async client =>
            await db.room.findAll({ where: { clientId: client.id } }),
        systems: async client =>
            await db.system.findAll({ where: { clientId: client.id } }),
        media: async client =>
            await db.media.findAll({ where: { clientId: client.id } }),
        devices: async client =>
            await db.device.findAll({ where: { clientId: client.id } }),
        contacts: async client =>
            await db.contact.findAll({ where: { clientId: client.id } }),
        active_contract: async client => {
            const contracts = await db.contract.findAll({
                where: { clientId: client.id, active: true },
                order: [["createdAt", "DESC"]]
            });
            return contracts.length > 0 ? contracts[0] : null;
        },
        contracts: async client =>
            await db.contract.findAll({ where: { clientId: client.id } }),
        venue_state: async client =>
            await db.state.findByPk(client.venueStateId),
        postal_state: async client =>
            await db.state.findByPk(client.postalStateId),
        payments: async client =>
            await db.payment.findAll({ where: { clientId: client.id } }),
        licenses: async client =>
            await db.license.findAll({
                where: { clientId: client.id },
                order: [["expire_date", "DESC"]]
            }),
        activeLicense: async client =>
            await db.license.findAll({
                where: { clientId: client.id, active: true },
                limit: 1,
                order: [["createdAt", "DESC"]]
            }),
        key_user: async client => {
            const users = await db.user.findAll({
                where: { clientId: client.id },
                limit: 1,
                order: [["createdAt", "ASC"]]
            });
            return Boolean(users) && Array.isArray(users) && users.length === 1
                ? users[0]
                : null;
        },
        roles: async client =>
            await db.role.findAll({ where: { clientId: client.id } }),
        palettes: async ({ id }) =>
            await db.palette.findAll({ where: { clientId: id } })
    }
};
