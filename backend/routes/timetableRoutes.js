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

    // remove trailing ":" and whitespace
    raw = raw.replace(/:$/, "").trim();

    // Example: "09:00 - 10:00" → "09-10 AM"
    const match = raw.match(/(\d{1,2}):\d{2}\s*-\s*(\d{1,2}):\d{2}/);
    if (!match) return raw;

    let start = parseInt(match[1], 10);
    let end = parseInt(match[2], 10);
    let suffix = start < 12 ? "AM" : "PM";

    // convert 24h to 12h
    if (start > 12) start -= 12;
    if (end > 12) end -= 12;

    return `${start.toString().padStart(2, "0")}-${end.toString().padStart(2, "0")} ${suffix}`;
}

function parseExcel(filePath) {
    const timetable = emptyTimetable();
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Days are on 3rd row
    const headers = data[2];

    for (let r = 3; r < data.length; r++) {
        const row = data[r];
        const timeSlot = normalizeTimeSlot(row[0]);  // normalize slot format

        for (let c = 1; c < row.length; c++) {
            const day = headers[c];
            const subject = row[c] || "No class";
            if (day && timetable[day] && timeSlot) {
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
