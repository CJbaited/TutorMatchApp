// filepath: /c:/Users/PC/Documents/TutorMatchApp/src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://gzpcygghvfeekuozowtv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6cGN5Z2dodmZlZWt1b3pvd3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3MDQzMjksImV4cCI6MjA1MjI4MDMyOX0.9oqFAFOPB-GmZtxQ_s1olGJ4pmyCMlAXuAy0rZ2PC3w';
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    detectSessionInUrl: false,
  },
});

export default supabase;