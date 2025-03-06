import { submitEvent } from '../services/eventService';
import { createClient } from '../__mocks__/@supabase/supabase-js';

jest.mock('@supabase/supabase-js');

const supabaseMock = createClient();

describe('submitEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should submit an event successfully', async () => {
    supabaseMock.from.mockReturnValue({
      insert: jest.fn().mockResolvedValue({ data: [{ reportid: 1 }], error: null }),
      select: jest.fn().mockResolvedValue({ data: [{ reportid: 1 }], error: null }),
    });

    const eventData = {
      eventType: 'accident',
      description: 'Car accident on Main St.',
      location: '45.4215,-75.6972',
      date: new Date(),
      time: '14:30',
    };

    const result = await submitEvent(eventData, 'user123');

    expect(result.success).toBe(true);
    expect(supabaseMock.from).toHaveBeenCalledWith('reports');
  });

  it('should handle report insert error', async () => {
    supabaseMock.from.mockReturnValue({
      insert: jest.fn().mockResolvedValue({ data: null, error: new Error('Report insert failed') }),
    });

    const eventData = {
      eventType: 'accident',
      description: 'Car accident on Main St.',
      location: '45.4215,-75.6972',
      date: new Date(),
      time: '14:30',
    };

    const result = await submitEvent(eventData, 'user123');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
