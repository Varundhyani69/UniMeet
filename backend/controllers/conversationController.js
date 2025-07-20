import Conversation from "../models/conversationModel.js";

export const createConversation = async (req, res) => {
    const { receiverId } = req.body;
    const senderId = req.userId;

    try {
        let conversation = await Conversation.findOne({
            members: { $all: [senderId, receiverId] }
        });

        if (!conversation) {
            conversation = new Conversation({
                members: [senderId, receiverId]
            });
            await conversation.save();
        }

        res.status(200).json({ success: true, conversation });
    } catch (error) {
        console.error("Error creating conversation:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getUserConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            members: { $in: [req.userId] }
        }).sort({ updatedAt: -1 });

        res.status(200).json({ success: true, conversations });
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
