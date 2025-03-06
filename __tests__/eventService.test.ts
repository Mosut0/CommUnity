import { submitEvent } from '../services/eventService';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js');

describe('Event Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully submit an event', async () => {
    const result = await submitEvent(
      {
        eventType: 'community',
        description: 'Park cleanup',
        location: '45.4215,-75.6972',
        date: new Date(),
        time: '14:00',
      },
      'user-123'
    );

    expect(result.success).toBe(true);
  });
});
