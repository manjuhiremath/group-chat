import express from "express";

import { getUserChats, SendChat } from "../controllers/chats.js";

const router = express.Router();

router.post("/sendchat", SendChat);
router.get("/userchats/:id", getUserChats);


export default router;
