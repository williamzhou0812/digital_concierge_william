import db from "../models";

export default {
    Query: {
        system: async (_root, { id }) => await db.system.findByPk(id),
        systems: async (_root, _input, { user }) => await db.system.findAll(),
        systemsByClient: async (_root, { id }) =>
            await db.system.findAll({ where: { clientId: id } })
    },
    System: {
        client: async system => await db.client.findByPk(system.clientId),
        devices: async system =>
            await db.device.findAll({ where: { systemId: system.id } }),
        just_brilliant_guide: async system =>
            await db.just_brilliant_guide.findByPk(system.justBrilliantGuideId),
        layouts: async system =>
            await db.layout.findAll({
                include: [
                    {
                        model: db.system,
                        where: { id: system.id }
                    }
                ]
            }),
        start: async system => await db.start.findByPk(system.startId),
        home: async system => await db.home.findByPk(system.homeId),
        galleries: async system =>
            await db.gallery.findAll({
                include: [
                    {
                        model: db.system,
                        where: { id: system.id }
                    }
                ]
            }),
        maps: async system =>
            await db.map.findAll({
                include: [
                    {
                        model: db.system,
                        where: { id: system.id }
                    }
                ]
            }),
        directory_lists: async system =>
            await db.directory_list.findAll({
                include: [
                    {
                        model: db.system,
                        where: { id: system.id }
                    }
                ]
            })
    }
};