import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    Image,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { ArrowLeft, Send, Paperclip, User, Search, Plus, Phone, Video, MoveVertical as MoreVertical, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { FONT, FONT_SIZE } from '@/constants/typography';
import { SPACING, BORDER_RADIUS } from '@/constants/spacing';
import { useMessages, Message, Conversation } from '@/hooks/useMessages';
import { useFriends } from '@/hooks/useFriends';
import { useAuth } from '@/hooks/useAuth';
import { pickDocument, validateDocumentFile, DocumentPickerResult } from '@/utils/imageUtils';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width > 768 ? 320 : width * 0.85;

export default function MessagesScreen() {
    const { user } = useAuth();
    const {
        conversations,
        messages,
        typingIndicators,
        loading,
        loadMessages,
        sendMessage,
        markAsRead,
        setTyping,
        createDirectConversation,
    } = useMessages();

    const { friends } = useFriends(user?.id);

    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [messageText, setMessageText] = useState('');
    const [sending, setSending] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
    const [showFriendsList, setShowFriendsList] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [attachmentFile, setAttachmentFile] = useState<DocumentPickerResult | null>(null);
    const [attachmentError, setAttachmentError] = useState<string | null>(null);

    const flatListRef = useRef<FlatList>(null);
    const inputRef = useRef<TextInput>(null);

    // Load messages when conversation is selected
    useEffect(() => {
        if (selectedConversation) {
            setLoadingMessages(true);
            loadMessages(selectedConversation).finally(() => {
                setLoadingMessages(false);
            });
            markAsRead(selectedConversation);
        }
    }, [selectedConversation, loadMessages, markAsRead]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (selectedConversation && messages[selectedConversation]?.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
            }, 100);
        }
    }, [messages, selectedConversation]);

    // Handle typing indicator
    const handleTyping = (text: string) => {
        setMessageText(text);

        if (!selectedConversation) return;

        // Clear existing timeout
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        // Set typing to true
        setTyping(selectedConversation, true);

        // Set timeout to stop typing after 3 seconds
        const timeout = setTimeout(() => {
            setTyping(selectedConversation, false);
        }, 3000);

        setTypingTimeout(timeout);
    };

    // Send message
    const handleSendMessage = async () => {
        if ((!messageText.trim() && !attachmentFile) || !selectedConversation || sending) return;

        setSending(true);
        const text = messageText.trim();
        const attachment = attachmentFile;
        setMessageText('');
        setAttachmentFile(null);
        setAttachmentError(null);

        // Stop typing indicator
        setTyping(selectedConversation, false);
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        try {
            const { error } = await sendMessage(selectedConversation, text || ' ', attachment || undefined);
            if (error) {
                setAttachmentError('Failed to send message. Please try again.');
                setMessageText(text); // Restore message text on error
                setAttachmentFile(attachment); // Restore attachment on error
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setAttachmentError('Failed to send message. Please try again.');
            setMessageText(text);
            setAttachmentFile(attachment);
        } finally {
            setSending(false);
        }
    };

    // Start conversation with friend
    const handleStartConversation = async (friendId: string) => {
        if (!user?.id) return;

        try {
            const { data, error } = await createDirectConversation(friendId);
            if (error) {
                setAttachmentError('Failed to start conversation. Please try again.');
                return;
            }

            if (data) {
                setSelectedConversation(data);
                setShowFriendsList(false);
            }
        } catch (error) {
            console.error('Error starting conversation:', error);
            setAttachmentError('Failed to start conversation. Please try again.');
        }
    };

    // Handle file attachment
    const handleFileAttachment = async () => {
        try {
            setAttachmentError(null);

            const result = await pickDocument({
                type: ['image/*', 'video/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                multiple: false,
            });

            if (result && !Array.isArray(result)) {
                validateDocumentFile(result, 50);
                setAttachmentFile(result);
            }
        } catch (error: any) {
            console.error('File attachment error:', error);
            setAttachmentError(error.message || 'Failed to select file. Please try again.');
        }
    };

    // Remove attachment
    const removeAttachment = () => {
        setAttachmentFile(null);
        setAttachmentError(null);
    };

    // Format time for messages
    const formatMessageTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;

        return date.toLocaleDateString();
    };

    // Get conversation display name
    const getConversationName = (conversation: Conversation) => {
        if (conversation.name) return conversation.name;

        if (!conversation.is_group) {
            const otherParticipant = conversation.participants.find(p => p.user_id !== user?.id);
            return otherParticipant?.profiles.full_name || 'Unknown User';
        }

        return 'Group Chat';
    };

    // Get conversation avatar
    const getConversationAvatar = (conversation: Conversation) => {
        if (!conversation.is_group) {
            const otherParticipant = conversation.participants.find(p => p.user_id !== user?.id);
            return otherParticipant?.profiles.avatar_url;
        }
        return null;
    };

    // Get online status (placeholder - would need real implementation)
    const getOnlineStatus = (userId: string) => {
        // This would be implemented with real-time presence
        return Math.random() > 0.5; // Random for demo
    };

    // Filter conversations based on search
    const filteredConversations = conversations.filter(conv =>
        getConversationName(conv).toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter friends based on search
    const filteredFriends = friends.filter(friend =>
        friend.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Render friend item
    const renderFriendItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.friendItem}
            onPress={() => handleStartConversation(item.friend_id)}
        >
            <View style={styles.friendAvatar}>
                {item.profiles.avatar_url ? (
                    <Image
                        source={{ uri: item.profiles.avatar_url }}
                        style={styles.avatarImage}
                    />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <User size={20} color={COLORS.textSecondary} />
                    </View>
                )}
                {getOnlineStatus(item.friend_id) && <View style={styles.onlineIndicator} />}
            </View>

            <View style={styles.friendContent}>
                <Text style={styles.friendName} numberOfLines={1}>
                    {item.profiles.full_name}
                </Text>
                <Text style={styles.friendStatus}>
                    {getOnlineStatus(item.friend_id) ? 'Online' : 'Offline'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    // Render conversation item
    const renderConversationItem = ({ item }: { item: Conversation }) => (
        <TouchableOpacity
            style={[
                styles.conversationItem,
                selectedConversation === item.id && styles.selectedConversation
            ]}
            onPress={() => {
                setSelectedConversation(item.id);
                setShowFriendsList(false);
            }}
        >
            <View style={styles.conversationAvatar}>
                {getConversationAvatar(item) ? (
                    <Image
                        source={{ uri: getConversationAvatar(item)! }}
                        style={styles.avatarImage}
                    />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <User size={20} color={COLORS.textSecondary} />
                    </View>
                )}
                {!item.is_group && (
                    <View style={[
                        styles.onlineIndicator,
                        !getOnlineStatus(item.participants.find(p => p.user_id !== user?.id)?.user_id || '') && styles.offlineIndicator
                    ]} />
                )}
            </View>

            <View style={styles.conversationContent}>
                <View style={styles.conversationHeader}>
                    <Text style={styles.conversationName} numberOfLines={1}>
                        {getConversationName(item)}
                    </Text>
                    {item.last_message && (
                        <Text style={styles.conversationTime}>
                            {formatMessageTime(item.last_message.created_at)}
                        </Text>
                    )}
                </View>

                <View style={styles.conversationFooter}>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {item.last_message?.content || 'No messages yet'}
                    </Text>
                    {(item.unread_count || 0) > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>
                                {item.unread_count! > 99 ? '99+' : item.unread_count}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    // Render message item
    const renderMessageItem = ({ item }: { item: Message }) => {
        const isOwnMessage = item.sender_id === user?.id;

        return (
            <View style={[
                styles.messageContainer,
                isOwnMessage ? styles.ownMessage : styles.otherMessage
            ]}>
                {!isOwnMessage && (
                    <View style={styles.messageAvatar}>
                        {item.profiles.avatar_url ? (
                            <Image
                                source={{ uri: item.profiles.avatar_url }}
                                style={styles.messageAvatarImage}
                            />
                        ) : (
                            <View style={styles.messageAvatarPlaceholder}>
                                <User size={16} color={COLORS.textSecondary} />
                            </View>
                        )}
                    </View>
                )}

                <View style={[
                    styles.messageBubble,
                    isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
                ]}>
                    {!isOwnMessage && (
                        <Text style={styles.senderName}>{item.profiles.full_name}</Text>
                    )}

                    <Text style={[
                        styles.messageText,
                        isOwnMessage ? styles.ownMessageText : styles.otherMessageText
                    ]}>
                        {item.content}
                    </Text>

                    {item.attachment_url && (
                        <Image
                            source={{ uri: item.attachment_url }}
                            style={styles.messageImage}
                            resizeMode="cover"
                        />
                    )}

                    <View style={styles.messageFooter}>
                        <Text style={[
                            styles.messageTime,
                            isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
                        ]}>
                            {formatMessageTime(item.created_at)}
                        </Text>
                        {isOwnMessage && (
                            <View style={styles.messageStatus}>
                                <Text style={styles.messageStatusText}>✓</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    // Render typing indicator
    const renderTypingIndicator = () => {
        const conversationTyping = typingIndicators[selectedConversation!] || [];
        const otherUsersTyping = conversationTyping.filter(t => t.user_id !== user?.id && t.is_typing);

        if (otherUsersTyping.length === 0) return null;

        return (
            <View style={styles.typingContainer}>
                <View style={styles.typingBubble}>
                    <View style={styles.typingDots}>
                        <View style={[styles.typingDot, styles.typingDot1]} />
                        <View style={[styles.typingDot, styles.typingDot2]} />
                        <View style={[styles.typingDot, styles.typingDot3]} />
                    </View>
                </View>
                <Text style={styles.typingText}>
                    {otherUsersTyping.length === 1
                        ? `${otherUsersTyping[0].profiles.full_name} is typing...`
                        : `${otherUsersTyping.length} people are typing...`
                    }
                </Text>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B3C36" />
                    <Text style={styles.loadingText}>Loading conversations...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <ArrowLeft size={24} color={COLORS.text} />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>
                        {selectedConversation ? getConversationName(
                            conversations.find(c => c.id === selectedConversation)!
                        ) : 'Messages'}
                    </Text>

                    <View style={styles.headerActions}>
                        {selectedConversation ? (
                            <>
                                <TouchableOpacity style={styles.headerAction}>
                                    <Phone size={20} color={COLORS.text} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.headerAction}>
                                    <Video size={20} color={COLORS.text} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.headerAction}>
                                    <MoreVertical size={20} color={COLORS.text} />
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity
                                style={styles.headerAction}
                                onPress={() => setShowFriendsList(!showFriendsList)}
                            >
                                <Plus size={24} color={COLORS.text} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View style={styles.content}>
                    {/* Sidebar */}
                    <View style={[
                        styles.sidebar,
                        selectedConversation && width <= 768 && styles.sidebarHidden
                    ]}>
                        {/* Search */}
                        <View style={styles.searchContainer}>
                            <Search size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search conversations..."
                                placeholderTextColor={COLORS.placeholder}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>

                        {/* Tab Switcher */}
                        <View style={styles.tabSwitcher}>
                            <TouchableOpacity
                                style={[styles.tab, !showFriendsList && styles.activeTab]}
                                onPress={() => setShowFriendsList(false)}
                            >
                                <Text style={[styles.tabText, !showFriendsList && styles.activeTabText]}>
                                    Chats
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, showFriendsList && styles.activeTab]}
                                onPress={() => setShowFriendsList(true)}
                            >
                                <Text style={[styles.tabText, showFriendsList && styles.activeTabText]}>
                                    Friends
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* List */}
                        <FlatList
                            data={showFriendsList ? filteredFriends : filteredConversations}
                            keyExtractor={(item) => showFriendsList ? item.friend_id : item.id}
                            renderItem={showFriendsList ? renderFriendItem : renderConversationItem}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContent}
                        />
                    </View>

                    {/* Chat Area */}
                    {selectedConversation ? (
                        <View style={styles.chatArea}>
                            {loadingMessages ? (
                                <View style={styles.messagesLoading}>
                                    <ActivityIndicator size="large" color="#3B3C36" />
                                </View>
                            ) : (
                                <>
                                    <FlatList
                                        ref={flatListRef}
                                        data={messages[selectedConversation] || []}
                                        keyExtractor={(item) => item.id}
                                        renderItem={renderMessageItem}
                                        inverted
                                        showsVerticalScrollIndicator={false}
                                        contentContainerStyle={styles.messagesContent}
                                        onEndReached={() => {
                                            // Load more messages when scrolled to top
                                            const currentMessages = messages[selectedConversation] || [];
                                            if (currentMessages.length >= 50) {
                                                loadMessages(selectedConversation, currentMessages.length);
                                            }
                                        }}
                                        onEndReachedThreshold={0.1}
                                    />

                                    {renderTypingIndicator()}

                                    {/* Input Area */}
                                    <View style={styles.inputContainer}>
                                        {attachmentFile && (
                                            <View style={styles.attachmentPreview}>
                                                <Text style={styles.attachmentName} numberOfLines={1}>
                                                    {attachmentFile.name}
                                                </Text>
                                                <TouchableOpacity
                                                    style={styles.removeAttachment}
                                                    onPress={removeAttachment}
                                                >
                                                    <X size={16} color={COLORS.error} />
                                                </TouchableOpacity>
                                            </View>
                                        )}

                                        {attachmentError && (
                                            <View style={styles.errorContainer}>
                                                <Text style={styles.errorText}>{attachmentError}</Text>
                                            </View>
                                        )}

                                        <View style={styles.inputRow}>
                                            <TouchableOpacity
                                                style={styles.attachButton}
                                                onPress={handleFileAttachment}
                                            >
                                                <Paperclip size={20} color={COLORS.textSecondary} />
                                            </TouchableOpacity>

                                            <TextInput
                                                ref={inputRef}
                                                style={styles.messageInput}
                                                placeholder="Type a message..."
                                                placeholderTextColor={COLORS.placeholder}
                                                value={messageText}
                                                onChangeText={handleTyping}
                                                multiline
                                                maxLength={1000}
                                                editable={!sending}
                                                onSubmitEditing={handleSendMessage}
                                                blurOnSubmit={false}
                                            />

                                            <TouchableOpacity
                                                style={[
                                                    styles.sendButton,
                                                    ((!messageText.trim() && !attachmentFile) || sending) && styles.sendButtonDisabled
                                                ]}
                                                onPress={handleSendMessage}
                                                disabled={(!messageText.trim() && !attachmentFile) || sending}
                                            >
                                                {sending ? (
                                                    <ActivityIndicator size="small" color={COLORS.card} />
                                                ) : (
                                                    <Send size={20} color={COLORS.card} />
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </>
                            )}
                        </View>
                    ) : (
                        <View style={styles.emptyChat}>
                            <View style={styles.emptyChatIcon}>
                                <User size={48} color={COLORS.border} />
                            </View>
                            <Text style={styles.emptyChatTitle}>Select a conversation</Text>
                            <Text style={styles.emptyChatText}>
                                Choose from your existing conversations or start a new one with your friends.
                            </Text>
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.md,
        color: COLORS.textSecondary,
        marginTop: SPACING.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.card,
    },
    backButton: {
        padding: SPACING.xs,
    },
    headerTitle: {
        fontFamily: FONT.semiBold,
        fontSize: FONT_SIZE.lg,
        color: COLORS.text,
        flex: 1,
        textAlign: 'center',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerAction: {
        padding: SPACING.xs,
        marginLeft: SPACING.xs,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
    },
    sidebar: {
        width: SIDEBAR_WIDTH,
        backgroundColor: COLORS.card,
        borderRightWidth: 1,
        borderRightColor: COLORS.border,
    },
    sidebarHidden: {
        display: 'none',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: BORDER_RADIUS.md,
        margin: SPACING.md,
        paddingHorizontal: SPACING.sm,
    },
    searchIcon: {
        marginRight: SPACING.sm,
    },
    searchInput: {
        flex: 1,
        fontFamily: FONT.regular,
        fontSize: FONT_SIZE.md,
        color: COLORS.text,
        paddingVertical: SPACING.sm,
    },
    tabSwitcher: {
        flexDirection: 'row',
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.md,
        backgroundColor: COLORS.background,
        borderRadius: BORDER_RADIUS.md,
        padding: 2,
    },
    tab: {
        flex: 1,
        paddingVertical: SPACING.sm,
        alignItems: 'center',
        borderRadius: BORDER_RADIUS.sm,
    },
    activeTab: {
        backgroundColor: COLORS.card,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    tabText: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
    },
    activeTabText: {
        color: COLORS.text,
    },
    listContent: {
        padding: SPACING.sm,
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.xs,
    },
    friendAvatar: {
        position: 'relative',
        marginRight: SPACING.sm,
    },
    friendContent: {
        flex: 1,
    },
    friendName: {
        fontFamily: FONT.semiBold,
        fontSize: FONT_SIZE.md,
        color: COLORS.text,
        marginBottom: 2,
    },
    friendStatus: {
        fontFamily: FONT.regular,
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
    },
    conversationItem: {
        flexDirection: 'row',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.xs,
    },
    selectedConversation: {
        backgroundColor: '#3B3C36' + '10',
    },
    conversationAvatar: {
        position: 'relative',
        marginRight: SPACING.sm,
    },
    avatarImage: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS.round,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS.round,
        backgroundColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.success,
        borderWidth: 2,
        borderColor: COLORS.card,
    },
    offlineIndicator: {
        backgroundColor: COLORS.textSecondary,
    },
    conversationContent: {
        flex: 1,
    },
    conversationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    conversationName: {
        fontFamily: FONT.semiBold,
        fontSize: FONT_SIZE.md,
        color: COLORS.text,
        flex: 1,
    },
    conversationTime: {
        fontFamily: FONT.regular,
        fontSize: FONT_SIZE.xs,
        color: COLORS.textSecondary,
    },
    conversationFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        fontFamily: FONT.regular,
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        flex: 1,
    },
    unreadBadge: {
        backgroundColor: COLORS.error,
        borderRadius: BORDER_RADIUS.round,
        paddingHorizontal: 6,
        paddingVertical: 2,
        minWidth: 18,
        alignItems: 'center',
    },
    unreadText: {
        fontFamily: FONT.semiBold,
        fontSize: FONT_SIZE.xs,
        color: COLORS.card,
    },
    chatArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    emptyChat: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    emptyChatIcon: {
        width: 80,
        height: 80,
        borderRadius: BORDER_RADIUS.round,
        backgroundColor: COLORS.card,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    emptyChatTitle: {
        fontFamily: FONT.semiBold,
        fontSize: FONT_SIZE.xl,
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    emptyChatText: {
        fontFamily: FONT.regular,
        fontSize: FONT_SIZE.md,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    messagesLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messagesContent: {
        padding: SPACING.md,
    },
    messageContainer: {
        flexDirection: 'row',
        marginBottom: SPACING.md,
    },
    ownMessage: {
        justifyContent: 'flex-end',
    },
    otherMessage: {
        justifyContent: 'flex-start',
    },
    messageAvatar: {
        marginRight: SPACING.xs,
    },
    messageAvatarImage: {
        width: 32,
        height: 32,
        borderRadius: BORDER_RADIUS.round,
    },
    messageAvatarPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: BORDER_RADIUS.round,
        backgroundColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageBubble: {
        maxWidth: '70%',
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
    },
    ownMessageBubble: {
        backgroundColor: '#3B3C36',
        borderBottomRightRadius: 4,
    },
    otherMessageBubble: {
        backgroundColor: COLORS.card,
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    senderName: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.xs,
        color: COLORS.primary,
        marginBottom: 2,
    },
    messageText: {
        fontFamily: FONT.regular,
        fontSize: FONT_SIZE.md,
        lineHeight: 20,
    },
    ownMessageText: {
        color: COLORS.card,
    },
    otherMessageText: {
        color: COLORS.text,
    },
    messageImage: {
        width: 200,
        height: 150,
        borderRadius: BORDER_RADIUS.sm,
        marginTop: SPACING.xs,
    },
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    messageTime: {
        fontFamily: FONT.regular,
        fontSize: FONT_SIZE.xs,
    },
    ownMessageTime: {
        color: COLORS.card + '80',
    },
    otherMessageTime: {
        color: COLORS.textSecondary,
    },
    messageStatus: {
        marginLeft: SPACING.xs,
    },
    messageStatusText: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.card + '80',
    },
    typingContainer: {
        padding: SPACING.md,
        paddingTop: 0,
        flexDirection: 'row',
        alignItems: 'center',
    },
    typingBubble: {
        backgroundColor: COLORS.card,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.sm,
        marginRight: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    typingDots: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    typingDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.textSecondary,
        marginHorizontal: 1,
    },
    typingDot1: {
        // Animation would be added here
    },
    typingDot2: {
        // Animation would be added here
    },
    typingDot3: {
        // Animation would be added here
    },
    typingText: {
        fontFamily: FONT.regular,
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
    inputContainer: {
        backgroundColor: COLORS.card,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    attachmentPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.sm,
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    attachmentName: {
        fontFamily: FONT.regular,
        fontSize: FONT_SIZE.sm,
        color: COLORS.text,
        flex: 1,
    },
    removeAttachment: {
        padding: SPACING.xs,
    },
    errorContainer: {
        padding: SPACING.sm,
        backgroundColor: COLORS.error + '10',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    errorText: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.sm,
        color: COLORS.error,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: SPACING.md,
    },
    attachButton: {
        padding: SPACING.sm,
        marginRight: SPACING.xs,
    },
    messageInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.sm,
        fontFamily: FONT.regular,
        fontSize: FONT_SIZE.md,
        color: COLORS.text,
        maxHeight: 100,
        marginRight: SPACING.xs,
    },
    sendButton: {
        backgroundColor: '#3B3C36',
        borderRadius: BORDER_RADIUS.round,
        padding: SPACING.sm,
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
    },
    sendButtonDisabled: {
        backgroundColor: COLORS.disabled,
    },
});