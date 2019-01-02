"use strict";
module.exports = (sequelize, DataTypes) => {
    const start = sequelize.define(
        "start",
        {
            name: DataTypes.STRING
        },
        {}
    );
    start.associate = function(models) {
        start.belongsTo(models.layout, {
            foreignKey: { allowNull: false }
        });
        start.hasMany(models.system);
        start.belongsToMany(models.media, {
            through: "media_starts"
        });
    };
    return start;
};
