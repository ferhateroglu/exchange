"use strict";

module.exports = {
    up: (queryInterface, Sequelize) =>
        queryInterface.createTable("Orders", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            userId: {
                type: Sequelize.INTEGER,
                references: { model: "Users", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
                allowNull: false,
            },
            shareId: {
                type: Sequelize.INTEGER,
                references: { model: "Shares", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
                allowNull: false,
            },
            amount: {
                type: Sequelize.INTEGER,
            },
            price: {
                type: Sequelize.DECIMAL(10, 2),
            },
            type: {
                type: Sequelize.BOOLEAN,
            },
            status: {
                type: Sequelize.BOOLEAN,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: new Date(),
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: new Date(),
            },

        }),

    down: (queryInterface) => queryInterface.dropTable("Orders"),
};
