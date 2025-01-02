import { Chat } from "../models/ChatModel.js";
import { Groups } from "../models/GroupChatModel.js";
import { GroupMembers } from "../models/GroupMembersModel.js";
import { Messages } from "../models/MessageModel.js";
import { Users } from "../models/User.js";
import { Op } from "sequelize"; // Import Sequelize operators

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

export const getAvailableUsersForInvite = async (req, res) => {
    const { adminId, groupId } = req.params;

    if (!adminId || !groupId) {
        return res.status(400).json({ error: "adminId and groupId are required" });
    }

    try {
        const groupMembers = await GroupMembers.findAll({
            where: { groupId },
            attributes: ['userId'], 
        });

        const groupMemberIds = groupMembers.map(member => member.userId);

        const users = await Users.findAll({
            where: {
                id: {
                    [Op.and]: [
                        { [Op.ne]: adminId }, 
                        { [Op.notIn]: groupMemberIds }, 
                    ]
                }
            }
        });

        if (users.length === 0) {
            return res.status(404).json({ error: "No available users found to invite" });
        }

        return res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users for invite:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getUserGroups = async (req, res) => {
    const userId = req.params.userId;
    // console.log(userId);
    try {
        const groups = await Groups.findAll({
            where: { adminId: userId }
        });
        return res.status(200).json({ success: true, data: groups });
    } catch (error) {
        console.error("Error fetching user groups:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const sendGroupMessage = async (req, res) => {
    const { groupId, senderId, message } = req.body;
    console.log(groupId, senderId, message);
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
            include: [
                {
                    model: Users, // Assuming the `Users` model is associated with `Messages`
                    attributes: ["name"], // Retrieve the sender's name
                },
            ],
        });

        // Transform the data to include the sender name directly
        const formattedMessages = messages.map(message => ({
            id: message.id,
            text: message.message,
            createdAt: message.createdAt,
            senderName: message.User ? message.User.name : "Unknown", // Add sender name or fallback to 'Unknown'
        }));
        console.log(formattedMessages);
        return res.status(200).json({ success: true, data: formattedMessages });
    } catch (error) {
        console.error("Error fetching group messages:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const createGroup = async (req, res) => {
    const { userId, groupName } = req.body;

    // Validate input
    if (!userId || !groupName) {
        return res.status(400).json({ error: "userId and groupName are required" });
    }

    try {
        // Check if the user exists
        const user = await Users.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Create the group
        const group = await Groups.create({
            name: groupName,
            adminId: userId,
        });

        // Add the creator as the first member of the group
        await GroupMembers.create({
            groupId: group.id,
            userId: userId,
        });

        return res.status(201).json({
            success: true,
            message: "Group created successfully",
            data: group,
        });
    } catch (error) {
        console.error("Error creating group:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};