import React, { createContext, useState, useContext, useEffect } from 'react';
import supabase from '../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  user: any;
  session: any;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {}, // Add default implementation
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState({
    user: null,
    role: null,
    loading: true
  });

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check tutors table first
        const { data: tutorData } = await supabase
          .from('tutors')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (tutorData) {
          setState({ user, role: 'tutor', loading: false });
          return;
        }

        // If not tutor, check profiles table
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileData) {
          setState({ user, role: 'student', loading: false });
          return;
        }

        // If neither, send to role selection
        setState({ user, role: null, loading: false });
      } else {
        setState({ user: null, role: null, loading: false });
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setState({ user: null, role: null, loading: false });
    }
  };

  useEffect(() => {
    checkUser();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        checkUser();
      } else if (event === 'SIGNED_OUT') {
        setState({ user: null, role: null, loading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setState({ user: null, role: null, loading: false });
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};