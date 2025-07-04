import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { auth, db } from '@/lib/supabase';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';


export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  student_id: string | null;
  department_id: string | null;
  semester: number | null;
  section: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_faculty: boolean;
  is_active: boolean;
  departments?: {
    code: string;
    name: string;
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    console.log('useAuth: Initializing authentication...');
    
    // Get initial session
    auth.getCurrentUser().then(({ data: { user } }) => {
      console.log('useAuth: Initial getCurrentUser result:', user ? `User ID: ${user.id}` : 'No user');
      setUser(user);
      if (user) {
        loadProfile(user.id);
      } else {
        setLoading(false);
        setInitialized(true);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      console.log('useAuth: Auth state changed:', event, session?.user?.id ? `User ID: ${session.user.id}` : 'No session user');
      
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        console.log('useAuth: No session, clearing profile');
        setProfile(null);
        setLoading(false);
        setInitialized(true);
        
        // Clear any cached data
        await AsyncStorage.clear();

      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      console.log('useAuth: Loading profile for user:', userId);
      const { data, error } = await db.profiles.get(userId);
      if (error) {
        console.error('useAuth: Error loading profile:', error);
        throw error;
      }
      console.log('useAuth: Profile loaded successfully:', data ? `Name: ${data.full_name}` : 'No profile data');
      setProfile(data);
    } catch (error) {
      console.error('useAuth: Failed to load profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
      setInitialized(true);
      console.log('useAuth: Profile loading completed, initialized=true, loading=false');
    }
  };

  const signUp = async (email: string, password: string, profileData: any) => {
    try {
      setLoading(true);
      const { data, error } = await auth.signUp(email, password, profileData);
      if (error) throw error;

      if (data.user) {
        // Create profile with all required data
        const { error: profileError } = await db.profiles.update(data.user.id, {
          email,
          full_name: profileData.fullName,
          student_id: profileData.studentId || null,
          department_id: profileData.departmentId || null,
          semester: profileData.semester || null,
          section: profileData.section || null,
          is_faculty: profileData.isFaculty || false,
          is_active: true,
        });
        
        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw profileError;
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('useAuth: Attempting to sign in...');
      const { data, error } = await auth.signIn(email, password);
      if (error) throw error;
      console.log('useAuth: Sign in successful');
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { data, error } = await auth.signInWithGoogle();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clear local state immediately
      setUser(null);
      setProfile(null);
      
      // Clear browser storage
      await AsyncStorage.clear();
      console.log('useAuth: User signed out, clearing local state and storage');
      
      // Sign out from Supabase
      const { error } = await auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      
      // Navigate to landing page
      router.replace('/');
      
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      setLoading(true);
      console.log('useAuth: Updating profile for user:', user.id, 'with updates:', updates);
      
      // Ensure we're sending the correct column names to the database
      const dbUpdates = {
        ...updates,
        // Map any potential name conflicts
        full_name: updates.full_name,
        student_id: updates.student_id,
      };
      
      console.log('useAuth: Sending to database:', dbUpdates);
      
      const { error } = await db.profiles.update(user.id, dbUpdates);
      if (error) {
        console.error('useAuth: Database update error:', error);
        throw error;
      }

      console.log('useAuth: Profile update successful, reloading profile...');
      // Reload profile to get updated data
      await loadProfile(user.id);
      return { error: null };
    } catch (error) {
      console.error('useAuth: Update profile error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = () => {
    const result = !!(user && profile);
    console.log('useAuth: isAuthenticated check:', result, 'user:', !!user, 'profile:', !!profile);
    return result;
  };

  const requireAuth = () => {
    if (!initialized) {
      console.log('useAuth: requireAuth called but not initialized yet');
      return false;
    }
    
    if (!isAuthenticated()) {
      console.log('useAuth: requireAuth - not authenticated, redirecting to login');
      router.replace('/login');
      return false;
    }
    console.log('useAuth: requireAuth - user is authenticated');
    return true;
  };

  // Add debug logging for state changes
  useEffect(() => {
    console.log('useAuth: State update - user:', !!user, 'profile:', !!profile, 'loading:', loading, 'initialized:', initialized);
  }, [user, profile, loading, initialized]);

  return {
    user,
    profile,
    loading,
    initialized,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    isAuthenticated,
    requireAuth,
  };
}