import { useEffect, useState } from 'react';
import { db, realtime } from '@/lib/supabase';
import { Comment } from '@/components/ui/CommentItem';

export interface Post {
  id: string;
  author_id: string;
  content: string;
  image_url: string | null;
  is_announcement: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    department_id: string | null;
    semester: number | null;
    section: string | null;
    is_faculty: boolean;
    departments?: {
      code: string;
      name: string;
    };
  };
  post_likes: Array<{ user_id: string }>;
  post_comments?: Comment[];
}

export function usePosts(userId?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPosts = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const { data, error } = await db.posts.getAll();
      if (error) throw error;

      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const createPost = async (content: string, imageFile?: File, isAnnouncement = false) => {
    try {
      const { data, error } = await db.posts.create({
        content,
        image_url: imageFile, // Pass the File object directly
        is_announcement: isAnnouncement,
      });
      if (error) throw error;

      // Refresh posts
      await loadPosts();
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const likePost = async (postId: string, userId: string) => {
    try {
      const { error } = await db.posts.like(postId, userId);
      if (error) throw error;

      // Update local state
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes_count: post.likes_count + 1,
              post_likes: [...post.post_likes, { user_id: userId }]
            }
          : post
      ));

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const unlikePost = async (postId: string, userId: string) => {
    try {
      const { error } = await db.posts.unlike(postId, userId);
      if (error) throw error;

      // Update local state
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes_count: Math.max(0, post.likes_count - 1),
              post_likes: post.post_likes.filter(like => like.user_id !== userId)
            }
          : post
      ));

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const addComment = async (postId: string, content: string) => {
    try {
      const { data, error } = await db.posts.addComment({
        post_id: postId,
        content,
      });
      if (error) throw error;

      // Update local state - add the new comment to the post
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              comments_count: post.comments_count + 1,
              post_comments: [...(post.post_comments || []), data]
            }
          : post
      ));

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const refresh = () => loadPosts(true);

  useEffect(() => {
    loadPosts();

    // Subscribe to real-time updates for posts
    const postsSubscription = realtime.subscribeToPosts((payload) => {
      if (payload.eventType === 'INSERT') {
        // Reload posts when new post is created
        loadPosts();
      }
    });

    // Subscribe to real-time updates for comments
    const commentsSubscription = realtime.subscribeToPostComments((payload) => {
      if (payload.eventType === 'INSERT') {
        const newComment = payload.new as Comment;
        // Add the new comment to the appropriate post
        setPosts(prev => prev.map(post => 
          post.id === newComment.post_id 
            ? { 
                ...post, 
                comments_count: post.comments_count + 1,
                post_comments: [...(post.post_comments || []), newComment]
              }
            : post
        ));
      }
    });

    // Subscribe to friendship changes to refresh posts when new friends are added
    let friendshipsSubscription: any = null;
    if (userId) {
      friendshipsSubscription = realtime.subscribeToFriendships(userId, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
          // Reload posts when friendships change to update visibility
          console.log('Friendship changed, reloading posts...');
          loadPosts();
        }
      });
    }

    return () => {
      postsSubscription.unsubscribe();
      commentsSubscription.unsubscribe();
      if (friendshipsSubscription) {
        friendshipsSubscription.unsubscribe();
      }
    };
  }, [userId]);

  return {
    posts,
    loading,
    refreshing,
    createPost,
    likePost,
    unlikePost,
    addComment,
    refresh,
  };
}