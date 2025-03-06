import { submitHazard } from '../services/hazardService';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js');

describe('Hazard Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully submit a hazard', async () => {
        const result = await submitHazard(
            {
                hazardType: 'hurricane',
                description: 'category 2 hurricane',
                location: '45.4215,-75.6972',
                date: new Date(),
            },
            'user-123'
        );

        expect(result.success).toBe(true);
    });
});
