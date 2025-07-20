import express from "express";
import multer from "multer";
import pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import fs from "fs";
import User from "../models/userModel.js"
const router = express.Router();
const upload = multer({ dest: "uploads/" });
import isAuthenticated from "../middleware/isAuthenticated.js";

router.post("/upload-timetable", isAuthenticated, upload.single("timetable"), async (req, res) => {
    try {
        const userId = req.userId;
        const filePath = req.file.path;

        const pdfData = new Uint8Array(fs.readFileSync(filePath));
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
        const page = await pdf.getPage(1);
        const content = await page.getTextContent();

        const items = content.items.map((item) => ({
            text: item.str,
            x: item.transform[4],
            y: item.transform[5],
        }));

        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const dayXCoords = {};
        for (let item of items) {
            if (days.includes(item.text)) {
                dayXCoords[item.text] = item.x;
            }
        }

        const timeSlots = {};
        for (let item of items) {
            if (/^\d{2}-\d{2} (AM|PM)$/.test(item.text)) {
                timeSlots[item.y] = item.text;
            }
        }

        const timetable = {};
        days.forEach((day) => {
            timetable[day] = {};
        });

        for (let item of items) {
            const match = item.text.match(/C:([A-Z]{2,5}\d{3})/);
            if (match) {
                const course = match[1];

                const closestTimeY = Object.keys(timeSlots).reduce((prev, curr) => {
                    return Math.abs(curr - item.y) < Math.abs(prev - item.y) ? curr : prev;
                });

                const closestDay = Object.keys(dayXCoords).reduce((prev, curr) => {
                    return Math.abs(dayXCoords[curr] - item.x) < Math.abs(dayXCoords[prev] - item.x) ? curr : prev;
                });

                const time = timeSlots[closestTimeY];
                if (time && closestDay) {
                    timetable[closestDay][time] = course;
                }
            }
        }

        // Fill in "No class" for all unfilled time slots
        for (const day of days) {
            for (const time of Object.values(timeSlots)) {
                if (!timetable[day][time]) {
                    timetable[day][time] = "No class";
                }
            }
        }

        // In case Sunday is missing (just to be safe)
        if (!timetable["Sunday"]) {
            timetable["Sunday"] = {};
            for (const time of Object.values(timeSlots)) {
                timetable["Sunday"][time] = "No class";
            }
        }

        fs.unlinkSync(filePath);

        const user = await User.findById(userId);
        user.timetable = timetable;
        await user.save();

        res.status(200).json({ success: true, timetable });
    } catch (err) {
        console.error("Timetable parsing failed:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post("/editTimetable", isAuthenticated, async (req, res) => {
    try {
        const { timetable } = req.body;
        const userId = req.userId;
        const user = await User.findById(userId);
        user.timetable = timetable;
        await user.save();
        res.status(200).json({ success: true, timetable });
    } catch (error) {
        console.error("Timetable update failed:", error); // ✅ Correct variable
        res.status(500).json({ success: false, error: error.message }); // ✅
    }

})

export default router;
