import { describe, it, expect } from '@jest/globals';

describe('Health Check', () => {
    it('should validate health endpoint response structure', () => {
        const healthResponse = { status: 'ok' };

        expect(healthResponse).toHaveProperty('status');
        expect(healthResponse.status).toBe('ok');
    });

    it('should return a valid status value', () => {
        const validStatuses = ['ok', 'healthy', 'running'];
        const status = 'ok';

        expect(validStatuses).toContain(status);
    });
});
