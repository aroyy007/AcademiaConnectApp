import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { Platform } from 'react-native';
import { uriToFile } from '@/utils/imageUtils';

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

  // Friend operations
  friends: {
    getFriends: async (userId: string) => {
      return await supabase
        .from('friendships')
        .select(`
          friend_id,
          profiles!friendships_friend_id_fkey (
            id,
            full_name,
            avatar_url,
            department_id,
            semester,
            section,
            departments (
              code,
              name
            )
          )
        `)
        .eq('user_id', userId);
    },

    // Check if a friend request already exists between two users (in either direction)
    checkExistingRequest: async (senderId: string, receiverId: string) => {
      return await supabase
        .from('friend_requests')
        .select('id, status, sender_id, receiver_id')
        .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
        .in('status', ['pending', 'accepted']);
    },

    sendRequest: async (senderId: string, receiverId: string) => {
      // First check if a request already exists
      const { data: existingRequests, error: checkError } = await db.friends.checkExistingRequest(senderId, receiverId);
      
      if (checkError) {
        console.error('Error checking existing requests:', checkError);
        return { error: checkError };
      }

      if (existingRequests && existingRequests.length > 0) {
        const existingRequest = existingRequests[0];
        
        // If there's already a pending or accepted request, don't create a new one
        if (existingRequest.status === 'pending') {
          return { 
            error: new Error('A friend request is already pending between these users') 
          };
        } else if (existingRequest.status === 'accepted') {
          return { 
            error: new Error('These users are already friends') 
          };
        }
      }

      // If no existing request, create a new one
      return await supabase
        .from('friend_requests')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
        });
    },

    acceptRequest: async (requestId: string) => {
      try {
        // Use the database function to safely accept friend request
        const { data, error } = await supabase
          .rpc('accept_friend_request', { request_uuid: requestId });

        if (error) {
          console.error('Error calling accept_friend_request function:', error);
          // Fallback to manual process if function doesn't exist
          return await db.friends.acceptRequestManual(requestId);
        }

        if (data && !data.success) {
          return { error: new Error(data.error) };
        }

        return { error: null };
      } catch (error) {
        console.error('Error in acceptRequest:', error);
        // Fallback to manual process
        return await db.friends.acceptRequestManual(requestId);
      }
    },

    // Fallback manual accept function
    acceptRequestManual: async (requestId: string) => {
      // First get the request details
      const { data: request, error: requestError } = await supabase
        .from('friend_requests')
        .select('sender_id, receiver_id, status')
        .eq('id', requestId)
        .single();

      if (requestError || !request) {
        return { error: requestError || new Error('Request not found') };
      }

      // Check if request is already accepted
      if (request.status === 'accepted') {
        return { error: new Error('Friend request already accepted') };
      }

      // Update the request status to accepted first
      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (updateError) {
        return { error: updateError };
      }

      // Check if friendship already exists before creating
      const { data: existingFriendships, error: checkError } = await supabase
        .from('friendships')
        .select('id')
        .or(`and(user_id.eq.${request.sender_id},friend_id.eq.${request.receiver_id}),and(user_id.eq.${request.receiver_id},friend_id.eq.${request.sender_id})`);

      if (checkError) {
        console.error('Error checking existing friendships:', checkError);
        return { error: checkError };
      }

      // If friendships already exist, we're done
      if (existingFriendships && existingFriendships.length > 0) {
        console.log('Friendships already exist, request accepted successfully');
        return { error: null };
      }

      // Create friendship entries (bidirectional) using upsert to handle duplicates
      const { error: friendshipError } = await supabase
        .from('friendships')
        .upsert([
          { user_id: request.sender_id, friend_id: request.receiver_id },
          { user_id: request.receiver_id, friend_id: request.sender_id }
        ], {
          onConflict: 'user_id,friend_id',
          ignoreDuplicates: true
        });

      if (friendshipError) {
        console.error('Error creating friendships:', friendshipError);
        // If it's a duplicate key error, it means friendships already exist
        if (friendshipError.code === '23505') {
          console.log('Friendships already exist (duplicate key), continuing...');
          return { error: null };
        }
        return { error: friendshipError };
      }

      return { error: null };
    },

    rejectRequest: async (requestId: string) => {
      return await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);
    },

    getPendingRequests: async (userId: string) => {
      return await supabase
        .from('friend_requests')
        .select(`
          *,
          profiles!friend_requests_sender_id_fkey (
            id,
            full_name,
            avatar_url,
            department_id,
            semester,
            section,
            departments (
              code,
              name
            )
          )
        `)
        .eq('receiver_id', userId)
        .eq('status', 'pending');
    },

    // Get all friend requests sent by a user
    getSentRequests: async (userId: string) => {
      return await supabase
        .from('friend_requests')
        .select(`
          *,
          profiles!friend_requests_receiver_id_fkey (
            id,
            full_name,
            avatar_url,
            department_id,
            semester,
            section,
            departments (
              code,
              name
            )
          )
        `)
        .eq('sender_id', userId)
        .eq('status', 'pending');
    },
  },

  // Notification operations
  notifications: {
    getAll: async (userId: string) => {
      return await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    },

    markAsRead: async (notificationId: string) => {
      return await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
    },

    markAllAsRead: async (userId: string) => {
      return await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
    },

    create: async (notification: any) => {
      return await supabase
        .from('notifications')
        .insert(notification);
    },
  },

  // Schedule operations
  schedules: {
    getUserSchedule: async (userId: string, semester?: number, section?: string) => {
      let query = supabase
        .from('user_schedules')
        .select(`
          *,
          schedules (
            *,
            courses (
              code,
              title,
              credits
            ),
            profiles!schedules_instructor_id_fkey (
              full_name
            )
          )
        `)
        .eq('user_id', userId);

      if (semester) {
        query = query.eq('schedules.semester', semester);
      }

      if (section) {
        query = query.eq('schedules.section', section);
      }

      return await query.order('schedules.day_of_week');
    },

    getAvailableSchedules: async (semester: number, section: string) => {
      return await supabase
        .from('schedules')
        .select(`
          *,
          courses (
            code,
            title,
            credits,
            departments (
              code,
              name
            )
          ),
          profiles!schedules_instructor_id_fkey (
            full_name
          )
        `)
        .eq('semester', semester)
        .eq('section', section)
        .order('day_of_week');
    },

    enrollInSchedule: async (userId: string, scheduleId: string) => {
      return await supabase
        .from('user_schedules')
        .insert({
          user_id: userId,
          schedule_id: scheduleId,
        });
    },

    unenrollFromSchedule: async (userId: string, scheduleId: string) => {
      return await supabase
        .from('user_schedules')
        .delete()
        .eq('user_id', userId)
        .eq('schedule_id', scheduleId);
    },
  },

  // Department operations
  departments: {
    getAll: async () => {
      return await supabase
        .from('departments')
        .select('*')
        .order('name');
    },
  },

  // Message operations
  messages: {
    getConversations: async (userId: string) => {
      return await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          last_read_at,
          conversations (
            id,
            name,
            is_group,
            created_by,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('conversations(updated_at)', { ascending: false });
    },

    getMessages: async (conversationId: string, offset = 0, limit = 50) => {
      return await supabase
        .from('messages')
        .select(`
          *,
          profiles (
            id,
            full_name,
            avatar_url
          ),
          reply_to:messages!reply_to_id (
            id,
            content,
            profiles (
              full_name
            )
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
    },

    sendMessage: async (message: any) => {
      // Get the current user to set sender_id
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        throw new Error('You must be logged in to send messages');
      }

      // Handle file upload if attachment_file is provided
      let attachmentUrl = null;
      let attachmentType = null;
      
      if (message.attachment_file && (message.attachment_file instanceof File || 'uri' in message.attachment_file)) {
        console.log('Uploading message attachment...');
        
        // Determine if it's an image or document
        const isImage = message.attachment_file.type?.startsWith('image/') || 
                       (message.attachment_file.name && /\.(jpg|jpeg|png|gif|webp)$/i.test(message.attachment_file.name));
        
        if (isImage) {
          const fileName = `${user.id}/message-${Date.now()}.jpg`;
          const imageUri = 'uri' in message.attachment_file ? message.attachment_file.uri : message.attachment_file;
          const { data: uploadData, error: uploadError } = await storage.uploadImage(
            imageUri,
            'messages',
            fileName,
            message.attachment_file
          );
          
          if (uploadError) {
            console.error('Message image upload failed:', uploadError);
            throw uploadError;
          }
          
          // Get public URL for the uploaded file
          const { data: urlData } = supabase.storage
            .from('messages')
            .getPublicUrl(fileName);
          
          attachmentUrl = urlData.publicUrl;
          attachmentType = 'image';
        } else {
          const fileName = `${user.id}/document-${Date.now()}.${message.attachment_file.name?.split('.').pop() || 'bin'}`;
          const { data: uploadData, error: uploadError } = await storage.uploadDocument(
            message.attachment_file,
            'messages',
            fileName
          );
          
          if (uploadError) {
            console.error('Message document upload failed:', uploadError);
            throw uploadError;
          }
          
          attachmentUrl = uploadData?.publicUrl;
          
          // Determine attachment type
          if (message.attachment_file.type?.startsWith('video/')) {
            attachmentType = 'video';
          } else {
            attachmentType = 'file';
          }
        }
        
        console.log('Message attachment uploaded successfully, URL:', attachmentUrl);
      }

      const messageData = {
        conversation_id: message.conversation_id,
        sender_id: user.id,
        content: message.content,
        attachment_url: attachmentUrl,
        attachment_type: attachmentType,
        reply_to_id: message.reply_to_id || null,
      };

      return await supabase
        .from('messages')
        .insert(messageData)
        .select(`
          *,
          profiles (
            id,
            full_name,
            avatar_url
          )
        `)
        .single();
    },

    createDirectConversation: async (user1Id: string, user2Id: string) => {
      // Use the database function to create or get existing conversation
      const { data, error } = await supabase.rpc('create_direct_conversation', {
        user1_id: user1Id,
        user2_id: user2Id
      });

      if (error) {
        console.error('Error creating direct conversation:', error);
        return { data: null, error };
      }

      return { data, error: null };
    },

    markAsRead: async (conversationId: string, userId: string) => {
      // Update last_read_at for the user in this conversation
      return await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);
    },

    setTyping: async (conversationId: string, userId: string, isTyping: boolean) => {
      return await supabase
        .from('typing_indicators')
        .upsert({
          conversation_id: conversationId,
          user_id: userId,
          is_typing: isTyping,
          updated_at: new Date().toISOString(),
        });
    },

    getConversationParticipants: async (conversationId: string) => {
      return await supabase
        .from('conversation_participants')
        .select(`
          user_id,
          last_read_at,
          profiles (
            id,
            full_name,
            avatar_url,
            is_faculty
          )
        `)
        .eq('conversation_id', conversationId)
        .eq('is_active', true);
    },
  },
};

// Real-time subscriptions with proper channel management
export const realtime = {
  subscribeToNotifications: (userId: string, callback: (payload: any) => void) => {
    const channelName = `notifications-${userId}`;
    
    // Check if channel already exists and is subscribed
    if (activeChannels.has(channelName)) {
      const existingChannel = activeChannels.get(channelName);
      console.log(`Channel ${channelName} already exists with state: ${existingChannel.state}`);
      
      // If channel is already joined, return existing subscription
      if (existingChannel.state === 'joined') {
        console.log(`Channel ${channelName} already subscribed, returning existing subscription`);
        return {
          unsubscribe: () => {
            console.log(`Unsubscribing from existing ${channelName}`);
            existingChannel.unsubscribe();
            activeChannels.delete(channelName);
          }
        };
      } else {
        // Channel exists but not joined, unsubscribe and remove it first
        console.log(`Channel ${channelName} exists but not joined, cleaning up...`);
        existingChannel.unsubscribe();
        activeChannels.delete(channelName);
      }
    }

    console.log(`Creating new subscription for ${channelName}`);
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        callback
      );

    // Store the channel before subscribing
    activeChannels.set(channelName, channel);
    
    channel.subscribe((status) => {
      console.log(`Notifications subscription status: ${status}`);
      if (status === 'CLOSED') {
        activeChannels.delete(channelName);
      }
    });

    return {
      unsubscribe: () => {
        console.log(`Unsubscribing from ${channelName}`);
        channel.unsubscribe();
        activeChannels.delete(channelName);
      }
    };
  },

  subscribeToPosts: (callback: (payload: any) => void) => {
    const channelName = 'posts';
    
    // Check if channel already exists and is subscribed
    if (activeChannels.has(channelName)) {
      const existingChannel = activeChannels.get(channelName);
      console.log(`Channel ${channelName} already exists with state: ${existingChannel.state}`);
      
      // If channel is already joined, return existing subscription
      if (existingChannel.state === 'joined') {
        console.log(`Channel ${channelName} already subscribed, returning existing subscription`);
        return {
          unsubscribe: () => {
            console.log(`Unsubscribing from existing ${channelName}`);
            existingChannel.unsubscribe();
            activeChannels.delete(channelName);
          }
        };
      } else {
        // Channel exists but not joined, unsubscribe and remove it first
        console.log(`Channel ${channelName} exists but not joined, cleaning up...`);
        existingChannel.unsubscribe();
        activeChannels.delete(channelName);
      }
    }

    console.log(`Creating new subscription for ${channelName}`);
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        callback
      );

    // Store the channel before subscribing
    activeChannels.set(channelName, channel);
    
    channel.subscribe((status) => {
      console.log(`Posts subscription status: ${status}`);
      if (status === 'CLOSED') {
        activeChannels.delete(channelName);
      }
    });

    return {
      unsubscribe: () => {
        console.log(`Unsubscribing from ${channelName}`);
        channel.unsubscribe();
        activeChannels.delete(channelName);
      }
    };
  },

  subscribeToPostComments: (callback: (payload: any) => void) => {
    const channelName = 'post-comments';
    
    // Check if channel already exists and is subscribed
    if (activeChannels.has(channelName)) {
      const existingChannel = activeChannels.get(channelName);
      console.log(`Channel ${channelName} already exists with state: ${existingChannel.state}`);
      
      // If channel is already joined, return existing subscription
      if (existingChannel.state === 'joined') {
        console.log(`Channel ${channelName} already subscribed, returning existing subscription`);
        return {
          unsubscribe: () => {
            console.log(`Unsubscribing from existing ${channelName}`);
            existingChannel.unsubscribe();
            activeChannels.delete(channelName);
          }
        };
      } else {
        // Channel exists but not joined, unsubscribe and remove it first
        console.log(`Channel ${channelName} exists but not joined, cleaning up...`);
        existingChannel.unsubscribe();
        activeChannels.delete(channelName);
      }
    }

    console.log(`Creating new subscription for ${channelName}`);
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'post_comments',
        },
        callback
      );

    // Store the channel before subscribing
    activeChannels.set(channelName, channel);
    
    channel.subscribe((status) => {
      console.log(`Post comments subscription status: ${status}`);
      if (status === 'CLOSED') {
        activeChannels.delete(channelName);
      }
    });

    return {
      unsubscribe: () => {
        console.log(`Unsubscribing from ${channelName}`);
        channel.unsubscribe();
        activeChannels.delete(channelName);
      }
    };
  },

  subscribeToFriendRequests: (userId: string, callback: (payload: any) => void) => {
    const channelName = `friend-requests-${userId}`;
    
    // Check if channel already exists and is subscribed
    if (activeChannels.has(channelName)) {
      const existingChannel = activeChannels.get(channelName);
      console.log(`Channel ${channelName} already exists with state: ${existingChannel.state}`);
      
      // If channel is already joined, return existing subscription
      if (existingChannel.state === 'joined') {
        console.log(`Channel ${channelName} already subscribed, returning existing subscription`);
        return {
          unsubscribe: () => {
            console.log(`Unsubscribing from existing ${channelName}`);
            existingChannel.unsubscribe();
            activeChannels.delete(channelName);
          }
        };
      } else {
        // Channel exists but not joined, unsubscribe and remove it first
        console.log(`Channel ${channelName} exists but not joined, cleaning up...`);
        existingChannel.unsubscribe();
        activeChannels.delete(channelName);
      }
    }

    console.log(`Creating new subscription for ${channelName}`);
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_requests',
          filter: `receiver_id=eq.${userId}`,
        },
        callback
      );

    // Store the channel before subscribing
    activeChannels.set(channelName, channel);
    
    channel.subscribe((status) => {
      console.log(`Friend requests subscription status: ${status}`);
      if (status === 'CLOSED') {
        activeChannels.delete(channelName);
      }
    });

    return {
      unsubscribe: () => {
        console.log(`Unsubscribing from ${channelName}`);
        channel.unsubscribe();
        activeChannels.delete(channelName);
      }
    };
  },

  subscribeToFriendships: (userId: string, callback: (payload: any) => void) => {
    const channelName = `friendships-${userId}`;
    
    // Check if channel already exists and is subscribed
    if (activeChannels.has(channelName)) {
      const existingChannel = activeChannels.get(channelName);
      console.log(`Channel ${channelName} already exists with state: ${existingChannel.state}`);
      
      // If channel is already joined, return existing subscription
      if (existingChannel.state === 'joined') {
        console.log(`Channel ${channelName} already subscribed, returning existing subscription`);
        return {
          unsubscribe: () => {
            console.log(`Unsubscribing from existing ${channelName}`);
            existingChannel.unsubscribe();
            activeChannels.delete(channelName);
          }
        };
      } else {
        // Channel exists but not joined, unsubscribe and remove it first
        console.log(`Channel ${channelName} exists but not joined, cleaning up...`);
        existingChannel.unsubscribe();
        activeChannels.delete(channelName);
      }
    }

    console.log(`Creating new subscription for ${channelName}`);
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `user_id=eq.${userId}`,
        },
        callback
      );

    // Store the channel before subscribing
    activeChannels.set(channelName, channel);
    
    channel.subscribe((status) => {
      console.log(`Friendships subscription status: ${status}`);
      if (status === 'CLOSED') {
        activeChannels.delete(channelName);
      }
    });

    return {
      unsubscribe: () => {
        console.log(`Unsubscribing from ${channelName}`);
        channel.unsubscribe();
        activeChannels.delete(channelName);
      }
    };
  },

  subscribeToMessages: (callback: (payload: any) => void) => {
    const channelName = 'messages';
    
    // Check if channel already exists and is subscribed
    if (activeChannels.has(channelName)) {
      const existingChannel = activeChannels.get(channelName);
      console.log(`Channel ${channelName} already exists with state: ${existingChannel.state}`);
      
      // If channel is already joined, return existing subscription
      if (existingChannel.state === 'joined') {
        console.log(`Channel ${channelName} already subscribed, returning existing subscription`);
        return {
          unsubscribe: () => {
            console.log(`Unsubscribing from existing ${channelName}`);
            existingChannel.unsubscribe();
            activeChannels.delete(channelName);
          }
        };
      } else {
        // Channel exists but not joined, unsubscribe and remove it first
        console.log(`Channel ${channelName} exists but not joined, cleaning up...`);
        existingChannel.unsubscribe();
        activeChannels.delete(channelName);
      }
    }

    console.log(`Creating new subscription for ${channelName}`);
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        callback
      );

    // Store the channel before subscribing
    activeChannels.set(channelName, channel);
    
    channel.subscribe((status) => {
      console.log(`Messages subscription status: ${status}`);
      if (status === 'CLOSED') {
        activeChannels.delete(channelName);
      }
    });

    return {
      unsubscribe: () => {
        console.log(`Unsubscribing from ${channelName}`);
        channel.unsubscribe();
        activeChannels.delete(channelName);
      }
    };
  },

  subscribeToTypingIndicators: (userId: string, callback: (payload: any) => void) => {
    const channelName = `typing-${userId}`;
    
    // Check if channel already exists and is subscribed
    if (activeChannels.has(channelName)) {
      const existingChannel = activeChannels.get(channelName);
      console.log(`Channel ${channelName} already exists with state: ${existingChannel.state}`);
      
      // If channel is already joined, return existing subscription
      if (existingChannel.state === 'joined') {
        console.log(`Channel ${channelName} already subscribed, returning existing subscription`);
        return {
          unsubscribe: () => {
            console.log(`Unsubscribing from existing ${channelName}`);
            existingChannel.unsubscribe();
            activeChannels.delete(channelName);
          }
        };
      } else {
        // Channel exists but not joined, unsubscribe and remove it first
        console.log(`Channel ${channelName} exists but not joined, cleaning up...`);
        existingChannel.unsubscribe();
        activeChannels.delete(channelName);
      }
    }

    console.log(`Creating new subscription for ${channelName}`);
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
        },
        callback
      );

    // Store the channel before subscribing
    activeChannels.set(channelName, channel);
    
    channel.subscribe((status) => {
      console.log(`Typing indicators subscription status: ${status}`);
      if (status === 'CLOSED') {
        activeChannels.delete(channelName);
      }
    });

    return {
      unsubscribe: () => {
        console.log(`Unsubscribing from ${channelName}`);
        channel.unsubscribe();
        activeChannels.delete(channelName);
      }
    };
  },
};