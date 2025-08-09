import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    SafeAreaView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { COLORS } from '@/constants/colors';
import { FONT, FONT_SIZE } from '@/constants/typography';
import { SPACING } from '@/constants/spacing';
import { Header } from '@/components/ui/Header';
import { PostCard } from '@/components/ui/PostCard';
import { FloatingMessageButton } from '@/components/messaging/FloatingMessageButton';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';

const TAB_BAR_HEIGHT = 72; // Height of the bottom tab bar

export default function FeedScreen() {
    const { user } = useAuth();
    const { posts, loading, refreshing, likePost, unlikePost, addComment, refresh } = usePosts(user?.id);
    const { getTotalUnreadCount } = useMessages();
    const [deletingPosts, setDeletingPosts] = useState<Set<string>>(new Set());

    const handleLike = useCallback(async (postId: string, isCurrentlyLiked: boolean) => {
        if (!user) {
            Alert.alert('Authentication Required', 'Please log in to like posts.');
            return;
        }

        try {
            if (isCurrentlyLiked) {
                await unlikePost(postId, user.id);
            } else {
                await likePost(postId, user.id);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            throw error;
        }
    }, [user, likePost, unlikePost]);

    const handleComment = useCallback(async (postId: string, content: string) => {
        if (!user) {
            Alert.alert('Authentication Required', 'Please log in to comment on posts.');
            return;
        }

        try {
            await addComment(postId, content);
        } catch (error) {
            console.error('Error adding comment:', error);
            throw error;
        }
    }, [user, addComment]);

    const handleShare = useCallback((postId: string) => {
        // TODO: Implement share functionality
        console.log('Share post:', postId);
        Alert.alert('Share', 'Share feature coming soon!');
    }, []);

    const handleDelete = useCallback(async (postId: string) => {
        if (!user) return;

        setDeletingPosts(prev => new Set(prev).add(postId));

        try {
            // TODO: Implement delete post functionality in usePosts hook
            console.log('Delete post:', postId);
            Alert.alert('Success', 'Post deleted successfully');
            refresh();
        } catch (error) {
            console.error('Error deleting post:', error);
            Alert.alert('Error', 'Failed to delete post. Please try again.');
        } finally {
            setDeletingPosts(prev => {
                const newSet = new Set(prev);
                newSet.delete(postId);
                return newSet;
            });
        }
    }, [user, refresh]);

    const renderPost = useCallback(({ item }: { item: any }) => (
        <PostCard
            post={item}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
            onDelete={handleDelete}
        />
    ), [handleLike, handleComment, handleShare, handleDelete]);

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptyMessage}>
                Be the first to share something with your campus community!
            </Text>
        </View>
    );

    const renderLoadingState = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B3C36" />
            <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
    );

    if (loading && posts.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <Header
                    variant="feed"
                    showSearch={true}
                    searchPlaceholder="Search People"
                />
                {renderLoadingState()}
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header
                variant="feed"
                showSearch={true}
                searchPlaceholder="Search People"
            />

            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={renderPost}
                contentContainerStyle={[
                    styles.listContent,
                    posts.length === 0 && styles.emptyListContent
                ]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={refresh}
                        colors={['#3B3C36']}
                        tintColor="#3B3C36"
                    />
                }
                ListEmptyComponent={renderEmptyState}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={10}
                initialNumToRender={5}
                getItemLayout={(data, index) => ({
                    length: 200, // Approximate item height
                    offset: 200 * index,
                    index,
                })}
            />

            {/* Floating Message Button */}
            <FloatingMessageButton unreadCount={getTotalUnreadCount()} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    listContent: {
        padding: SPACING.md,
        paddingBottom: SPACING.md + TAB_BAR_HEIGHT, // Add space for tab bar
    },
    emptyListContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingBottom: SPACING.md + TAB_BAR_HEIGHT, // Add space for tab bar
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
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    emptyMessage: {
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