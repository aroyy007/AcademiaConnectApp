import { useEffect, useState, useCallback } from 'react';
import { db, realtime } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  attachment_url: string | null;
  attachment_type: 'image' | 'file' | 'video' | null;
  reply_to_id: string | null;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  read_by?: Array<{
    user_id: string;
    read_at: string;
  }>;
}

export interface Conversation {
  id: string;
  name: string | null;
  is_group: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  participants: Array<{
    user_id: string;
    last_read_at: string;
    profiles: {
      id: string;
      full_name: string;
      avatar_url: string | null;
      is_faculty: boolean;
    };
  }>;
  last_message?: Message;
  unread_count?: number;
}

export interface TypingIndicator {
  conversation_id: string;
  user_id: string;
  is_typing: boolean;
  profiles: {
    full_name: string;
  };
}

export function useMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [typingIndicators, setTypingIndicators] = useState<Record<string, TypingIndicator[]>>({});
  const [loading, setLoading] = useState(true);

  // Load conversations with enhanced data
  const loadConversations = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data: conversationData, error } = await db.messages.getConversations(user.id);
      if (error) throw error;

      // Enhance conversations with participant data and unread counts
      const enhancedConversations = await Promise.all(
        (conversationData || []).map(async (conv: any) => {
          // Get participants
          const { data: participants } = await db.messages.getConversationParticipants(conv.conversation_id);
          
          // Get last message
          const { data: lastMessages } = await db.messages.getMessages(conv.conversation_id, 0, 1);
          const lastMessage = lastMessages?.[0];

          // Calculate unread count
          const unreadCount = await calculateUnreadCount(conv.conversation_id, user.id);

          return {
            id: conv.conversation_id,
            ...conv.conversations,
            participants: participants || [],
            last_message: lastMessage,
            unread_count: unreadCount,
          };
        })
      );

      setConversations(enhancedConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Calculate unread count for a conversation
  const calculateUnreadCount = async (conversationId: string, userId: string) => {
    try {
      // Get user's last read timestamp
      const { data: participant } = await db.messages.getConversationParticipants(conversationId);
      const userParticipant = participant?.find(p => p.user_id === userId);
      
      if (!userParticipant) return 0;

      // Get messages after last read
      const { data: unreadMessages } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .gt('created_at', userParticipant.last_read_at);

      return unreadMessages?.length || 0;
    } catch (error) {
      console.error('Error calculating unread count:', error);
      return 0;
    }
  };

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string, offset = 0, limit = 50) => {
    try {
      const { data, error } = await db.messages.getMessages(conversationId, offset, limit);
      if (error) throw error;

      setMessages(prev => ({
        ...prev,
        [conversationId]: offset === 0 ? (data || []) : [...(prev[conversationId] || []), ...(data || [])]
      }));

      return data || [];
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(async (
    conversationId: string, 
    content: string, 
    attachmentFile?: File,
    replyToId?: string
  ) => {
    if (!user?.id) return { error: new Error('No user ID') };

    try {
      const { data, error } = await db.messages.sendMessage({
        conversation_id: conversationId,
        content,
        attachment_file: attachmentFile,
        reply_to_id: replyToId,
      });

      if (error) throw error;

      // Update local state immediately for optimistic UI
      if (data) {
        setMessages(prev => ({
          ...prev,
          [conversationId]: [data, ...(prev[conversationId] || [])]
        }));

        // Update conversation timestamp
        setConversations(prev => prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, updated_at: data.created_at, last_message: data }
            : conv
        ));
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }, [user?.id]);

  // Create or get direct conversation
  const createDirectConversation = useCallback(async (otherUserId: string) => {
    if (!user?.id) return { error: new Error('No user ID') };

    try {
      const { data, error } = await db.messages.createDirectConversation(user.id, otherUserId);
      if (error) throw error;

      // Reload conversations to include the new one
      await loadConversations();

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }, [user?.id, loadConversations]);

  // Mark messages as read
  const markAsRead = useCallback(async (conversationId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await db.messages.markAsRead(conversationId, user.id);
      if (error) throw error;

      // Update local conversation state
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unread_count: 0 }
          : conv
      ));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [user?.id]);

  // Set typing indicator
  const setTyping = useCallback(async (conversationId: string, isTyping: boolean) => {
    if (!user?.id) return;

    try {
      const { error } = await db.messages.setTyping(conversationId, user.id, isTyping);
      if (error) throw error;
    } catch (error) {
      console.error('Error setting typing indicator:', error);
    }
  }, [user?.id]);

  // Get unread count across all conversations
  const getTotalUnreadCount = useCallback(() => {
    return conversations.reduce((total, conv) => total + (conv.unread_count || 0), 0);
  }, [conversations]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to new messages
    const messagesSubscription = realtime.subscribeToMessages((payload) => {
      if (payload.eventType === 'INSERT') {
        const newMessage = payload.new as Message;
        setMessages(prev => ({
          ...prev,
          [newMessage.conversation_id]: [newMessage, ...(prev[newMessage.conversation_id] || [])]
        }));

        // Update conversation timestamp and unread count
        setConversations(prev => prev.map(conv => {
          if (conv.id === newMessage.conversation_id) {
            return {
              ...conv,
              updated_at: newMessage.created_at,
              last_message: newMessage,
              unread_count: newMessage.sender_id !== user.id 
                ? (conv.unread_count || 0) + 1 
                : conv.unread_count
            };
          }
          return conv;
        }));
      }
    });

    // Subscribe to typing indicators
    const typingSubscription = realtime.subscribeToTypingIndicators(user.id, (payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const indicator = payload.new as TypingIndicator;
        setTypingIndicators(prev => ({
          ...prev,
          [indicator.conversation_id]: indicator.is_typing
            ? [...(prev[indicator.conversation_id] || []).filter(t => t.user_id !== indicator.user_id), indicator]
            : (prev[indicator.conversation_id] || []).filter(t => t.user_id !== indicator.user_id)
        }));
      }
    });

    return () => {
      messagesSubscription.unsubscribe();
      typingSubscription.unsubscribe();
    };
  }, [user?.id]);

  // Load initial data
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    messages,
    typingIndicators,
    loading,
    loadMessages,
    sendMessage,
    createDirectConversation,
    markAsRead,
    setTyping,
    getTotalUnreadCount,
    refresh: loadConversations,
  };
}