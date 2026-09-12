import { describe, it, expect } from '@jest/globals';

// Test helper functions (extracted from timetableRoutes.js logic)
function cleanSubject(subject) {
    if (!subject || subject === "No class") return "No class";
    const match = subject.match(/[A-Z]{3,}[0-9]{2,}/i);
    return match ? match[0].toUpperCase() : subject.trim();
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

describe('Timetable Parser - cleanSubject', () => {
    it('should extract course code from C: prefix', () => {
        expect(cleanSubject('C:INT222')).toBe('INT222');
        expect(cleanSubject('C:PSY291')).toBe('PSY291');
        expect(cleanSubject('C:PEAS05')).toBe('PEAS05');
    });

    it('should extract course code from descriptive text', () => {
        expect(cleanSubject('PSY291 (Lecture)')).toBe('PSY291');
        expect(cleanSubject('INT222 - Computer Networks')).toBe('INT222');
        expect(cleanSubject('IXD801 Tutorial')).toBe('IXD801');
    });

    it('should return "No class" for empty slots', () => {
        expect(cleanSubject('No class')).toBe('No class');
        expect(cleanSubject('')).toBe('No class');
        expect(cleanSubject(null)).toBe('No class');
    });

    it('should handle uppercase and lowercase correctly', () => {
        expect(cleanSubject('int222')).toBe('INT222');
        expect(cleanSubject('psy291')).toBe('PSY291');
    });

    it('should return trimmed subject if no pattern matches', () => {
        expect(cleanSubject('  Random Text  ')).toBe('Random Text');
    });
});

describe('Timetable Parser - emptyTimetable', () => {
    it('should create timetable with all 7 days', () => {
        const timetable = emptyTimetable();
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

        days.forEach(day => {
            expect(timetable).toHaveProperty(day);
        });
    });

    it('should initialize all slots with "No class"', () => {
        const timetable = emptyTimetable();

        expect(timetable['Monday']['09-10 AM']).toBe('No class');
        expect(timetable['Tuesday']['10-11 AM']).toBe('No class');
        expect(timetable['Friday']['05-06 PM']).toBe('No class');
    });

    it('should have 9 time slots for each day', () => {
        const timetable = emptyTimetable();

        Object.keys(timetable).forEach(day => {
            expect(Object.keys(timetable[day]).length).toBe(9);
        });
    });

    it('should include correct time slot format', () => {
        const timetable = emptyTimetable();
        const slots = Object.keys(timetable['Monday']);

        expect(slots).toContain('09-10 AM');
        expect(slots).toContain('12-01 PM');
        expect(slots).toContain('05-06 PM');
    });
});

describe('Timetable Data Validation', () => {
    it('should validate day names', () => {
        const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const timetable = emptyTimetable();

        Object.keys(timetable).forEach(day => {
            expect(validDays).toContain(day);
        });
    });

    it('should validate time slot format', () => {
        const timeSlotPattern = /^\d{2}-\d{2} (AM|PM)$/;
        const timetable = emptyTimetable();

        Object.values(timetable['Monday']).forEach((_, index) => {
            const slot = Object.keys(timetable['Monday'])[index];
            expect(slot).toMatch(timeSlotPattern);
        });
    });
});
