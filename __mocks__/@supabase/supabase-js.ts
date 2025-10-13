export const createClient = jest.fn(() => ({
  from: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  select: jest.fn().mockResolvedValue({ data: [{ reportid: 1 }], error: null }),
}));
