import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";


export const Chat = sequelize.define(
    "chats",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
        // unique: true,
      },
    }
  );
  
  
  
  sequelize.sync();