
import { Chat } from "../models/ChatModel.js";
import { Users } from "../models/User.js";

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
      const UserId = user.id;
      const chat = await Chat.create({ UserId, message });
      return res.status(201).json({
        success: true,
        message: "Chat message stored successfully",
        data: chat,
      });
    } catch (error) {
      console.error("Error storing chat message:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  export const getUserChats = async (req, res) => {
    const UserId = req.params.id;
    const lastTimestamp = req.query.lastTimestamp;

    try {
        const user = await Users.findByPk(UserId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const whereClause = { UserId };
        if (lastTimestamp) {
            whereClause.createdAt = { [Op.gt]: new Date(lastTimestamp) }; // Fetch messages after lastTimestamp
        }

        const chats = await Chat.findAll({
            where: whereClause,
            order: [['createdAt', 'ASC']],
        });

        return res.status(200).json({ success: true, data: chats });
    } catch (error) {
        console.error("Error fetching chats:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
