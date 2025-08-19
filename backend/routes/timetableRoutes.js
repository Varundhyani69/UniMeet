// timetableRoutes.js (fully updated)
import express from "express";
import multer from "multer";
import XLSX from "xlsx";
import pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import fs from "fs";
import User from "../models/userModel.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

/* ---------------------- Helpers ---------------------- */
function detectFileType(file) {
    if (file.mimetype.includes("pdf")) return "pdf";
    if (file.mimetype.includes("sheet") || file.originalname.endsWith(".xlsx") || file.originalname.endsWith(".xls")) return "excel";
    return "unknown";
}

function emptyTimetable() {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const slots = [
        "09-10 AM", "10-11 AM", "11-12 AM", "12-01 PM",
        "01-02 PM", "02-03 PM", "03-04 PM", "04-05 PM",
        "05-06 PM"
    ];
    const obj = {};
    days.forEach(d => {
        obj[d] = {};
        slots.forEach(s => obj[d][s] = "No class");
    });
    return obj;
}

/* ---------------------- Excel Parser ---------------------- */
// Utility: normalize time strings from Excel
function normalizeTimeSlot(raw) {
    if (!raw) return null;

    // Remove trailing ":" and any extra whitespace or newlines
    raw = raw.replace(/:$/, "").replace(/\n/g, "").trim();

    // Match formats like "09:00 - 10:00" or "15:00 - 16:00"
    const match = raw.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    if (!match) return null;  // Invalid time, skip

    let startHour = parseInt(match[1], 10);
    let startMinute = parseInt(match[2], 10);
    let endHour = parseInt(match[3], 10);
    let endMinute = parseInt(match[4], 10);

    // Assume AM/PM based on 24h (common in schedules)
    let suffix = startHour < 12 ? "AM" : "PM";
    if (startHour > 12) startHour -= 12;
    if (endHour > 12) endHour -= 12;
    if (startHour === 0) startHour = 12;  // Handle midnight/noon if needed
    if (endHour === 0) endHour = 12;

    // If minutes are 00, format as HH-HH (no minutes)
    const startStr = startMinute === 0 ? startHour.toString().padStart(2, "0") : `${startHour.toString().padStart(2, "0")}:${startMinute.toString().padStart(2, "0")}`;
    const endStr = endMinute === 0 ? endHour.toString().padStart(2, "0") : `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;

    return `${startStr}-${endStr} ${suffix}`;
}

function parseExcel(filePath) {
    const timetable = emptyTimetable();
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Days are on row index 2 (0-based)
    const headers = data[2] || [];

    for (let r = 3; r < data.length; r++) {
        const row = data[r] || [];
        for (let c = 0; c < row.length; c++) {
            const cell = (row[c] || "").trim();
            if (!cell) continue;

            const day = headers[c];
            if (!day || !timetable[day]) continue;

            // Split cell into lines (time on first, subject on second)
            const lines = cell.split("\n").map(line => line.trim());
            if (lines.length < 2) continue;

            const rawTime = lines[0];
            let subject = lines[1] || "No class";

            // Extract only course code for consistency with PDF (e.g., "PSY291")
            const courseMatch = subject.match(/([A-Z]{3}\d{3})/);
            if (courseMatch) {
                subject = courseMatch[1];
            }

            const timeSlot = normalizeTimeSlot(rawTime);
            if (timeSlot) {
                timetable[day][timeSlot] = subject;
            }
        }
    }
    return timetable;
}


/* ---------------------- PDF Parser ---------------------- */
async function parsePDF(filePath) {
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

            const closestTimeY = Object.keys(timeSlots).reduce((prev, curr) =>
                Math.abs(curr - item.y) < Math.abs(prev - item.y) ? curr : prev
            );

            const closestDay = Object.keys(dayXCoords).reduce((prev, curr) =>
                Math.abs(dayXCoords[curr] - item.x) < Math.abs(dayXCoords[prev] - item.x) ? curr : prev
            );

            const time = timeSlots[closestTimeY];
            if (time && closestDay) {
                timetable[closestDay][time] = course;
            }
        }
    }

    // Fill "No class"
    for (const day of days) {
        for (const time of Object.values(timeSlots)) {
            if (!timetable[day][time]) {
                timetable[day][time] = "No class";
            }
        }
    }

    if (!timetable["Sunday"]) {
        timetable["Sunday"] = {};
        for (const time of Object.values(timeSlots)) {
            timetable["Sunday"][time] = "No class";
        }
    }

    return timetable;
}

/* ---------------------- Upload Timetable ---------------------- */
router.post("/upload-timetable", isAuthenticated, upload.single("timetable"), async (req, res) => {
    try {
        const userId = req.userId;
        const filePath = req.file.path;
        const fileType = detectFileType(req.file);

        let timetable;

        if (fileType === "excel") {
            timetable = parseExcel(filePath);
        } else if (fileType === "pdf") {
            timetable = await parsePDF(filePath);
        } else {
            throw new Error("Unsupported file type");
        }

        fs.unlinkSync(filePath);

        const user = await User.findById(userId);
        user.timetable = timetable;
        await user.save();

        res.status(200).json({ success: true, message: "Timetable uploaded successfully", timetable });
    } catch (err) {
        console.error("Timetable parsing failed:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/* ---------------------- Edit Timetable ---------------------- */
router.post("/editTimetable", isAuthenticated, async (req, res) => {
    try {
        const { timetable } = req.body;
        const userId = req.userId;
        const user = await User.findById(userId);
        user.timetable = timetable;
        await user.save();
        res.status(200).json({ success: true, message: "Timetable updated successfully", timetable });
    } catch (error) {
        console.error("Timetable update failed:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;