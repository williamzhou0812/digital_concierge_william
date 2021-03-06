import db from "../models";
import {
    checkUserLogin,
    checkUserJBG,
    processUploadMedia,
    handleCreateActionActivityLog,
    handleUpdateActionActivityLog
} from "../utils/constant";
import { UserInputError } from "apollo-server-express";

export default {
    Query: {
        justBrilliantGuide: async (_root, { id }) => {
            const guide = await db.just_brilliant_guide.findByPk(id);
            // console.log(Object.keys(guide.__proto__));
            return guide;
        },
        justBrilliantGuides: async (_root, _input, { user }) => {
            return await db.just_brilliant_guide.findAll();
        },
        justBrilliantGuideFromAdvertiser: async (_root, { id }) => {
            const advertiser = await db.advertiser.findByPk(id);
            if (!Boolean(advertiser)) {
                return null;
            } else {
                return await db.just_brilliant_guide.findByPk(
                    advertiser.justBrilliantGuideId
                );
            }
        }
    },
    Mutation: {
        createJustBrilliantGuide: async (
            _root,
            {
                input: {
                    name,
                    welcomeFamilyId,
                    featureFamilyId,
                    informationFamilyId,
                    mapFamilyId,
                    galleryFamilyId,
                    marketFamilyId,
                    foodFamilyId,
                    attractionFamilyId,
                    eventFamilyId,
                    essentialFamilyId,
                    image
                }
            },
            { user, clientIp }
        ) => {
            await checkUserLogin(user);
            await checkUserJBG(user);

            //Handle upload image
            const uploaded = await processUploadMedia(
                image,
                user.clientId,
                "image"
            );

            //Create just brilliant guide
            let created = db.just_brilliant_guide.build({
                name,
                welcomeFamilyId,
                featureFamilyId,
                informationFamilyId,
                mapFamilyId,
                galleryFamilyId,
                marketFamilyId,
                foodFamilyId,
                attractionFamilyId,
                eventFamilyId,
                essentialFamilyId
            });

            try {
                await created.save();
            } catch (e) {
                throw new UserInputError(e);
            }

            try {
                //Assign media
                await created.addMedia(uploaded);
            } catch (error) {
                throw new UserInputError(
                    `Assign publication ${name} to image failed.\nError Message: ${
                        error.message
                    }`
                );
            }

            //Activity Log
            handleCreateActionActivityLog(
                created,
                {
                    name,
                    welcomeFamilyId,
                    featureFamilyId,
                    informationFamilyId,
                    mapFamilyId,
                    galleryFamilyId,
                    marketFamilyId,
                    foodFamilyId,
                    attractionFamilyId,
                    eventFamilyId,
                    essentialFamilyId,
                    mediaId: uploaded.id
                },
                user,
                clientIp
            );

            return created;
        },
        editJustBrilliantGuide: async (
            _root,
            {
                input: {
                    id,
                    name,
                    welcomeFamilyId,
                    featureFamilyId,
                    informationFamilyId,
                    mapFamilyId,
                    galleryFamilyId,
                    marketFamilyId,
                    foodFamilyId,
                    attractionFamilyId,
                    eventFamilyId,
                    essentialFamilyId,
                    image = null
                }
            },
            { user, clientIp }
        ) => {
            await checkUserLogin(user);
            await checkUserJBG(user);

            if (!(await db.just_brilliant_guide.findByPk(id))) {
                //Check if guide exists in the first place
                throw new UserInputError(
                    `Just Brilliant Guide ID ${id} does not exist`
                );
            }

            try {
                await db.just_brilliant_guide.update(
                    {
                        name,
                        welcomeFamilyId,
                        featureFamilyId,
                        informationFamilyId,
                        mapFamilyId,
                        galleryFamilyId,
                        marketFamilyId,
                        foodFamilyId,
                        attractionFamilyId,
                        eventFamilyId,
                        essentialFamilyId
                    },
                    { where: { id } }
                );
            } catch (error) {
                throw new UserInputError("Error updating guide: ", error);
            }

            const updated = await db.just_brilliant_guide.findByPk(id);
            let uploaded = null;

            //Delete previous images
            try {
                const to_delete_images = await updated.getMedia();

                if (Boolean(image)) {
                    try {
                        //Remove relationship between list and previous image in DB
                        await updated.removeMedia(to_delete_images);
                    } catch (errorRemoveMedia) {
                        throw new UserInputError(
                            "Error removing previous media relationship ",
                            errorRemoveMedia
                        );
                    }

                    try {
                        //Handle upload image
                        uploaded =
                            Boolean(image) &&
                            (await processUploadMedia(
                                image,
                                user.clientId,
                                "image"
                            ));

                        Boolean(uploaded) && (await updated.addMedia(uploaded));
                    } catch (errorUploadMedia) {
                        throw new UserInputError(
                            "Error uploading & assigning media ",
                            errorUploadMedia
                        );
                    }
                }
            } catch (error) {
                throw new UserInputError(error);
            }

            handleUpdateActionActivityLog(
                updated,
                {
                    id,
                    name,
                    welcomeFamilyId,
                    featureFamilyId,
                    informationFamilyId,
                    mapFamilyId,
                    galleryFamilyId,
                    marketFamilyId,
                    foodFamilyId,
                    attractionFamilyId,
                    eventFamilyId,
                    essentialFamilyId,
                    ...(Boolean(image) && { mediaId: uploaded.id })
                },
                user,
                clientIp
            );

            return updated;
        },
        duplicateJustBrilliantGuide: async (
            _root,
            { id },
            { user, clientIp }
        ) => {
            const originalGuide = await db.just_brilliant_guide.findOne({
                where: { id },
                raw: true
            });
            if (!originalGuide) {
                throw new UserInputError(
                    `Just Brilliant Guide ID ${id} does not exist`
                );
            }
            const { id: _id, name, ...tempGuide } = originalGuide;

            //Set name to have copy
            const regex = /\s*copy/gim;
            const clearedName = name.replace(regex, "");
            // console.log("Cleared Name ", clearedName);

            const otherGuides = await db.just_brilliant_guide.findAll({
                where: { name: { [db.op.startsWith]: clearedName } }
            });

            // console.log("Other guides length ", otherGuides.length);

            const finalName = `${clearedName} COPY ${otherGuides.length + 1}`;
            // console.log("FINAL NAME ", finalName);

            //Duplicating guide
            let duplicateGuide = db.just_brilliant_guide.build({
                name: finalName,
                ...tempGuide
            });
            try {
                await duplicateGuide.save();
            } catch (error) {
                throw new UserInputError(
                    `Unable to duplicate Guide ${id}: `,
                    error
                );
            }

            //Duplicating Guide Media file(s)
            const originalMedia = await db.media.findAll({
                include: [
                    {
                        model: db.just_brilliant_guide,
                        where: { id }
                    }
                ]
            });
            let mediaIds = [];
            if (Array.isArray(originalMedia) && originalMedia.length > 0) {
                for await (const media of originalMedia) {
                    try {
                        await duplicateGuide.addMedia(media);
                    } catch (error) {
                        throw new UserInputError(
                            `Unable to link publication duplicate Id of ${
                                duplicateGuide.id
                            } to media ID ${media.id}: `,
                            error
                        );
                    }
                    mediaIds.push(media.id);
                }
            }

            handleCreateActionActivityLog(
                duplicateGuide,
                { name: finalName, ...tempGuide, media: [...mediaIds] },
                user,
                clientIp
            );

            if (!duplicateGuide || !duplicateGuide.id) {
                throw new UserInputError(
                    `Unable to duplicate Advertiser ${originalId}: `,
                    error
                );
            }

            //Duplicating advertisers
            let originalAdvertiserIdToDuplicateId = {};
            // let duplicateAdvertiserIdToOriginalId = {};
            const originalAdvertisers = await db.advertiser.findAll({
                where: { justBrilliantGuideId: id },
                raw: true
            });
            if (
                Array.isArray(originalAdvertisers) &&
                originalAdvertisers.length > 0
            ) {
                for await (const originalAdvertiser of originalAdvertisers) {
                    const { id: originalId, ...temp } = originalAdvertiser;
                    const tempAdvertiser = Object.assign(temp, {
                        justBrilliantGuideId: duplicateGuide.id
                    });
                    let duplicateAdvertiser = db.advertiser.build({
                        ...tempAdvertiser
                    });
                    try {
                        await duplicateAdvertiser.save();
                        originalAdvertiserIdToDuplicateId = Object.assign(
                            originalAdvertiserIdToDuplicateId,
                            { [originalId]: duplicateAdvertiser.id }
                        );
                        // duplicateAdvertiserIdToOriginalId = Object.assign(
                        //     duplicateAdvertiserIdToOriginalId,
                        //     { [duplicateAdvertiser.id]: originalId }
                        // );
                    } catch (error) {
                        throw new UserInputError(
                            `Unable to duplicate Advertiser ${originalId}: `,
                            error
                        );
                    }
                    handleCreateActionActivityLog(
                        duplicateAdvertiser,
                        { ...tempAdvertiser },
                        user,
                        clientIp
                    );
                }
            }

            //Duplicating articles
            let originalArticleIdToDuplicateId = {};
            // let duplicateArticleIdToOriginalId = {};
            const originalArticles = await db.article.findAll({
                where: { justBrilliantGuideId: id },
                raw: true
            });
            if (
                Array.isArray(originalArticles) &&
                originalArticles.length > 0
            ) {
                for await (const originalArticle of originalArticles) {
                    const { id: originalId, ...temp } = originalArticle;
                    const tempArticle = Object.assign(temp, {
                        justBrilliantGuideId: duplicateGuide.id
                    });
                    let duplicateArticle = db.article.build({ ...tempArticle });
                    try {
                        await duplicateArticle.save();
                        originalArticleIdToDuplicateId = Object.assign(
                            originalArticleIdToDuplicateId,
                            { [originalId]: duplicateArticle.id }
                        );
                        // duplicateArticleIdToOriginalId = Object.assign(
                        //     duplicateArticleIdToOriginalId,
                        //     { [duplicateArticle.id]: originalId }
                        // );
                    } catch (error) {
                        throw new UserInputError(
                            `Unable to duplicate Article ${originalId}: `,
                            error
                        );
                    }
                    handleCreateActionActivityLog(
                        duplicateArticle,
                        { ...tempArticle },
                        user,
                        clientIp
                    );
                }
            }

            //Duplicating advertisings
            let originalAdvertisingIdToDuplicateId = {};
            let originalAdvertisingIdList = [];
            for await (const originalAdvertiser of originalAdvertisers) {
                const { id: advertiserId } = originalAdvertiser;
                const originalAdvertisings = await db.advertising.findAll({
                    where: { advertiserId },
                    raw: true
                });

                const duplicateAdvertiserId =
                    originalAdvertiserIdToDuplicateId[advertiserId];
                const duplicateAdvertiser = Boolean(duplicateAdvertiserId)
                    ? await db.advertiser.findByPk(duplicateAdvertiserId)
                    : null;
                if (!duplicateAdvertiser) {
                    throw new UserInputError(
                        `Unable to find advertiser duplicate Id of ${duplicateAdvertiserId} (original ID: ${advertiserId}): `,
                        error
                    );
                }

                if (
                    Array.isArray(originalAdvertisings) &&
                    originalAdvertisings.length > 0
                ) {
                    for await (const originalAdvertising of originalAdvertisings) {
                        const { id: originalId, ...temp } = originalAdvertising;

                        const tempAdvertising = Object.assign(temp, {
                            advertiserId: duplicateAdvertiserId
                        });
                        let duplicateAdvertising = db.advertising.build({
                            ...tempAdvertising
                        });
                        try {
                            await duplicateAdvertising.save();
                            originalAdvertisingIdToDuplicateId = Object.assign(
                                originalAdvertisingIdToDuplicateId,
                                { [originalId]: duplicateAdvertising.id }
                            );
                        } catch (error) {
                            throw new UserInputError(
                                `Unable to duplicate Advertising ${originalId}: `,
                                error
                            );
                        }
                        originalAdvertisingIdList.push(originalId);
                        handleCreateActionActivityLog(
                            duplicateAdvertising,
                            { ...tempAdvertising },
                            user,
                            clientIp
                        );
                    }
                }
            }

            if (
                Array.isArray(originalArticles) &&
                originalArticles.length > 0
            ) {
                //Set duplicate advertising to duplicate article pivot table
                for await (const originalArticle of originalArticles) {
                    const { id: articleId } = originalArticle;
                    const originalAdvertisings = await db.advertising.findAll({
                        include: [
                            {
                                model: db.article,
                                where: { id: articleId }
                            }
                        ],
                        raw: true
                    });
                    const duplicateArticleId =
                        originalArticleIdToDuplicateId[articleId];
                    const duplicateArticle = Boolean(duplicateArticleId)
                        ? await db.article.findByPk(duplicateArticleId)
                        : null;

                    if (!duplicateArticle) {
                        throw new UserInputError(
                            `Unable to find article duplicate Id of ${duplicateArticleId} (original ID: ${articleId}): `,
                            error
                        );
                    }
                    let duplicateAdvertisingIds = [];
                    for await (const originalAdvertising of originalAdvertisings) {
                        const { id: advertisingId } = originalAdvertising;
                        const duplicateAdvertisingId =
                            originalAdvertisingIdToDuplicateId[advertisingId];
                        const duplicateAdvertising = Boolean(
                            duplicateAdvertisingId
                        )
                            ? await db.advertising.findByPk(
                                  duplicateAdvertisingId
                              )
                            : null;
                        if (!duplicateAdvertising) {
                            throw new UserInputError(
                                `Unable to find advertising duplicate Id of ${duplicateArticleId} (original ID: ${advertisingId}): `,
                                error
                            );
                        }
                        try {
                            await duplicateArticle.addAdvertising(
                                duplicateAdvertising
                            );
                        } catch (error) {
                            throw new UserInputError(
                                `Unable to link advertising duplicate Id of ${duplicateAdvertisingId} to article duplicate ID ${duplicateArticleId}: `,
                                error
                            );
                        }
                        duplicateAdvertisingIds.push(duplicateAdvertisingId);
                    }

                    handleUpdateActionActivityLog(
                        duplicateArticle,
                        { duplicateAdvertisingIds },
                        user,
                        clientIp
                    );
                }
            }

            //Duplicating payments
            if (originalAdvertisingIdList.length > 0) {
                for await (const advertisingId of originalAdvertisingIdList) {
                    const originalPayments = await db.payment.findAll({
                        where: { advertisingId },
                        raw: true
                    });
                    const duplicateAdvertisingId =
                        originalAdvertisingIdToDuplicateId[advertisingId];
                    const duplicateAdvertising = Boolean(duplicateAdvertisingId)
                        ? await db.advertising.findByPk(duplicateAdvertisingId)
                        : null;
                    if (!duplicateAdvertising) {
                        throw new UserInputError(
                            `Unable to find advertising duplicate Id of ${duplicateAdvertisingId} (original ID: ${advertisingId})`
                        );
                    }
                    if (
                        Array.isArray(originalPayments) &&
                        originalPayments.length > 0
                    ) {
                        for await (const originalPayment of originalPayments) {
                            const { id: paymentId, ...temp } = originalPayment;
                            const tempPayment = Object.assign(temp, {
                                advertisingId: duplicateAdvertisingId
                            });
                            let duplicatePayment = db.payment.build({
                                ...tempPayment
                            });
                            try {
                                await duplicatePayment.save();
                            } catch (error) {
                                throw new UserInputError(
                                    `Unable to duplicate Payment ${paymentId}: `,
                                    error
                                );
                            }
                            handleCreateActionActivityLog(
                                duplicatePayment,
                                { ...tempPayment },
                                user,
                                clientIp
                            );
                        }
                    }
                }
            }

            return duplicateGuide;
        }
    },
    JustBrilliantGuide: {
        jbg_welcome: async jbg =>
            await db.jbg_welcome.findByPk(jbg.jbgWelcomeId),
        systems: async jbg =>
            await db.system.findAll({
                include: [
                    {
                        model: db.just_brilliant_guide,
                        where: { id: jbg.id }
                    }
                ]
            }),
        jbg_maps: async jbg =>
            await db.jbg_map.findAll({
                include: [
                    {
                        model: db.just_brilliant_guide,
                        where: { id: jbg.id }
                    }
                ]
            }),
        jbg_directory_lists: async jbg =>
            await db.jbg_directory_list.findAll({
                include: [
                    {
                        model: db.just_brilliant_guide,
                        where: { id: jbg.id }
                    }
                ]
            }),
        media: async jbg =>
            await db.media.findAll({
                include: [
                    {
                        model: db.just_brilliant_guide,
                        where: { id: jbg.id }
                    }
                ]
            }),
        welcomeFamily: async jbg =>
            await db.jbg_layout_family.findByPk(jbg.welcomeFamilyId),
        featureFamily: async jbg =>
            await db.jbg_layout_family.findByPk(jbg.featureFamilyId),
        informationFamily: async jbg =>
            await db.jbg_layout_family.findByPk(jbg.informationFamilyId),
        mapFamily: async jbg =>
            await db.jbg_layout_family.findByPk(jbg.mapFamilyId),
        galleryFamily: async jbg =>
            await db.jbg_layout_family.findByPk(jbg.galleryFamilyId),
        marketFamily: async jbg =>
            await db.jbg_layout_family.findByPk(jbg.marketFamilyId),
        foodFamily: async jbg =>
            await db.jbg_layout_family.findByPk(jbg.foodFamilyId),
        attractionFamily: async jbg =>
            await db.jbg_layout_family.findByPk(jbg.attractionFamilyId),
        eventFamily: async jbg =>
            await db.jbg_layout_family.findByPk(jbg.eventFamilyId),
        essentialFamily: async jbg =>
            await db.jbg_layout_family.findByPk(jbg.essentialFamilyId),
        articles: async ({ id }) =>
            await db.article.findAll({ where: { justBrilliantGuideId: id } })
    }
};
