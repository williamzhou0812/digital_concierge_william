"use strict";

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn(
            "clients", // name of Source table
            "venueStateId", // name of the key we're adding
            {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "states", // name of Target table
                    key: "id" // key in Target table that we're referencing
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE"
            }
        );
    },

    down: (queryInterface, _Sequelize) => {
        return queryInterface.removeColumn(
            "clients", // name of Source table
            "venueStateId" // key we want to remove
        );
    }
};
