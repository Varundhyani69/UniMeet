import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import userRoute from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT;

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("DB connected"))
    .catch((err) => console.log("DB connection error:", err));

const allowedOrigins = [
    'https://unimeet-3ozr.onrender.com',
    'http://localhost:5173',
];

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

const frontendPath = path.join(__dirname, 'frontend', 'dist');
app.use(express.static(frontendPath));

app.listen(PORT, () => {
    console.log("Server is listening on port " + PORT);
});

export default app;
