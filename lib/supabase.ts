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

// Enhanced storage helpers with mobile support
export const storage = {
  uploadImage: async (uri: string, bucket: string, fileName: string, pickerResult?: any) => {
    try {
      const file = await uriToFile(uri, fileName, 'image/jpeg', pickerResult);

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },

  uploadDocument: async (
    file: File | { uri: string; name: string; type: string },
    bucket: 'messages',
    fileName: string
  ) => {
    try {
      console.log('Uploading document to bucket:', bucket, 'with filename:', fileName);

      let uploadFile: File;

      if (Platform.OS === 'web' && file instanceof File) {
        // Web: Use the File object directly
        uploadFile = file;
      } else if ('uri' in file) {
        // Mobile: Convert URI to File
        uploadFile = await uriToFile(file.uri, file.name, file.type);
      } else {
        throw new Error('Invalid file format');
      }

      console.log('Using filename:', fileName);

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, uploadFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      console.log('Public URL generated:', urlData.publicUrl);

      return {
        data: {
          path: fileName,
          publicUrl: urlData.publicUrl
        },
        error: null
      };
    } catch (error) {
      console.error('Upload document error:', error);
      return { data: null, error };
    }
  },

  deleteImage: async (bucket: 'avatars' | 'posts' | 'messages', path: string) => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        console.error('Storage delete error:', error);
        throw error;
      }

      return { error: null };
    } catch (error) {
      console.error('Delete image error:', error);
      return { error };
    }
  },

  // Helper to convert base64 to File object for web (legacy support)
  base64ToFile: (base64String: string, fileName: string): File => {
    // Remove data URL prefix if present
    const base64Data = base64String.includes(',')
      ? base64String.split(',')[1]
      : base64String;

    // Convert base64 to binary
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    // Determine MIME type from base64 prefix
    let mimeType = 'image/jpeg'; // default
    if (base64String.includes('data:image/')) {
      const mimeMatch = base64String.match(/data:image\/([^;]+)/);
      if (mimeMatch) {
        mimeType = `image/${mimeMatch[1]}`;
      }
    }

    return new File([byteArray], fileName, { type: mimeType });
  }
};



// Database helpers (keeping existing implementation)
export const db = {
  // Profile operations
  profiles: {
    get: async (userId: string) => {
      console.log('Getting profile for user:', userId);
      const result = await supabase
        .from('profiles')
        .select(`
          *,
          departments (
            code,
            name
          )
        `)
        .eq('id', userId)
        .single();

      console.log('Profile result:', result);
      return result;
    },

    update: async (userId: string, updates: any) => {
      console.log('Updating profile for user:', userId, 'with data:', updates);

      // Handle image upload if avatar_url is a File object or image picker result
      if (updates.avatar_url && (updates.avatar_url instanceof File || 'uri' in updates.avatar_url)) {
        console.log('Uploading new avatar image...');
        const fileName = `${userId}/avatar-${Date.now()}.jpg`;
        const imageUri = 'uri' in updates.avatar_url ? updates.avatar_url.uri : updates.avatar_url;
        const { data: uploadData, error: uploadError } = await storage.uploadImage(
          imageUri,
          'avatars',
          fileName,
          updates.avatar_url
        );

        if (uploadError) {
          console.error('Avatar upload failed:', uploadError);
          throw uploadError;
        }

        // Get public URL for the uploaded file
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        updates.avatar_url = urlData.publicUrl;
        console.log('Avatar uploaded successfully, URL:', updates.avatar_url);
      }

      // If department code is provided, find the department ID
      if (updates.departmentCode) {
        const { data: dept } = await supabase
          .from('departments')
          .select('id')
          .eq('code', updates.departmentCode)
          .single();

        if (dept) {
          updates.department_id = dept.id;
        }

        // Remove the temporary field
        delete updates.departmentCode;
        delete updates.departmentName;
      }

      const result = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select();

      console.log('Profile update result:', result);
      return result;
    },

    search: async (query: string) => {
      return await supabase
        .from('profiles')
        .select(`
          *,
          departments (
            code,
            name
          )
        `)
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(20);
    },
  },

  // Post operations
  posts: {
    getAll: async (limit = 20, offset = 0) => {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('User not authenticated:', userError);
        return { data: [], error: userError };
      }

      // Get user's friends
      const { data: friendships, error: friendsError } = await supabase
        .from('friendships')
        .select('friend_id')
        .eq('user_id', user.id);

      if (friendsError) {
        console.error('Error fetching friends:', friendsError);
        return { data: [], error: friendsError };
      }

      const friendIds = friendships?.map(f => f.friend_id) || [];

      // Include the current user's own posts
      const allowedAuthorIds = [user.id, ...friendIds];

      return await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            id,
            full_name,
            avatar_url,
            department_id,
            semester,
            section,
            is_faculty,
            departments (
              code,
              name
            )
          ),
          post_likes (
            user_id
          ),
          post_comments (
            *,
            profiles (
              id,
              full_name,
              avatar_url,
              department_id,
              semester,
              section,
              is_faculty,
              departments (
                code,
                name
              )
            )
          )
        `)
        .or(`author_id.in.(${allowedAuthorIds.join(',')}),is_announcement.eq.true`)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
    },

    create: async (post: any) => {
      console.log('Creating post with data:', post);

      // Get the current user to set author_id
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('User not authenticated:', userError);
        throw new Error('You must be logged in to create a post');
      }

      // Handle image upload if image_url is a File object or image picker result
      let imageUrl = post.image_url;
      if (post.image_url && (post.image_url instanceof File || 'uri' in post.image_url)) {
        console.log('Uploading post image...');
        const fileName = `${user.id}/post-${Date.now()}.jpg`;
        const imageUri = 'uri' in post.image_url ? post.image_url.uri : post.image_url;
        const { data: uploadData, error: uploadError } = await storage.uploadImage(
          imageUri,
          'posts',
          fileName,
          post.image_url
        );

        if (uploadError) {
          console.error('Post image upload failed:', uploadError);
          throw uploadError;
        }

        // Get public URL for the uploaded file
        const { data: urlData } = supabase.storage
          .from('posts')
          .getPublicUrl(fileName);

        imageUrl = urlData.publicUrl;
        console.log('Post image uploaded successfully, URL:', imageUrl);
      }

      // Ensure author_id is set to the current user's ID
      const postData = {
        ...post,
        author_id: user.id,
        image_url: imageUrl,
      };

      console.log('Final post data being sent to Supabase:', postData);

      const result = await supabase
        .from('posts')
        .insert(postData)
        .select(`
          *,
          profiles (
            id,
            full_name,
            avatar_url,
            department_id,
            semester,
            section,
            is_faculty,
            departments (
              code,
              name
            )
          )
        `)
        .single();

      console.log('Post creation result:', result);
      return result;
    },

    like: async (postId: string, userId: string) => {
      return await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: userId });
    },

    unlike: async (postId: string, userId: string) => {
      return await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
    },

    addComment: async (comment: any) => {
      // Get the current user to set author_id
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('User not authenticated:', userError);
        throw new Error('You must be logged in to comment');
      }

      const commentData = {
        ...comment,
        author_id: user.id,
      };

      return await supabase
        .from('post_comments')
        .insert(commentData)
        .select(`
          *,
          profiles (
            id,
            full_name,
            avatar_url,
            department_id,
            semester,
            section,
            is_faculty,
            departments (
              code,
              name
            )
          )
        `)
        .single();
    },

    getComments: async (postId: string) => {
      return await supabase
        .from('post_comments')
        .select(`
          *,
          profiles (
            id,
            full_name,
            avatar_url,
            department_id,
            semester,
            section,
            is_faculty,
            departments (
              code,
              name
            )
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
    },
  },

}
