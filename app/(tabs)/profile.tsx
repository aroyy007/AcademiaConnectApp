import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { COLORS } from '@/constants/colors';
import { FONT, FONT_SIZE } from '@/constants/typography';
import { SPACING, BORDER_RADIUS } from '@/constants/spacing';
import { Settings, CreditCard as Edit3, LogOut, Users, BookOpen, Shield } from 'lucide-react-native';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { useAuth } from '@/hooks/useAuth';
import { useFriends } from '@/hooks/useFriends';
import { useSchedule } from '@/hooks/useSchedule';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TAB_BAR_HEIGHT = 72; // Height of the bottom tab bar

export default function ProfileScreen() {
    const [showEditModal, setShowEditModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { profile, signOut, updateProfile, loading, user } = useAuth();
    const { friends, loading: friendsLoading } = useFriends(user?.id);
    const { userSchedules, loading: scheduleLoading } = useSchedule(user?.id);

    const handleUpdateProfile = async (updatedData: any) => {
        const { error } = await updateProfile(updatedData);
        if (error) {
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        } else {
            setShowEditModal(false);
            Alert.alert('Success', 'Profile updated successfully!');
        }
    };

    const handleSignOut = async () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out? This will end all active sessions on all devices.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: performSignOut,
                },
            ]
        );
    };

    const performSignOut = async () => {
        setIsLoggingOut(true);

        try {
            console.log('Starting secure logout process...');

            // Call the signOut method from useAuth (it handles all cleanup and navigation)
            const { error } = await signOut();

            if (error) {
                console.error('Logout error:', error);
                // Don't throw here - let the signOut function handle cleanup and navigation
            }

            console.log('Logout process completed');

        } catch (error: any) {
            console.error('Logout failed:', error);
            // The signOut function should handle cleanup and navigation even on error
        } finally {
            setIsLoggingOut(false);
        }
    };

    if (!profile) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Profile not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.settingsButton}>
                        <Settings size={24} color={COLORS.text} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.logoutButton,
                            isLoggingOut && styles.logoutButtonDisabled
                        ]}
                        onPress={handleSignOut}
                        disabled={loading || isLoggingOut}
                    >
                        {isLoggingOut ? (
                            <ActivityIndicator size={24} color={COLORS.error} />
                        ) : (
                            <LogOut size={24} color={COLORS.error} />
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{
                                uri: profile.avatar_url || 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'
                            }}
                            style={styles.avatar}
                        />
                        <TouchableOpacity style={styles.editAvatarButton}>
                            <Edit3 size={18} color={COLORS.card} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.userName}>{profile.full_name}</Text>
                    <Text style={styles.userEmail}>{profile.email}</Text>

                    <View style={styles.userDetailsContainer}>
                        <View style={styles.userDetailItem}>
                            <Text style={styles.detailLabel}>Department</Text>
                            <Text style={styles.detailValue}>
                                {profile.departments?.code || 'N/A'}
                            </Text>
                        </View>

                        <View style={styles.userDetailDivider} />

                        <View style={styles.userDetailItem}>
                            <Text style={styles.detailLabel}>Semester</Text>
                            <Text style={styles.detailValue}>
                                {profile.semester || 'N/A'}
                            </Text>
                        </View>

                        <View style={styles.userDetailDivider} />

                        <View style={styles.userDetailItem}>
                            <Text style={styles.detailLabel}>Section</Text>
                            <Text style={styles.detailValue}>
                                {profile.section || 'N/A'}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.editProfileButton}
                        onPress={() => setShowEditModal(true)}
                        disabled={isLoggingOut}
                    >
                        <Edit3 size={16} color={COLORS.card} style={styles.editIcon} />
                        <Text style={styles.editProfileText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <View style={styles.statIconContainer}>
                            <Users size={20} color="#3B3C36" />
                        </View>
                        <Text style={styles.statValue}>
                            {friendsLoading ? '...' : friends.length}
                        </Text>
                        <Text style={styles.statLabel}>Connections</Text>
                    </View>

                    <View style={styles.statItem}>
                        <View style={styles.statIconContainer}>
                            <BookOpen size={20} color={COLORS.secondary} />
                        </View>
                        <Text style={styles.statValue}>
                            {scheduleLoading ? '...' : userSchedules?.length || 0}
                        </Text>
                        <Text style={styles.statLabel}>Courses</Text>
                    </View>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Account Information</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Student ID</Text>
                            <Text style={styles.infoValue}>
                                {profile.student_id || 'Not set'}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Account Type</Text>
                            <Text style={styles.infoValue}>
                                {profile.is_faculty ? 'Faculty' : 'Student'}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Status</Text>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>
                                    {profile.is_active ? 'Active' : 'Inactive'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Academic Information</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Department</Text>
                            <Text style={styles.infoValue}>
                                {profile.departments?.name || 'Not set'}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Current Semester</Text>
                            <Text style={styles.infoValue}>
                                {profile.semester ? `Semester ${profile.semester}` : 'Not set'}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Section</Text>
                            <Text style={styles.infoValue}>
                                {profile.section ? `Section ${profile.section}` : 'Not set'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Security</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.securityRow}>
                            <View style={styles.securityInfo}>
                                <Shield size={20} color={COLORS.success} />
                                <View style={styles.securityTextContainer}>
                                    <Text style={styles.securityTitle}>Secure Session</Text>
                                    <Text style={styles.securityDescription}>
                                        Your session is encrypted and secure. Logging out will end all active sessions.
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.outlinedButton}
                        disabled={isLoggingOut}
                    >
                        <Text style={styles.outlinedButtonText}>View Academic Record</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.logoutButtonLarge,
                            isLoggingOut && styles.logoutButtonDisabled
                        ]}
                        onPress={handleSignOut}
                        disabled={loading || isLoggingOut}
                    >
                        {isLoggingOut ? (
                            <ActivityIndicator size="small" color={COLORS.card} />
                        ) : (
                            <LogOut size={20} color={COLORS.card} />
                        )}
                        <Text style={styles.logoutButtonText}>
                            {isLoggingOut ? 'Signing Out...' : 'Sign Out Securely'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <EditProfileModal
                visible={showEditModal}
                onClose={() => setShowEditModal(false)}
                userProfile={profile}
                onUpdate={handleUpdateProfile}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContainer: {
        paddingBottom: SPACING.xl + TAB_BAR_HEIGHT, // Add space for tab bar
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: SPACING.sm,
        paddingHorizontal: SPACING.md,
        marginTop: SPACING.sm,
        paddingBottom: SPACING.sm,
    },
    settingsButton: {
        padding: SPACING.sm,
    },
    logoutButton: {
        padding: SPACING.sm,
    },
    logoutButtonDisabled: {
        opacity: 0.6,
    },
    profileHeader: {
        alignItems: 'center',
        paddingTop: SPACING.md,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: SPACING.md,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: BORDER_RADIUS.round,
        borderWidth: 4,
        borderColor: COLORS.card,
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#3B3C36',
        width: 36,
        height: 36,
        borderRadius: BORDER_RADIUS.round,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: COLORS.card,
    },
    userName: {
        fontFamily: FONT.semiBold,
        fontSize: FONT_SIZE.xl,
        color: COLORS.text,
        marginTop: SPACING.sm,
    },
    userEmail: {
        fontFamily: FONT.regular,
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
    },
    userDetailsContainer: {
        flexDirection: 'row',
        marginTop: SPACING.md,
        paddingVertical: SPACING.sm,
        width: '90%',
        justifyContent: 'space-around',
        backgroundColor: COLORS.card,
        borderRadius: BORDER_RADIUS.md,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    userDetailItem: {
        alignItems: 'center',
    },
    userDetailDivider: {
        width: 1,
        height: '100%',
        backgroundColor: COLORS.border,
    },
    detailLabel: {
        fontFamily: FONT.regular,
        fontSize: FONT_SIZE.xs,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    detailValue: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.md,
        color: COLORS.text,
    },
    editProfileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.lg,
        backgroundColor: '#3B3C36',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: BORDER_RADIUS.round,
    },
    editIcon: {
        marginRight: SPACING.xs,
    },
    editProfileText: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.sm,
        color: COLORS.card,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: SPACING.lg,
        paddingHorizontal: SPACING.md,
    },
    statItem: {
        alignItems: 'center',
        backgroundColor: COLORS.card,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: BORDER_RADIUS.md,
        width: '45%',
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.round,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    statValue: {
        fontFamily: FONT.semiBold,
        fontSize: FONT_SIZE.xl,
        color: COLORS.text,
    },
    statLabel: {
        fontFamily: FONT.regular,
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    sectionContainer: {
        marginTop: SPACING.xl,
        paddingHorizontal: SPACING.md,
    },
    sectionTitle: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.md,
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    infoCard: {
        backgroundColor: COLORS.card,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    infoLabel: {
        fontFamily: FONT.regular,
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
    },
    infoValue: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.sm,
        color: COLORS.text,
    },
    statusBadge: {
        backgroundColor: COLORS.success + '20',
        paddingVertical: 2,
        paddingHorizontal: SPACING.sm,
        borderRadius: BORDER_RADIUS.round,
    },
    statusText: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.xs,
        color: COLORS.success,
    },
    securityRow: {
        paddingVertical: SPACING.sm,
    },
    securityInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    securityTextContainer: {
        marginLeft: SPACING.sm,
        flex: 1,
    },
    securityTitle: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.sm,
        color: COLORS.text,
        marginBottom: 2,
    },
    securityDescription: {
        fontFamily: FONT.regular,
        fontSize: FONT_SIZE.xs,
        color: COLORS.textSecondary,
        lineHeight: 16,
    },
    buttonContainer: {
        paddingHorizontal: SPACING.md,
        marginTop: SPACING.xl,
        alignItems: 'center',
        gap: SPACING.md,
    },
    outlinedButton: {
        borderWidth: 1,
        borderColor: '#3B3C36',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        borderRadius: BORDER_RADIUS.round,
        alignItems: 'center',
        width: '100%',
    },
    outlinedButtonText: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.sm,
        color: '#3B3C36',
    },
    logoutButtonLarge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.error,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: BORDER_RADIUS.round,
        width: '100%',
        gap: SPACING.sm,
    },
    logoutButtonText: {
        fontFamily: FONT.semiBold,
        fontSize: FONT_SIZE.md,
        color: COLORS.card,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    errorText: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.md,
        color: COLORS.error,
    },
});