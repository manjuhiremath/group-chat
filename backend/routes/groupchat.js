import express from "express";
import {
    createGroup,
    inviteToGroup,
    getUserGroups,
    sendGroupMessage,
    getGroupMessages,
} from "../controllers/groupController.js";

const router = express.Router();

// Group Management Routes

// Create a new group
router.post("/groups", createGroup);

// Invite a user to a group
router.post("/groups/invite", inviteToGroup);

// Get all groups a user belongs to
router.get("/users/:userId/groups", getUserGroups);

// Messaging Routes

// Send a message in a group
router.post("/groups/:groupId/messages", sendGroupMessage);

// Get all messages for a specific group
router.get("/groups/:groupId/messages", getGroupMessages);

export default router;