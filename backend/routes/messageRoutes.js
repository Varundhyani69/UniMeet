import express from "express";
import { sendMessage, getMessages, markAsRead, getUnreadSenders } from "../controllers/messageController.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();
router.get('/get/:friendId', isAuthenticated, getMessages);
router.post('/send', isAuthenticated, sendMessage);
router.put('/mark-as-read/:friendId', isAuthenticated, markAsRead);
router.get('/unread', isAuthenticated, getUnreadSenders);

export default router;
