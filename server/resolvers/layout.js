import db from "../models";

export default {
    Query: {
        layout: async (_root, { id }) => {
            return await db.layout.findByPk(id);
        },
        layouts: async (_root, _input, { user }) => {
            return await db.layout.findAll();
        }
    },
    Layout: {
        templates: async layout =>
            await db.template.findAll({
                include: [
                    {
                        model: db.layout,
                        where: { id: layout.id }
                    }
                ]
            }),
        media: async layout => await db.media.findByPk(layout.mediumId)
    }
};
