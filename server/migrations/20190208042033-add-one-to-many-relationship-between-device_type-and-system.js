"use strict";

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn(
            "systems", // name of Source table
            "deviceTypeId", // name of the key we're adding
            {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "device_types", // name of Target table
                    key: "id" // key in Target table that we're referencing
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE"
            }
        );
    },

    down: queryInterface => {
        return queryInterface.removeColumn(
            "systems", // name of Source table
            "deviceTypeId" // key we want to remove
        );
    }
};
