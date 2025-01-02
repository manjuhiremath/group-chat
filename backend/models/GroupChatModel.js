import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Groups = sequelize.define("Groups", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    adminId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
});

sequelize.sync();
