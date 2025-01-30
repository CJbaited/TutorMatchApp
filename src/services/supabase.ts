import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://gzpcygghvfeekuozowtv.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6cGN5Z2dodmZlZWt1b3pvd3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3MDQzMjksImV4cCI6MjA1MjI4MDMyOX0.9oqFAFOPB-GmZtxQ_s1olGJ4pmyCMlAXuAy0rZ2PC3w';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

const createTables = async () => {
  await supabase.rpc('create_table', {
    sql: `
      CREATE TABLE public.profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('student', 'tutor')),
        subjects TEXT[] DEFAULT '{}',
        area TEXT,
        teaching_format TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE public.tutors (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        image_url TEXT,
        affiliation TEXT,
        specialization TEXT[],
        rating NUMERIC CHECK (rating >= 0 AND rating <= 5),
        reviews INTEGER DEFAULT 0,
        price NUMERIC NOT NULL,
        joined_date TIMESTAMPTZ DEFAULT NOW()
      );

    `
  });
};

export default supabase;