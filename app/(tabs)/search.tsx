import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    FlatList,
    TouchableOpacity,
    Image,
    SafeAreaView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Search, UserPlus, User, UserCheck, Clock, UserX } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { FONT, FONT_SIZE } from '@/constants/typography';
import { SPACING, BORDER_RADIUS } from '@/constants/spacing';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useFriends } from '@/hooks/useFriends';
import { db } from '@/lib/supabase';

interface SearchResult {
    id: string;
    full_name: string;
    email: string;
    student_id: string | null;
    department_id: string | null;
    semester: number | null;
    section: string | null;
    avatar_url: string | null;
    is_faculty: boolean;
    departments?: {
        code: string;
        name: string;
    };
}

type UserItemProps = {
    user: SearchResult;
    currentUserId: string;
    onSendFriendRequest: (userId: string) => void;
    onAcceptFriendRequest: (requestId: string) => void;
    onRejectFriendRequest: (requestId: string) => void;
    isFriend: boolean;
    hasPendingRequestSent: boolean;
    hasPendingRequestReceived: boolean;
    pendingRequestId?: string;
    isLoading: boolean;
};

const UserItem = ({
    user,
    currentUserId,
    onSendFriendRequest,
    onAcceptFriendRequest,
    onRejectFriendRequest,
    isFriend,
    hasPendingRequestSent,
    hasPendingRequestReceived,
    pendingRequestId,
    isLoading
}: UserItemProps) => {
    const getDepartmentInfo = () => {
        let info = '';
        if (user.departments?.code) {
            info += user.departments.code;
        }
        if (user.semester) {
            info += ` • Semester ${user.semester}`;
        }
        if (user.section) {
            info += ` • Section ${user.section}`;
        }
        if (user.is_faculty) {
            info = 'Faculty' + (user.departments?.code ? ` • ${user.departments.code}` : '');
        }
        return info;
    };

    const renderActionButton = () => {
        if (user.id === currentUserId) {
            return (
                <View style={styles.selfBadge}>
                    <Text style={styles.selfBadgeText}>You</Text>
                </View>
            );
        }

        if (isFriend) {
            return (
                <View style={styles.friendBadge}>
                    <UserCheck size={16} color={COLORS.success} />
                    <Text style={styles.friendBadgeText}>Connected</Text>
                </View>
            );
        }

        if (hasPendingRequestReceived && pendingRequestId) {
            return (
                <View style={styles.pendingRequestContainer}>
                    <Button
                        title="Accept"
                        icon={<UserCheck size={14} color={COLORS.card} />}
                        onPress={() => onAcceptFriendRequest(pendingRequestId)}
                        loading={isLoading}
                        style={styles.acceptButton}
                        textStyle={styles.acceptButtonText}
                        size="small"
                    />
                    <Button
                        title="Reject"
                        icon={<UserX size={14} color={COLORS.card} />}
                        onPress={() => onRejectFriendRequest(pendingRequestId)}
                        loading={isLoading}
                        variant="outline"
                        style={styles.rejectButton}
                        textStyle={styles.rejectButtonText}
                        size="small"
                    />
                </View>
            );
        }

        if (hasPendingRequestSent) {
            return (
                <View style={styles.pendingBadge}>
                    <Clock size={16} color={COLORS.warning} />
                    <Text style={styles.pendingBadgeText}>Pending</Text>
                </View>
            );
        }

        return (
            <Button
                title="Add"
                icon={<UserPlus size={16} color={COLORS.card} />}
                onPress={() => onSendFriendRequest(user.id)}
                loading={isLoading}
                style={styles.addButton}
                textStyle={styles.addButtonText}
                size="small"
            />
        );
    };

    return (
        <View style={styles.userItem}>
            <View style={styles.userInfoContainer}>
                {user.avatar_url ? (
                    <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <User size={24} color={COLORS.textSecondary} />
                    </View>
                )}

                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.full_name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    {getDepartmentInfo() && (
                        <Text style={styles.userDetails}>{getDepartmentInfo()}</Text>
                    )}
                    {user.student_id && (
                        <Text style={styles.studentId}>ID: {user.student_id}</Text>
                    )}
                </View>
            </View>

            {renderActionButton()}
        </View>
    );
};

export default function SearchScreen() {
    const { user } = useAuth();
    const {
        friends,
        friendRequests,
        sentRequests,
        loading: friendsLoading,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        isFriend,
        hasPendingRequestSent,
        hasPendingRequestReceived,
        getPendingRequestId,
        refresh: refreshFriends
    } = useFriends(user?.id);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const handleSearch = useCallback(async (query: string) => {
        setSearchQuery(query);

        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            setSearchLoading(true);

            const { data, error } = await db.profiles.search(query);

            if (error) {
                console.error('Search error:', error);
                Alert.alert('Search Error', 'Failed to search users. Please try again.');
                return;
            }

            // Filter out current user from results
            const filteredResults = (data || []).filter(result => result.id !== user?.id);
            setSearchResults(filteredResults);

        } catch (error) {
            console.error('Search error:', error);
            Alert.alert('Error', 'An unexpected error occurred while searching.');
        } finally {
            setSearchLoading(false);
        }
    }, [user?.id]);

    const handleSendFriendRequest = useCallback(async (userId: string) => {
        if (!user?.id) {
            Alert.alert('Authentication Required', 'Please log in to send friend requests.');
            return;
        }

        setActionLoading(userId);

        try {
            const { error } = await sendFriendRequest(userId);

            if (error) {
                console.error('Send friend request error:', error);

                // Handle specific error cases
                if (error.message?.includes('already pending')) {
                    Alert.alert('Request Already Sent', 'You have already sent a friend request to this user.');
                } else if (error.message?.includes('already friends')) {
                    Alert.alert('Already Friends', 'You are already friends with this user.');
                } else if (error.message?.includes('duplicate key')) {
                    Alert.alert('Request Already Sent', 'You have already sent a friend request to this user.');
                } else {
                    Alert.alert('Error', 'Failed to send friend request. Please try again.');
                }
                return;
            }

            Alert.alert('Success', 'Friend request sent successfully!');

        } catch (error) {
            console.error('Send friend request error:', error);
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        } finally {
            setActionLoading(null);
        }
    }, [user?.id, sendFriendRequest]);

    const handleAcceptFriendRequest = useCallback(async (requestId: string) => {
        setActionLoading(requestId);

        try {
            const { error } = await acceptFriendRequest(requestId);

            if (error) {
                console.error('Accept friend request error:', error);
                Alert.alert('Error', 'Failed to accept friend request. Please try again.');
                return;
            }

            Alert.alert('Success', 'Friend request accepted!');
            await refreshFriends();

        } catch (error) {
            console.error('Accept friend request error:', error);
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        } finally {
            setActionLoading(null);
        }
    }, [acceptFriendRequest, refreshFriends]);

    const handleRejectFriendRequest = useCallback(async (requestId: string) => {
        setActionLoading(requestId);

        try {
            const { error } = await rejectFriendRequest(requestId);

            if (error) {
                console.error('Reject friend request error:', error);
                Alert.alert('Error', 'Failed to reject friend request. Please try again.');
                return;
            }

            Alert.alert('Success', 'Friend request rejected.');
            await refreshFriends();

        } catch (error) {
            console.error('Reject friend request error:', error);
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        } finally {
            setActionLoading(null);
        }
    }, [rejectFriendRequest, refreshFriends]);

    const getFriendshipStatus = useCallback((userId: string) => {
        const isUserFriend = isFriend(userId);
        const hasPendingSent = hasPendingRequestSent(userId);
        const hasPendingReceived = hasPendingRequestReceived(userId);
        const pendingRequestId = getPendingRequestId(userId);

        return {
            isFriend: isUserFriend,
            hasPendingRequestSent: hasPendingSent,
            hasPendingRequestReceived: hasPendingReceived,
            pendingRequestId,
        };
    }, [isFriend, hasPendingRequestSent, hasPendingRequestReceived, getPendingRequestId]);

    const renderUserItem = useCallback(({ item }: { item: SearchResult }) => {
        const friendshipStatus = getFriendshipStatus(item.id);

        return (
            <UserItem
                user={item}
                currentUserId={user?.id || ''}
                onSendFriendRequest={handleSendFriendRequest}
                onAcceptFriendRequest={handleAcceptFriendRequest}
                onRejectFriendRequest={handleRejectFriendRequest}
                {...friendshipStatus}
                isLoading={actionLoading === item.id || actionLoading === friendshipStatus.pendingRequestId}
            />
        );
    }, [
        user?.id,
        getFriendshipStatus,
        handleSendFriendRequest,
        handleAcceptFriendRequest,
        handleRejectFriendRequest,
        actionLoading
    ]);

    const renderEmptyState = () => {
        if (searchQuery.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Search size={48} color={COLORS.border} />
                    <Text style={styles.emptyTitle}>Find Your Classmates</Text>
                    <Text style={styles.emptyText}>
                        Search by name or EDUemail to connect with your campus community
                    </Text>
                </View>
            );
        }

        if (searchLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B3C36" />
                    <Text style={styles.loadingText}>Searching...</Text>
                </View>
            );
        }

        if (searchQuery.length < 2) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        Enter at least 2 characters to search
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No users found</Text>
                <Text style={styles.emptyText}>
                    Try searching with a different name or email address
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Find Connections</Text>
                {friendsLoading && (
                    <ActivityIndicator size="small" color="#3B3C36" />
                )}
            </View>

            <View style={styles.searchContainer}>
                <Search size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name or EDUemail"
                    placeholderTextColor={COLORS.placeholder}
                    value={searchQuery}
                    onChangeText={handleSearch}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            </View>

            <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={renderUserItem}
                contentContainerStyle={[
                    styles.resultsList,
                    searchResults.length === 0 && styles.emptyListContent
                ]}
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
        paddingTop: SPACING.sm,
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.md,
        marginTop: SPACING.sm,
    },
    title: {
        fontFamily: FONT.semiBold,
        fontSize: FONT_SIZE.xxl,
        color: COLORS.text,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.md,
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.lg,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    searchIcon: {
        marginRight: SPACING.sm,
    },
    searchInput: {
        flex: 1,
        fontFamily: FONT.regular,
        fontSize: FONT_SIZE.md,
        color: COLORS.text,
        paddingVertical: SPACING.md,
    },
    resultsList: {
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.lg,
    },
    emptyListContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.card,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    userInfoContainer: {
        flexDirection: 'row',
        flex: 1,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: BORDER_RADIUS.round,
        marginRight: SPACING.md,
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: BORDER_RADIUS.round,
        backgroundColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.md,
        color: COLORS.text,
        marginBottom: 2,
    },
    userEmail: {
        fontFamily: FONT.regular,
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
    },
    userDetails: {
        fontFamily: FONT.regular,
        fontSize: FONT_SIZE.xs,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    studentId: {
        fontFamily: FONT.regular,
        fontSize: FONT_SIZE.xs,
        color: COLORS.placeholder,
    },
    addButton: {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        marginLeft: SPACING.sm,
        backgroundColor: '#3B3C36',
    },
    addButtonText: {
        fontSize: FONT_SIZE.sm,
    },
    friendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.success + '20',
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.sm,
        borderRadius: BORDER_RADIUS.round,
        marginLeft: SPACING.sm,
    },
    friendBadgeText: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.xs,
        color: COLORS.success,
        marginLeft: 4,
    },
    pendingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.warning + '20',
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.sm,
        borderRadius: BORDER_RADIUS.round,
        marginLeft: SPACING.sm,
    },
    pendingBadgeText: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.xs,
        color: COLORS.warning,
        marginLeft: 4,
    },
    selfBadge: {
        backgroundColor: '#3B3C36' + '20',
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.sm,
        borderRadius: BORDER_RADIUS.round,
        marginLeft: SPACING.sm,
    },
    selfBadgeText: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.xs,
        color: '#3B3C36',
    },
    pendingRequestContainer: {
        flexDirection: 'row',
        gap: SPACING.xs,
        marginLeft: SPACING.sm,
    },
    acceptButton: {
        backgroundColor: COLORS.success,
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.sm,
    },
    acceptButtonText: {
        fontSize: FONT_SIZE.xs,
    },
    rejectButton: {
        borderColor: COLORS.error,
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.sm,
    },
    rejectButtonText: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.error,
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
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xxl,
    },
    loadingText: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.md,
        color: COLORS.textSecondary,
        marginTop: SPACING.md,
    },
});