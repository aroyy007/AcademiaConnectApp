import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    RefreshControl,
    SafeAreaView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { COLORS } from '@/constants/colors';
import { FONT, FONT_SIZE } from '@/constants/typography';
import { SPACING, BORDER_RADIUS } from '@/constants/spacing';
import { Check, X, Bell, UserPlus, MessageSquare, Calendar, Heart } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useFriends } from '@/hooks/useFriends';

const TAB_BAR_HEIGHT = 72; // Height of the bottom tab bar

// Types of notifications
type NotificationType = 'friend_request' | 'post_mention' | 'announcement' | 'schedule_change' | 'post_like' | 'post_comment';

const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
        case 'friend_request':
            return <UserPlus size={24} color="#3B3C36" />;
        case 'post_mention':
            return <MessageSquare size={24} color={COLORS.secondary} />;
        case 'post_like':
            return <Heart size={24} color={COLORS.error} />;
        case 'post_comment':
            return <MessageSquare size={24} color={COLORS.secondary} />;
        case 'announcement':
            return <Bell size={24} color={COLORS.accent} />;
        case 'schedule_change':
            return <Calendar size={24} color={COLORS.success} />;
        default:
            return <Bell size={24} color="#3B3C36" />;
    }
};

export default function NotificationsScreen() {
    const { user } = useAuth();
    const {
        notifications,
        loading,
        unreadCount,
        markAsRead,
        refresh
    } = useNotifications(user?.id);

    const {
        acceptFriendRequest,
        rejectFriendRequest,
        loading: friendsLoading
    } = useFriends(user?.id);

    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refresh();
        } catch (error) {
            console.error('Error refreshing notifications:', error);
        } finally {
            setRefreshing(false);
        }
    }, [refresh]);

    const handleAcceptFriendRequest = useCallback(async (notificationId: string, requestId: string) => {
        if (!requestId) {
            Alert.alert('Error', 'Invalid friend request');
            return;
        }

        setActionLoading(notificationId);

        try {
            const { error } = await acceptFriendRequest(requestId);

            if (error) {
                console.error('Accept friend request error:', error);
                Alert.alert('Error', 'Failed to accept friend request. Please try again.');
                return;
            }

            // Mark notification as read
            await markAsRead(notificationId);
            Alert.alert('Success', 'Friend request accepted!');

        } catch (error) {
            console.error('Accept friend request error:', error);
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        } finally {
            setActionLoading(null);
        }
    }, [acceptFriendRequest, markAsRead]);

    const handleRejectFriendRequest = useCallback(async (notificationId: string, requestId: string) => {
        if (!requestId) {
            Alert.alert('Error', 'Invalid friend request');
            return;
        }

        setActionLoading(notificationId);

        try {
            const { error } = await rejectFriendRequest(requestId);

            if (error) {
                console.error('Reject friend request error:', error);
                Alert.alert('Error', 'Failed to reject friend request. Please try again.');
                return;
            }

            // Mark notification as read
            await markAsRead(notificationId);
            Alert.alert('Success', 'Friend request rejected.');

        } catch (error) {
            console.error('Reject friend request error:', error);
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        } finally {
            setActionLoading(null);
        }
    }, [rejectFriendRequest, markAsRead]);

    const handleMarkAsRead = useCallback(async (notificationId: string) => {
        try {
            await markAsRead(notificationId);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }, [markAsRead]);

    const formatTimeAgo = (dateString: string) => {
        const now = new Date();
        const notificationDate = new Date(dateString);
        const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;

        return notificationDate.toLocaleDateString();
    };

    const renderNotificationItem = ({ item }: { item: any }) => {
        const isActionLoading = actionLoading === item.id;
        const senderData = item.data?.sender;
        const requestId = item.data?.request_id;

        return (
            <TouchableOpacity
                style={[
                    styles.notificationItem,
                    !item.is_read && styles.unreadNotification
                ]}
                onPress={() => handleMarkAsRead(item.id)}
                disabled={isActionLoading}
            >
                <View style={styles.notificationIcon}>
                    {getNotificationIcon(item.type)}
                </View>

                <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    <Text style={styles.notificationMessage}>{item.message}</Text>
                    <Text style={styles.notificationTime}>{formatTimeAgo(item.created_at)}</Text>

                    {item.type === 'friend_request' && !item.is_read && requestId && (
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.acceptButton]}
                                onPress={() => handleAcceptFriendRequest(item.id, requestId)}
                                disabled={isActionLoading || friendsLoading}
                            >
                                {isActionLoading ? (
                                    <ActivityIndicator size="small" color={COLORS.card} />
                                ) : (
                                    <>
                                        <Check size={16} color={COLORS.card} />
                                        <Text style={styles.acceptButtonText}>Accept</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.rejectButton]}
                                onPress={() => handleRejectFriendRequest(item.id, requestId)}
                                disabled={isActionLoading || friendsLoading}
                            >
                                {isActionLoading ? (
                                    <ActivityIndicator size="small" color={COLORS.card} />
                                ) : (
                                    <>
                                        <X size={16} color={COLORS.card} />
                                        <Text style={styles.rejectButtonText}>Reject</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {senderData?.avatar_url && (
                    <Image
                        source={{ uri: senderData.avatar_url }}
                        style={styles.userAvatar}
                    />
                )}
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Bell size={48} color={COLORS.border} />
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyText}>
                You'll see notifications here when you receive friend requests, likes, and comments.
            </Text>
        </View>
    );

    const renderLoadingState = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B3C36" />
            <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
    );

    if (loading && notifications.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Notifications</Text>
                    {unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                        </View>
                    )}
                </View>
                {renderLoadingState()}
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Notifications</Text>
                {unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                    </View>
                )}
            </View>

            <FlatList
                data={notifications}
                keyExtractor={item => item.id}
                renderItem={renderNotificationItem}
                contentContainerStyle={[
                    styles.notificationsList,
                    notifications.length === 0 && styles.emptyListContent
                ]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#3B3C36']}
                        tintColor="#3B3C36"
                    />
                }
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={10}
                initialNumToRender={5}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: SPACING.xl,
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.md,
        marginTop: SPACING.sm,
    },
    title: {
        fontFamily: FONT.semiBold,
        fontSize: FONT_SIZE.xxl,
        color: COLORS.text,
    },
    unreadBadge: {
        backgroundColor: COLORS.error,
        borderRadius: BORDER_RADIUS.round,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        minWidth: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    unreadBadgeText: {
        fontFamily: FONT.semiBold,
        fontSize: FONT_SIZE.xs,
        color: COLORS.card,
    },
    notificationsList: {
        padding: SPACING.md,
        paddingBottom: SPACING.md + TAB_BAR_HEIGHT, // Add space for tab bar
    },
    emptyListContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingBottom: SPACING.md + TAB_BAR_HEIGHT, // Add space for tab bar
    },
    notificationItem: {
        flexDirection: 'row',
        backgroundColor: COLORS.card,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    unreadNotification: {
        borderLeftWidth: 3,
        borderLeftColor: '#3B3C36',
    },
    notificationIcon: {
        marginRight: SPACING.md,
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.round,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.md,
        color: COLORS.text,
        marginBottom: 2,
    },
    notificationMessage: {
        fontFamily: FONT.regular,
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
        lineHeight: 20,
    },
    notificationTime: {
        fontFamily: FONT.regular,
        fontSize: FONT_SIZE.xs,
        color: COLORS.placeholder,
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.round,
        marginLeft: SPACING.md,
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: SPACING.sm,
        gap: SPACING.sm,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.sm,
        borderRadius: BORDER_RADIUS.sm,
        minWidth: 80,
        justifyContent: 'center',
    },
    acceptButton: {
        backgroundColor: COLORS.success,
    },
    acceptButtonText: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.xs,
        color: COLORS.card,
        marginLeft: 4,
    },
    rejectButton: {
        backgroundColor: COLORS.error,
    },
    rejectButtonText: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.xs,
        color: COLORS.card,
        marginLeft: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xxl,
        paddingHorizontal: SPACING.lg,
    },
    emptyTitle: {
        fontFamily: FONT.semiBold,
        fontSize: FONT_SIZE.xl,
        color: COLORS.text,
        marginTop: SPACING.md,
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    emptyText: {
        fontFamily: FONT.regular,
        fontSize: FONT_SIZE.md,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SPACING.xxl,
    },
    loadingText: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.md,
        color: COLORS.textSecondary,
        marginTop: SPACING.md,
    },
});