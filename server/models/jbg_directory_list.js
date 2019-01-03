"use strict";
module.exports = (sequelize, DataTypes) => {
    const jbg_directory_list = sequelize.define(
        "jbg_directory_list",
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            },
            is_root: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                validate: {
                    notEmpty: true
                },
                defaultValue: false
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                validate: {
                    notEmpty: true
                },
                defaultValue: true
            },
            jbg_directory_list_id: DataTypes.INTEGER
        },
        {}
    );
    jbg_directory_list.associate = function(models) {
        jbg_directory_list.belongsTo(models.jbg_directory_list, {
            foreignKey: { allowNull: true }
        });
        jbg_directory_list.belongsTo(models.layout, {
            foreignKey: { allowNull: true }
        });
        jbg_directory_list.belongsToMany(models.media, {
            through: "jbg_directory_lists_media"
        });
        jbg_directory_list.belongsToMany(models.jbg_directory_entry, {
            through: "jbg_directory_entries_jbg_directory_lists"
        });
    };
    return jbg_directory_list;
};
