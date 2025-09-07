import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";

import userRoute from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'];

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    },
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("DB connected"))
    .catch((err) => console.log("DB connection error:", err));

app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));

app.use('/api/user', userRoute);
app.use('/api/message', messageRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/meeting', meetingRoutes);

const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendPath));
app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api/')) return next();
    res.sendFile(path.join(frontendPath, 'index.html'));
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("setup", (userData) => {
        onlineUsers.set(userData._id, socket.id);
        socket.join(userData._id);
        console.log(`User ${userData.username} joined room: ${userData._id}`);
    });

    socket.on("send-message", (message) => {
        const receiverId = message.receiver;
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("receive-message", message);
        }
    });

    socket.on("friend-request", ({ sender, receiverId }) => {
        const targetSocket = onlineUsers.get(receiverId);
        if (targetSocket) {
            io.to(targetSocket).emit("friend-request-received", {
                message: `${sender.username} sent you a friend request`,
                senderId: sender._id,
                read: false
            });
        }
    });

    socket.on("send-notification", ({ receiverId, notification }) => {
        const targetSocket = onlineUsers.get(receiverId);
        if (targetSocket) {
            io.to(targetSocket).emit("notification-received", notification);
        }
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
        for (let [userId, socketId] of onlineUsers) {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
                break;
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});