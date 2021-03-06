"use strict";
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable("directory_lists", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            },
            title: {
                type: Sequelize.TEXT,
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            },
            title_plaintext: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            },
            description: {
                type: Sequelize.TEXT
            },
            is_root: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                validate: {
                    notEmpty: true
                },
                defaultValue: false
            },
            active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                validate: {
                    notEmpty: true
                },
                defaultValue: true
            },
            order: {
                type: Sequelize.INTEGER,
                allowNull: false,
                validate: {
                    notEmpty: true
                },
                defaultValue: 0
            },
            colour1Hex: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true
                },
                defaultValue: "#FFFFFF"
            },
            colour1Alpha: {
                type: Sequelize.INTEGER,
                allowNull: false,
                validate: {
                    notEmpty: true
                },
                defaultValue: 100
            },
            colour2Hex: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true
                },
                defaultValue: "#FFFFFF"
            },
            colour2Alpha: {
                type: Sequelize.INTEGER,
                allowNull: false,
                validate: {
                    notEmpty: true
                },
                defaultValue: 100
            },
            colour3Hex: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true
                },
                defaultValue: "#FFFFFF"
            },
            colour3Alpha: {
                type: Sequelize.INTEGER,
                allowNull: false,
                validate: {
                    notEmpty: true
                },
                defaultValue: 100
            },
            colour4Hex: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true
                },
                defaultValue: "#FFFFFF"
            },
            colour4Alpha: {
                type: Sequelize.INTEGER,
                allowNull: false,
                validate: {
                    notEmpty: true
                },
                defaultValue: 100
            },
            colour5Hex: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true
                },
                defaultValue: "#FFFFFF"
            },
            colour5Alpha: {
                type: Sequelize.INTEGER,
                allowNull: false,
                validate: {
                    notEmpty: true
                },
                defaultValue: 100
            },
            sortBy: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true
                },
                defaultValue: "createdAt"
            },
            orderBy: {
                type: Sequelize.ENUM("ASC", "DESC"),
                allowNull: false,
                validate: {
                    notEmpty: true
                },
                defaultValue: "ASC"
            },
            directoryListId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "directory_lists", // name of Target table
                    key: "id" // key in Target table that we're referencing
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE"
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("NOW()")
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("NOW()")
            }
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable("directory_lists");
    }
};
