import { uploadImage } from '../services/imageService';
import { supabase } from '../lib/supabase';

// Mock the supabase client
jest.mock('../lib/supabase', () => ({
  supabase: {
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        getPublicUrl: jest.fn(),
      })),
    },
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('Image Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadImage', () => {
    it('should successfully upload an image and return public URL', async () => {
      const mockUri = 'file://test-image.jpg';
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockBlob = new Uint8Array(mockArrayBuffer);
      const mockPublicUrl = 'https://example.com/image.jpg';

      // Mock fetch response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        arrayBuffer: () => Promise.resolve(mockArrayBuffer),
      });

      // Mock supabase storage upload
      const mockUpload = jest.fn().mockResolvedValueOnce({ error: null });
      const mockGetPublicUrl = jest.fn().mockReturnValue({
        data: { publicUrl: mockPublicUrl },
      });

      (supabase.storage.from as jest.Mock).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      });

      const result = await uploadImage(mockUri);

      expect(global.fetch).toHaveBeenCalledWith(mockUri);
      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringMatching(/^reports\/image_\d+_[a-z0-9]+\.jpg$/),
        mockBlob,
        { contentType: 'image/jpeg' }
      );
      expect(mockGetPublicUrl).toHaveBeenCalled();
      expect(result).toBe(mockPublicUrl);
    });

    it('should handle upload error and return null', async () => {
      const mockUri = 'file://test-image.jpg';
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockBlob = new Uint8Array(mockArrayBuffer);
      const mockError = new Error('Upload failed');

      // Mock fetch response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        arrayBuffer: () => Promise.resolve(mockArrayBuffer),
      });

      // Mock supabase storage upload with error
      const mockUpload = jest.fn().mockResolvedValueOnce({ error: mockError });

      (supabase.storage.from as jest.Mock).mockReturnValue({
        upload: mockUpload,
      });

      const result = await uploadImage(mockUri);

      expect(result).toBeNull();
    });

    it('should handle fetch error and return null', async () => {
      const mockUri = 'file://test-image.jpg';
      const mockError = new Error('Fetch failed');

      // Mock fetch to throw error
      (global.fetch as jest.Mock).mockRejectedValueOnce(mockError);

      const result = await uploadImage(mockUri);

      expect(result).toBeNull();
    });

    it('should handle different file extensions correctly', async () => {
      const testCases = [
        { uri: 'file://test.png', expectedContentType: 'image/png' },
        { uri: 'file://test.gif', expectedContentType: 'image/gif' },
        { uri: 'file://test.webp', expectedContentType: 'image/webp' },
        { uri: 'file://test.jpg', expectedContentType: 'image/jpeg' },
        { uri: 'file://test.jpeg', expectedContentType: 'image/jpeg' },
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();

        const mockArrayBuffer = new ArrayBuffer(8);
        const mockBlob = new Uint8Array(mockArrayBuffer);
        const mockPublicUrl = 'https://example.com/image.jpg';

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          arrayBuffer: () => Promise.resolve(mockArrayBuffer),
        });

        const mockUpload = jest.fn().mockResolvedValueOnce({ error: null });
        const mockGetPublicUrl = jest.fn().mockReturnValue({
          data: { publicUrl: mockPublicUrl },
        });

        (supabase.storage.from as jest.Mock).mockReturnValue({
          upload: mockUpload,
          getPublicUrl: mockGetPublicUrl,
        });

        const result = await uploadImage(testCase.uri);

        expect(mockUpload).toHaveBeenCalledWith(expect.any(String), mockBlob, {
          contentType: testCase.expectedContentType,
        });
        expect(result).toBe(mockPublicUrl);
      }
    });

    it('should generate unique filenames', async () => {
      const mockUri = 'file://test.jpg';
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockBlob = new Uint8Array(mockArrayBuffer);

      (global.fetch as jest.Mock).mockResolvedValue({
        arrayBuffer: () => Promise.resolve(mockArrayBuffer),
      });

      const mockUpload = jest.fn().mockResolvedValue({ error: null });
      const mockGetPublicUrl = jest.fn().mockReturnValue({
        data: { publicUrl: 'https://example.com/image.jpg' },
      });

      (supabase.storage.from as jest.Mock).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      });

      // Call uploadImage multiple times
      await uploadImage(mockUri);
      await uploadImage(mockUri);
      await uploadImage(mockUri);

      // Check that different filenames were generated
      const uploadCalls = mockUpload.mock.calls;
      const filenames = uploadCalls.map(call => call[0]);

      // All filenames should be different
      const uniqueFilenames = new Set(filenames);
      expect(uniqueFilenames.size).toBe(3);
    });
  });
});
