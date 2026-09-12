import { describe, it, expect } from '@jest/globals';
import bcrypt from 'bcrypt';

describe('Password Hashing', () => {
    it('should hash password successfully', async () => {
        const password = 'testPassword123';
        const hashedPassword = await bcrypt.hash(password, 10);

        expect(hashedPassword).toBeTruthy();
        expect(hashedPassword).not.toBe(password);
        expect(hashedPassword.length).toBeGreaterThan(password.length);
    });

    it('should verify correct password', async () => {
        const password = 'mySecurePassword';
        const hashedPassword = await bcrypt.hash(password, 10);
        const isMatch = await bcrypt.compare(password, hashedPassword);

        expect(isMatch).toBe(true);
    });

    it('should reject incorrect password', async () => {
        const password = 'correctPassword';
        const wrongPassword = 'wrongPassword';
        const hashedPassword = await bcrypt.hash(password, 10);
        const isMatch = await bcrypt.compare(wrongPassword, hashedPassword);

        expect(isMatch).toBe(false);
    });

    it('should generate different hashes for same password', async () => {
        const password = 'samePassword';
        const hash1 = await bcrypt.hash(password, 10);
        const hash2 = await bcrypt.hash(password, 10);

        expect(hash1).not.toBe(hash2);

        // But both should verify correctly
        expect(await bcrypt.compare(password, hash1)).toBe(true);
        expect(await bcrypt.compare(password, hash2)).toBe(true);
    });
});
