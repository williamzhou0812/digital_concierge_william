"use strict";

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn(
            "jbg_layouts", // name of Source table
            "jbgLayoutFamilyId", // name of the key we're adding
            {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "jbg_layout_families", // name of Target table
                    key: "id" // key in Target table that we're referencing
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE"
            }
        );
    },

    down: (queryInterface, _Sequelize) => {
        return queryInterface.removeColumn(
            "jbg_layouts", // name of Source table
            "jbgLayoutFamilyId" // key we want to remove
        );
    }
};
