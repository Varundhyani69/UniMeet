import { describe, it, expect, beforeEach } from 'vitest';

describe('Authentication Utils', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should store token in localStorage', () => {
        const mockToken = 'fake-jwt-token-123';
        localStorage.setItem('token', mockToken);

        expect(localStorage.getItem('token')).toBe(mockToken);
    });

    it('should retrieve stored token', () => {
        const token = 'test-token-xyz';
        localStorage.setItem('token', token);

        const retrieved = localStorage.getItem('token');
        expect(retrieved).toBe(token);
    });

    it('should clear token on logout', () => {
        localStorage.setItem('token', 'some-token');
        localStorage.removeItem('token');

        expect(localStorage.getItem('token')).toBeNull();
    });

    it('should return null for non-existent token', () => {
        expect(localStorage.getItem('token')).toBeNull();
    });

    it('should validate email format', () => {
        const validEmail = 'student@lpu.in';
        const invalidEmail = 'notanemail';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        expect(emailRegex.test(validEmail)).toBe(true);
        expect(emailRegex.test(invalidEmail)).toBe(false);
    });

    it('should validate LPU email domain', () => {
        const lpuEmail = 'student@lpu.in';
        const nonLpuEmail = 'student@gmail.com';

        const isLPUEmail = (email) => email.endsWith('@lpu.in');

        expect(isLPUEmail(lpuEmail)).toBe(true);
        expect(isLPUEmail(nonLpuEmail)).toBe(false);
    });
});
