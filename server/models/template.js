"use strict";
module.exports = (sequelize, DataTypes) => {
    const template = sequelize.define(
        "template",
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            }
        },
        {}
    );
    template.associate = function(models) {
        template.belongsToMany(models.layout, {
            through: "layouts_templates"
        });
        template.belongsToMany(models.validation, {
            through: "templates_validations"
        });
        template.belongsTo(models.template_type, {
            foreignKey: { allowNull: false }
        });
        template.hasMany(models.directory_list);
        template.hasMany(models.directory_entry);
        template.hasMany(models.start);
        template.hasMany(models.home);
    };
    return template;
};
