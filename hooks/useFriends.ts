import { useEffect, useState } from 'react';
import { db, realtime } from '@/lib/supabase';

export interface Friend {
  friend_id: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    department_id: string | null;
    semester: number | null;
    section: string | null;
    departments?: {
      code: string;
      name: string;
    };
  };
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    department_id: string | null;
    semester: number | null;
    section: string | null;
    departments?: {
      code: string;
      name: string;
    };
  };
}

export function useFriends(userId?: string) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFriends = async () => {
    if (!userId) return;

    try {
      const { data, error } = await db.friends.getFriends(userId);
      if (error) throw error;
      setFriends(data || []);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const loadFriendRequests = async () => {
    if (!userId) return;

    try {
      const { data, error } = await db.friends.getPendingRequests(userId);
      if (error) throw error;
      setFriendRequests(data || []);
    } catch (error) {
      console.error('Error loading friend requests:', error);
    }
  };

  const loadSentRequests = async () => {
    if (!userId) return;

    try {
      const { data, error } = await db.friends.getSentRequests(userId);
      if (error) throw error;
      setSentRequests(data || []);
    } catch (error) {
      console.error('Error loading sent requests:', error);
    }
  };

  const sendFriendRequest = async (receiverId: string) => {
    if (!userId) return { error: new Error('No user ID') };

    try {
      const { error } = await db.friends.sendRequest(userId, receiverId);
      if (error) {
        console.error('Send friend request error:', error);
        return { error };
      }

      // Reload sent requests to update the UI
      await loadSentRequests();
      return { error: null };
    } catch (error) {
      console.error('Send friend request error:', error);
      return { error };
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      const { error } = await db.friends.acceptRequest(requestId);
      if (error) {
        console.error('Accept friend request error:', error);
        throw error;
      }

      // Remove from pending requests
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      
      // Reload friends list and sent requests
      await Promise.all([loadFriends(), loadSentRequests()]);

      return { error: null };
    } catch (error) {
      console.error('Accept friend request error:', error);
      return { error };
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    try {
      const { error } = await db.friends.rejectRequest(requestId);
      if (error) throw error;

      // Remove from pending requests
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const isFriend = (friendId: string) => {
    return friends.some(friend => friend.friend_id === friendId);
  };

  const hasPendingRequest = (friendId: string) => {
    // Check if there's a pending request received from this user
    const hasReceivedRequest = friendRequests.some(req => req.sender_id === friendId);
    // Check if there's a pending request sent to this user
    const hasSentRequest = sentRequests.some(req => req.receiver_id === friendId);
    
    return hasReceivedRequest || hasSentRequest;
  };

  const hasPendingRequestSent = (friendId: string) => {
    return sentRequests.some(req => req.receiver_id === friendId);
  };

  const hasPendingRequestReceived = (friendId: string) => {
    return friendRequests.some(req => req.sender_id === friendId);
  };

  const getPendingRequestId = (friendId: string) => {
    const receivedRequest = friendRequests.find(req => req.sender_id === friendId);
    return receivedRequest?.id;
  };

  useEffect(() => {
    if (userId) {
      setLoading(true);
      Promise.all([loadFriends(), loadFriendRequests(), loadSentRequests()]).finally(() => {
        setLoading(false);
      });

      // Subscribe to real-time friend request updates
      const requestsSubscription = realtime.subscribeToFriendRequests(userId, (payload) => {
        if (payload.eventType === 'INSERT') {
          loadFriendRequests();
          loadSentRequests();
        } else if (payload.eventType === 'UPDATE') {
          loadFriendRequests();
          loadSentRequests();
          loadFriends();
        }
      });

      // Subscribe to real-time friendships updates
      const friendshipsSubscription = realtime.subscribeToFriendships(userId, (payload) => {
        if (payload.eventType === 'INSERT') {
          loadFriends();
        } else if (payload.eventType === 'DELETE') {
          loadFriends();
        }
      });

      return () => {
        requestsSubscription.unsubscribe();
        friendshipsSubscription.unsubscribe();
      };
    }
  }, [userId]);

  return {
    friends,
    friendRequests,
    sentRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    isFriend,
    hasPendingRequest,
    hasPendingRequestSent,
    hasPendingRequestReceived,
    getPendingRequestId,
    refresh: () => Promise.all([loadFriends(), loadFriendRequests(), loadSentRequests()]),
  };
}