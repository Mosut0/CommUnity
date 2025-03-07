import { submitFoundItem, submitLostItem } from '../services/lostAndFoundService';

jest.mock('@supabase/supabase-js');

describe('Lost Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully submit a lost item', async () => {
        const result = await submitLostItem(
            {
                itemName: 'phone',
                description: 'lost phone',
                contactInfo: '123-456-7890',
                location: '45.4215,-75.6972',
                date: new Date(),
                imageUri: 'image.jpg'
            },
            'user-123'
        );

        expect(result.success).toBe(true);
    });
});

describe('Found Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully submit a found item', async () => {
        const result = await submitFoundItem(
            {
                itemName: 'phone',
                description: 'found phone',
                contactInfo: '123-456-7890',
                location: '45.4215,-75.6972',
                imageUri: 'image.jpg'
            },
            'user-123'
        );

        expect(result.success).toBe(true);
    });
});