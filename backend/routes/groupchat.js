import express from "express";
import {
    createGroup,
    inviteToGroup,
    getUserGroups,
    sendGroupMessage,
    getGroupMessages,
    getAvailableUsersForInvite,
    makeGroupAdmin,
    removeGroupMember,
    getNonAdminGroupMembers,
    getGroupMembers,
} from "../controllers/groupController.js";

const router = express.Router();

// Group Management Routes

router.post("/groups", createGroup);
router.get("/groups/:groupId/inviteList/:adminId", getAvailableUsersForInvite);
router.post("/groups/invite", inviteToGroup);
router.get("/users/:userId/groups", getUserGroups);
router.post("/groups/:groupId/messages", sendGroupMessage);
router.get("/groups/:groupId/messages", getGroupMessages);
router.get("/groups/:groupId/nonAdminMembers", getNonAdminGroupMembers);
router.post("/groups/:groupId/makeAdmin", makeGroupAdmin);
router.get("/groups/:groupId/members", getGroupMembers);
router.delete("/groups/:groupId/admin/:adminId/members/:memberId", removeGroupMember);

export default router;