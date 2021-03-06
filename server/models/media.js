"use strict";
module.exports = (sequelize, DataTypes) => {
    const media = sequelize.define(
        "media",
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            },
            key: {
                type: DataTypes.STRING
            },
            size: {
                type: DataTypes.DECIMAL,
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            },
            path: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            },
            type: {
                type: DataTypes.ENUM("image", "video"),
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            }
        },
        {}
    );
    media.associate = function(models) {
        media.belongsToMany(models.jbg_welcome, {
            through: "jbg_welcomes_media"
        });
        media.belongsToMany(models.start, {
            through: "media_starts",
            as: "startMedia"
        });
        media.belongsToMany(models.start, {
            through: "homes_media"
        });
        media.belongsToMany(models.gallery, {
            through: "galleries_media"
        });
        media.belongsToMany(models.map, {
            through: "maps_media"
        });
        media.belongsToMany(models.directory_list, {
            through: "directory_lists_media"
        });
        media.belongsToMany(models.directory_entry, {
            through: "directory_entries_media"
        });
        media.belongsToMany(models.jbg_map, {
            through: "jbg_maps_media"
        });
        media.belongsToMany(models.jbg_directory_list, {
            through: "jbg_directory_lists_media",
            as: "jbgDirectoryListMedia"
        });
        media.belongsToMany(models.jbg_directory_entry, {
            through: "jbg_directory_entries_media"
        });
        media.belongsToMany(models.system, {
            through: "media_systems"
        });
        media.hasOne(models.layout);
        media.belongsTo(models.client, {
            foreignKey: { allowNull: false }
        });
        media.hasMany(models.user);
        media.belongsToMany(models.just_brilliant_guide, {
            through: "just_brilliant_guides_media"
        });
        media.hasMany(models.jbg_layout_family);
        media.hasMany(models.jbg_layout);
        media.hasMany(models.advertising);
        media.hasMany(models.article, { foreignKey: "headerMediumId" });
        media.hasMany(models.article, { foreignKey: "featureMediumId" });
    };
    return media;
};
