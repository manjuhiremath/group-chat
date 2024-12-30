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

export const inviteToGroup = async (req, res) => {
    const { groupId, userId, adminId } = req.body;

    if (!groupId || !userId || !adminId) {
        return res.status(400).json({ error: "groupId, userId, and adminId are required" });
    }

    try {
        const group = await Groups.findByPk(groupId);

        if (!group || group.adminId !== adminId) {
            return res.status(403).json({ error: "Only the admin can invite users to this group" });
        }

        await GroupMembers.create({ groupId, userId });
        return res.status(201).json({ success: true, message: "User invited successfully" });
    } catch (error) {
        console.error("Error inviting user to group:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const getUserGroups = async (req, res) => {
    const userId = req.params.userId;

    try {
        const groups = await GroupMembers.findAll({
            where: { userId },
            include: [{ model: Groups, attributes: ['id', 'name'] }],
        });

        return res.status(200).json({ success: true, data: groups });
    } catch (error) {
        console.error("Error fetching user groups:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const sendGroupMessage = async (req, res) => {
    const { groupId, senderId, message } = req.body;

    if (!groupId || !senderId || !message) {
        return res.status(400).json({ error: "groupId, senderId, and message are required" });
    }

    try {
        const isMember = await GroupMembers.findOne({ where: { groupId, userId: senderId } });

        if (!isMember) {
            return res.status(403).json({ error: "You are not a member of this group" });
        }

        const newMessage = await Messages.create({ groupId, senderId, message });
        return res.status(201).json({ success: true, message: "Message sent successfully", data: newMessage });
    } catch (error) {
        console.error("Error sending message:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const getGroupMessages = async (req, res) => {
    const { groupId } = req.params;
    const lastTimestamp = req.query.lastTimestamp;

    try {
        const messageFilter = { groupId };
        if (lastTimestamp) {
            messageFilter.createdAt = { [Op.gt]: new Date(lastTimestamp) };
        }

        const messages = await Messages.findAll({
            where: messageFilter,
            order: [["createdAt", "ASC"]],
        });

        return res.status(200).json({ success: true, data: messages });
    } catch (error) {
        console.error("Error fetching group messages:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
