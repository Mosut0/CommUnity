import { submitHazard } from '../services/hazardService';
import { createClient } from '../__mocks__/@supabase/supabase-js';

jest.mock('@supabase/supabase-js');

const supabaseMock = createClient();

describe('submitHazard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully report a hazard', async () => {
    supabaseMock.from.mockReturnValue({
      insert: jest.fn().mockResolvedValue({ data: [{ reportid: 1 }], error: null }),
      select: jest.fn().mockResolvedValue({ data: [{ reportid: 1 }], error: null }),
    });

    const hazardData = {
      hazardType: 'pothole',
      description: 'Large pothole on Main St.',
      location: '45.4215,-75.6972',
      date: new Date(),
    };

    const result = await submitHazard(hazardData, 'user456');

    expect(result.success).toBe(true);
    expect(supabaseMock.from).toHaveBeenCalledWith('reports');
  });

  it('should handle hazard report insert error', async () => {
    supabaseMock.from.mockReturnValue({
      insert: jest.fn().mockResolvedValue({ data: null, error: new Error('Hazard insert failed') }),
    });

    const hazardData = {
      hazardType: 'pothole',
      description: 'Large pothole on Main St.',
      location: '45.4215,-75.6972',
      date: new Date(),
    };

    const result = await submitHazard(hazardData, 'user456');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
