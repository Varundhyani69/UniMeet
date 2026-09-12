import { describe, it, expect } from 'vitest';

describe('Timetable Utils', () => {
    it('should identify valid time slots', () => {
        const validSlots = ['09-10 AM', '10-11 AM', '12-01 PM', '05-06 PM'];
        const timeSlotRegex = /^\d{2}-\d{2} (AM|PM)$/;

        validSlots.forEach(slot => {
            expect(slot).toMatch(timeSlotRegex);
        });
    });

    it('should identify invalid time slots', () => {
        const invalidSlots = ['9-10 AM', '10:11 AM', 'No class', ''];
        const timeSlotRegex = /^\d{2}-\d{2} (AM|PM)$/;

        invalidSlots.forEach(slot => {
            expect(slot).not.toMatch(timeSlotRegex);
        });
    });

    it('should get day names correctly', () => {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        expect(days).toHaveLength(7);
        expect(days[0]).toBe('Monday');
        expect(days[6]).toBe('Sunday');
    });

    it('should validate course code format', () => {
        const validCourses = ['INT222', 'PSY291', 'PEAS05', 'IXD801'];
        const courseRegex = /^[A-Z]{3,}[0-9]{2,}$/;

        validCourses.forEach(course => {
            expect(course).toMatch(courseRegex);
        });
    });

    it('should check if slot is empty', () => {
        const isEmpty = (slot) => slot === 'No class' || !slot;

        expect(isEmpty('No class')).toBe(true);
        expect(isEmpty('')).toBe(true);
        expect(isEmpty(null)).toBe(true);
        expect(isEmpty('INT222')).toBe(false);
    });

    it('should parse time to 24h format', () => {
        const parseTo24Hour = (time) => {
            const match = time.match(/(\d{2})-\d{2} (AM|PM)/);
            if (!match) return null;

            let hour = parseInt(match[1]);
            if (match[2] === 'PM' && hour !== 12) hour += 12;
            if (match[2] === 'AM' && hour === 12) hour = 0;

            return hour;
        };

        expect(parseTo24Hour('09-10 AM')).toBe(9);
        expect(parseTo24Hour('12-01 PM')).toBe(12);
        expect(parseTo24Hour('02-03 PM')).toBe(14);
    });
});

describe('Free Slot Matching', () => {
    it('should find common free slots between two users', () => {
        const user1Free = ['09-10 AM', '10-11 AM', '02-03 PM'];
        const user2Free = ['10-11 AM', '02-03 PM', '03-04 PM'];

        const commonSlots = user1Free.filter(slot => user2Free.includes(slot));

        expect(commonSlots).toEqual(['10-11 AM', '02-03 PM']);
        expect(commonSlots).toHaveLength(2);
    });

    it('should return empty array when no common slots', () => {
        const user1Free = ['09-10 AM', '10-11 AM'];
        const user2Free = ['02-03 PM', '03-04 PM'];

        const commonSlots = user1Free.filter(slot => user2Free.includes(slot));

        expect(commonSlots).toEqual([]);
    });
});
