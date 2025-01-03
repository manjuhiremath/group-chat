import { Chat } from "../models/ChatModel.js";
import { Users } from "../models/User.js";
import { Op } from "sequelize"; // Import Sequelize operators

// Controller to send chat
export const SendChat = async (req, res) => {
    const { userId, message } = req.body;

    if (!userId || !message) {
        return res.status(400).json({ error: "userId and message are required" });
    }

    try {
        const user = await Users.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const chat = await Chat.create({ UserId: userId, message });

        return res.status(201).json({
            success: true,
            message: "Chat message stored successfully",
            data: chat,
        });
    } catch (error) {
        console.error("Error storing chat message:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Controller to get user chats
export const getUserChats = async (req, res) => {
    const userId = req.params.id;
    const lastTimestamp = req.query.lastTimestamp; // Optional timestamp for filtering new chats

    try {
        // Check if the user exists
        const user = await Users.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Filter for chats
        const chatFilter = { UserId: userId };
        if (lastTimestamp) {
            chatFilter.createdAt = { [Op.gt]: new Date(lastTimestamp) }; // Filter chats newer than lastTimestamp
        }

        const chats = await Chat.findAll({
            where: chatFilter,
            order: [["createdAt", "ASC"]], // Order chats by creation time
        });

        // Return chats or an empty array
        return res.status(200).json({ success: true, data: chats });
    } catch (error) {
        console.error("Error fetching chats:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

