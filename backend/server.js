import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoute from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";
dotenv.config();
import cookieParser from "cookie-parser";


const app = express();
const PORT = process.env.PORT;

mongoose.connect(process.env.MONGO_URI).then(() => { console.log("DB connected") }).catch((err) => { console.log(err) });
const allowedOrigins = [
    'http://localhost:5173',
    'https://unimeet-frontend.onrender.com',
    'https://unimeet-i1j9.onrender.com'
];
app.use(cookieParser());
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());

app.use('/api/user', userRoute);
app.use('/api/message', messageRoutes);
app.use('/api/timetable', timetableRoutes);
app.get('/', (req, res) => {
    res.send("home");
})

app.listen(PORT, () => {
    console.log("server is listening to port " + PORT);
})
export default app;