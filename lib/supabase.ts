import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Store active channels to prevent duplicate subscriptions
const activeChannels = new Map<string, any>();

// Auth helpers
export const auth = {
  signUp: async (email: string, password: string, metadata?: any) => {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    
    console.log('Sign up result:', result);
    return result;
  },

  signIn: async (email: string, password: string) => {
    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    console.log('Sign in result:', result);
    return result;
  },

  signInWithGoogle: async () => {
    if (Platform.OS === 'web') {
      return await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } else {
      // For mobile, we would use expo-web-browser
      // This is a placeholder for mobile Google sign-in
      return await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
    }
  },

  signOut: async () => {
    console.log('Signing out...');
    const result = await supabase.auth.signOut();
    console.log('Sign out result:', result);
    return result;
  },

  getCurrentUser: () => {
    return supabase.auth.getUser();
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

