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

    try {
        // Find all group memberships for the user
        const groupMembers = await GroupMembers.findAll({
            where: { userId: userId },
            include: [
                {
                    model: Groups, // Groups model for group details
                    attributes: ["id", "name", "createdAt"], // Select desired fields
                },
            ],
        });

        // Check if user belongs to any groups
        if (groupMembers.length === 0) {
            return res.status(404).json({ success: false, message: "No groups found for this user." });
        }

        // Format the response data
        const formattedGroups = groupMembers.map((member) => ({
            groupId: member.groupId,
            groupName: member.Group ? member.Group.name : "Unknown",
            joinedAt: member.joinedAt,
        }));

        console.log("Formatted Groups:", formattedGroups);
        return res.status(200).json({ success: true, data: formattedGroups });
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
                    model: Users, 
                    attributes: ["name"], 
                },
            ],
        });

        const formattedMessages = messages.map(message => ({
            id: message.id,
            text: message.message,
            createdAt: message.createdAt,
            senderName: message.User ? message.User.name : "Unknown", 
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

    if (!userId || !groupName) {
        return res.status(400).json({ error: "userId and groupName are required" });
    }

    try {
        const user = await Users.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const group = await Groups.create({
            name: groupName,
            adminId: userId,
        });

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



export const makeGroupAdmin = async (req, res) => {
    const { groupId, currentAdminId, newAdminId } = req.body;

    if (!groupId || !currentAdminId || !newAdminId) {
        return res.status(400).json({ error: "groupId, currentAdminId, and newAdminId are required" });
    }

    try {
        const group = await Groups.findByPk(groupId);

        if (!group || group.adminId !== currentAdminId) {
            return res.status(403).json({ error: "Only the current admin can assign a new admin" });
        }

        const isMember = await GroupMembers.findOne({ where: { groupId, userId: newAdminId } });
        if (!isMember) {
            return res.status(400).json({ error: "The new admin must be a member of the group" });
        }

        group.adminId = newAdminId;
        await group.save();

        return res.status(200).json({ success: true, message: "New admin assigned successfully" });
    } catch (error) {
        console.error("Error assigning new admin:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
export const getNonAdminGroupMembers = async (req, res) => {
    const { groupId } = req.params;

    if (!groupId) {
        return res.status(400).json({ error: "groupId is required" });
    }

    try {
        // Fetch the group details
        const group = await Groups.findByPk(groupId);

        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        // Get all members of the group excluding the current admin
        const nonAdminMembers = await GroupMembers.findAll({
            where: {
                groupId,
                userId: { [Op.ne]: group.adminId }, // Exclude the current admin
            },
            include: [
                {
                    model: Users,
                    attributes: ["id", "name"], // Fetch only necessary fields
                },
            ],
        });

        if (nonAdminMembers.length === 0) {
            return res.status(404).json({ error: "No non-admin members found in the group" });
        }

        // Format the response to return member details
        const formattedMembers = nonAdminMembers.map(member => ({
            id: member.User.id,
            name: member.User.name,
        }));

        return res.status(200).json({ success: true, data: formattedMembers });
    } catch (error) {
        console.error("Error fetching non-admin group members:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
export const removeGroupMember = async (req, res) => {
    const { groupId, adminId, memberId } = req.params;

    if (!groupId || !adminId || !memberId) {
        return res.status(400).json({ error: "groupId, adminId, and memberId are required" });
    }
    try {
        const group = await Groups.findByPk(groupId);

        if (!group || group.adminId !== adminId) {
            return res.status(403).json({ error: "Only the admin can remove users from the group" });
        }

        const member = await GroupMembers.findOne({ where: { groupId, userId: memberId } });
        if (!member) {
            return res.status(404).json({ error: "The specified member is not part of the group" });
        }

        await GroupMembers.destroy({ where: { groupId, userId: memberId } });

        return res.status(200).json({ success: true, message: "Member removed successfully" });
    } catch (error) {
        console.error("Error removing member from group:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
export const getGroupMembers = async (req, res) => {
    const { groupId } = req.params;

    if (!groupId) {
        return res.status(400).json({ error: "groupId is required" });
    }

    try {
        const group = await Groups.findByPk(groupId);

        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        // Fetch group members and include user details
        const members = await GroupMembers.findAll({
            where: { groupId },
            include: [
                {
                    model: Users, // Assuming Users model is associated with GroupMembers
                    attributes: ["id", "name", "email"], // Include fields to display
                },
            ],
        });

        if (members.length === 0) {
            return res.status(404).json({ error: "No members found in the group" });
        }

        const formattedMembers = members.map(member => ({
            id: member.User.id,
            name: member.User.name,
            email: member.User.email,
        }));

        return res.status(200).json({ success: true, data: formattedMembers });
    } catch (error) {
        console.error("Error fetching group members:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};