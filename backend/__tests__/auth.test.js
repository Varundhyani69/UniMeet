import { describe, it, expect, beforeAll } from '@jest/globals';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

describe('JWT Authentication', () => {
    const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

    it('should generate a valid JWT token', () => {
        const payload = { userId: '123', email: 'test@example.com' };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        expect(token).toBeTruthy();
        expect(typeof token).toBe('string');
        expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should decode JWT token correctly', () => {
        const payload = { userId: '123', email: 'test@lpu.in' };
        const token = jwt.sign(payload, JWT_SECRET);
        const decoded = jwt.verify(token, JWT_SECRET);

        expect(decoded.userId).toBe('123');
        expect(decoded.email).toBe('test@lpu.in');
    });

    it('should reject invalid JWT tokens', () => {
        expect(() => {
            jwt.verify('invalid.token.here', JWT_SECRET);
        }).toThrow();
    });

    it('should reject tokens with wrong secret', () => {
        const token = jwt.sign({ userId: '123' }, 'wrong-secret');

        expect(() => {
            jwt.verify(token, JWT_SECRET);
        }).toThrow();
    });

    it('should include expiration in token', () => {
        const token = jwt.sign({ userId: '123' }, JWT_SECRET, { expiresIn: '1h' });
        const decoded = jwt.decode(token);

        expect(decoded).toHaveProperty('exp');
        expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });
});
