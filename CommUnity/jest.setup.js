import { jest } from '@jest/globals';
jest.mock('@supabase/supabase-js');

// Set environment variables for testing
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://jlsphzzxghrkxivqrvif.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsc3Boenp4Z2hya3hpdnFydmlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1Njc5MzcsImV4cCI6MjA1NTE0MzkzN30.ewVPHwsuscIWIjj0EWMGOCpBdp7a5sE-lHFqA01Rqk4';