import db from "../models";

export default {
    Query: {
        permission: async (root, { id }, { user }) => {
            //if user is not logged in
            if (!user) {
                throw new AuthenticationError("Unauthorized");
            }
            return await db.permission.findByPk(id);
        },

        permissions: async (oot, input, { user }) => {
            //if user is not logged in
            if (!user) {
                throw new AuthenticationError("Unauthorized");
            }

            return await db.permission.findAll();
        }
    },
    Permission: {
        roles: async permission =>
            await db.role.findAll({
                include: [
                    {
                        model: db.permission,
                        where: { id: permission.id }
                    }
                ]
            }),
        permission_category: async permission =>
            await db.permission_category.findByPk(
                permission.permissionCategoryId
            )
    }
};
