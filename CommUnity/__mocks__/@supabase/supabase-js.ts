import { mockDeep } from 'jest-mock-extended';

// Create a deep mock of the Supabase client
const supabaseMock = mockDeep<any>();

// Mock behavior for `.from()`
supabaseMock.from.mockImplementation((table: string) => {
  return {
    insert: jest.fn().mockResolvedValue({
      data: table === 'reports' ? [{ reportid: 1 }] : null,
      error: null,
    }),
    select: jest.fn().mockResolvedValue({
      data: table === 'reports' ? [{ reportid: 1 }] : null,
      error: null,
    }),
  };
});

// Mock `createClient` to always return the mocked Supabase instance
const createClient = jest.fn(() => supabaseMock);

export { createClient };
export default supabaseMock;