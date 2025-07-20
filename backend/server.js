import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoute from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("DB connected"))
    .catch((err) => console.log("DB connection error:", err));

const allowedOrigins = [
    'https://unimeet-frontend.onrender.com',
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



app.get('/', (req, res) => {
    res.send("Backend is running");
});

app.listen(PORT, () => {
    console.log("Server is listening on port " + PORT);
});

export default app;
