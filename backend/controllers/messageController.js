import { Message } from '../models/Message.js';
import User from "../models/userModel.js";

// Get all messages between two users
export const getMessages = async (req, res) => {
    try {
        const { userId } = req;
        const { friendId } = req.params;

        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: friendId },
                { sender: friendId, receiver: userId }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch messages' });
    }
};

// Send a new message
export const sendMessage = async (req, res) => {
    try {
        const { userId } = req;
        const { receiverId, text } = req.body;

        const newMessage = await Message.create({
            sender: userId,
            receiver: receiverId,
            text
        });

        res.status(201).json({ success: true, message: newMessage });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { userId } = req;
        const { friendId } = req.params;

        await Message.updateMany(
            { sender: friendId, receiver: userId, isRead: false },
            { isRead: true }
        );

        res.status(200).json({ success: true, message: 'Marked as read' });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ success: false, message: 'Failed to mark as read' });
    }
};
export const getUnreadSenders = async (req, res) => {
    try {
        const { userId } = req;

        const unread = await Message.find({
            receiver: userId,
            isRead: false
        }).distinct("sender");

        res.status(200).json({ success: true, senders: unread });
    } catch (error) {
        console.error("Unread sender error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch unread senders" });
    }
};
