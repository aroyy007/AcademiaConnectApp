import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    Modal,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { X, Image as ImageIcon, Smile, MapPin, Calendar, CircleAlert as AlertCircle, Camera, Users, Building, Globe } from 'lucide-react-native';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { FONT, FONT_SIZE } from '@/constants/typography';
import { SPACING, BORDER_RADIUS } from '@/constants/spacing';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import { pickImage, takePhoto, validateImageFile, showImagePickerOptions, ImagePickerResult } from '@/utils/imageUtils';

const MAX_TITLE_CHARACTERS = 100;
const MAX_CONTENT_CHARACTERS = 500;

interface PostData {
    title: string;
    content: string;
    imageUrl?: string;
    isAnnouncement: boolean;
}

export default function CreateScreen() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedImage, setSelectedImage] = useState<ImagePickerResult | null>(null);
    const [isAnnouncement, setIsAnnouncement] = useState(false);
    const [postVisibility, setPostVisibility] = useState<'friends' | 'department' | 'public'>('public');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showImageOptions, setShowImageOptions] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [postError, setPostError] = useState<string | null>(null);

    const { createPost } = usePosts();
    const { user, profile } = useAuth();

    const titleCharacterCount = title.length;
    const contentCharacterCount = content.length;
    const isTitleOverLimit = titleCharacterCount > MAX_TITLE_CHARACTERS;
    const isContentOverLimit = contentCharacterCount > MAX_CONTENT_CHARACTERS;

    const canPost = title.trim().length > 0 &&
        content.trim().length > 0 &&
        !isTitleOverLimit &&
        !isContentOverLimit &&
        user?.id;

    const handlePost = async () => {
        if (!canPost || isPosting || !user?.id) {
            if (!user?.id) {
                setPostError('You must be logged in to create a post.');
            } else if (!title.trim()) {
                setPostError('Post title is required.');
            } else if (!content.trim()) {
                setPostError('Post content is required.');
            }
            return;
        }

        setIsPosting(true);
        setPostError(null);

        try {
            // Combine title and content for the post content
            const postContent = title.trim() + '\n\n' + content.trim();

            console.log("Attempting to create post with:", {
                content: postContent,
                image: selectedImage,
                authorId: user.id,
                isAnnouncement,
            });

            // Pass the image picker result for upload
            const { error } = await createPost(
                postContent,
                selectedImage || undefined,
                isAnnouncement
            );

            if (error) {
                console.error("Post creation error:", error);
                throw error;
            }

            // Clear form after successful post
            setTitle('');
            setContent('');
            setSelectedImage(null);
            setIsAnnouncement(false);
            setPostVisibility('public');

            // Show success message in UI instead of Alert
            setPostError(null);
            router.back();
        } catch (err: any) {
            console.error("Failed to create post:", err);
            let errorMessage = "Failed to create post. Please try again.";

            // Handle specific error types
            if (err.code === '23514') {
                errorMessage = "Invalid data provided. Please check your input.";
            } else if (err.code === '42501') {
                errorMessage = "You don't have permission to create posts.";
            } else if (err.message) {
                errorMessage = err.message;
            }

            setPostError(errorMessage);
        } finally {
            setIsPosting(false);
        }
    };

    const handleImagePicker = async () => {
        try {
            if (Platform.OS === 'web') {
                // Web: Direct image picker
                const result = await pickImage({
                    allowsEditing: true,
                    aspect: [16, 9],
                    quality: 0.8,
                });

                if (result) {
                    validateImageFile(result, 10);
                    setSelectedImage(result);
                }
            } else {
                // Mobile: Show options modal
                setShowImageOptions(true);
            }
        } catch (error: any) {
            console.error('Image picker error:', error);
            setPostError(error.message || 'Failed to select image. Please try again.');
        }
    };

    const handleImageOption = async (option: 'camera' | 'gallery') => {
        setShowImageOptions(false);

        try {
            let result: ImagePickerResult | null = null;

            if (option === 'camera') {
                result = await takePhoto({
                    allowsEditing: true,
                    aspect: [16, 9],
                    quality: 0.8,
                });
            } else {
                result = await pickImage({
                    allowsEditing: true,
                    aspect: [16, 9],
                    quality: 0.8,
                });
            }

            if (result) {
                validateImageFile(result, 10);
                setSelectedImage(result);
            }
        } catch (error: any) {
            console.error('Image selection error:', error);
            setPostError(error.message || 'Failed to select image. Please try again.');
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
    };

    const insertEmoji = (emoji: string) => {
        setContent(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const commonEmojis = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '💯', '🚀', '📚', '💻', '🎓', '✨'];

    // Show authentication error if user is not logged in
    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <AlertCircle size={48} color={COLORS.error} />
                    <Text style={styles.errorTitle}>Authentication Required</Text>
                    <Text style={styles.errorMessage}>
                        Please log in to create posts.
                    </Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => router.back()}
                >
                    <X size={24} color={COLORS.text} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.postButton,
                        canPost && !isPosting ? styles.postButtonActive : styles.postButtonDisabled
                    ]}
                    onPress={handlePost}
                    disabled={!canPost || isPosting}
                >
                    {isPosting ? (
                        <ActivityIndicator size="small" color={COLORS.card} />
                    ) : (
                        <Text style={[
                            styles.postButtonText,
                            canPost ? styles.postButtonTextActive : styles.postButtonTextDisabled
                        ]}>
                            Post
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* User info */}
                <View style={styles.userSection}>
                    <Image
                        source={{
                            uri: profile?.avatar_url || 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'
                        }}
                        style={styles.userAvatar}
                    />
                    <View style={styles.inputContainer}>
                        {/* Title Input */}
                        <View style={styles.titleContainer}>
                            <TextInput
                                style={styles.titleInput}
                                placeholder="Post title..."
                                placeholderTextColor={COLORS.placeholder}
                                value={title}
                                onChangeText={setTitle}
                                maxLength={MAX_TITLE_CHARACTERS + 20}
                                editable={!isPosting}
                            />
                            <Text style={[
                                styles.characterCount,
                                isTitleOverLimit && styles.characterCountError
                            ]}>
                                {titleCharacterCount}/{MAX_TITLE_CHARACTERS}
                            </Text>
                        </View>

                        {/* Content Input */}
                        <TextInput
                            style={styles.contentInput}
                            placeholder="What's happening?"
                            placeholderTextColor={COLORS.placeholder}
                            multiline
                            value={content}
                            onChangeText={setContent}
                            maxLength={MAX_CONTENT_CHARACTERS + 20}
                            editable={!isPosting}
                        />

                        {selectedImage && (
                            <View style={styles.imagePreview}>
                                <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={removeImage}
                                    disabled={isPosting}
                                >
                                    <X size={20} color={COLORS.card} />
                                </TouchableOpacity>
                                <View style={styles.fileInfoContainer}>
                                    <Text style={styles.fileInfoText}>
                                        {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* Announcement Toggle */}
                {profile?.is_faculty && (
                    <View style={styles.announcementSection}>
                        <TouchableOpacity
                            style={[
                                styles.announcementToggle,
                                isAnnouncement && styles.announcementToggleActive
                            ]}
                            onPress={() => setIsAnnouncement(!isAnnouncement)}
                            disabled={isPosting}
                        >
                            <Text style={[
                                styles.announcementToggleText,
                                isAnnouncement && styles.announcementToggleTextActive
                            ]}>
                                📢 Mark as Announcement
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Post Visibility Section */}
                <View style={styles.visibilitySection}>
                    <Text style={styles.visibilityTitle}>Who can see this post?</Text>
                    <View style={styles.visibilityOptions}>
                        <TouchableOpacity
                            style={[
                                styles.visibilityOption,
                                postVisibility === 'friends' && styles.visibilityOptionActive
                            ]}
                            onPress={() => setPostVisibility('friends')}
                            disabled={isPosting}
                        >
                            <Users size={20} color={postVisibility === 'friends' ? COLORS.primary : COLORS.textSecondary} />
                            <Text style={[
                                styles.visibilityOptionText,
                                postVisibility === 'friends' && styles.visibilityOptionTextActive
                            ]}>
                                Friends
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.visibilityOption,
                                postVisibility === 'department' && styles.visibilityOptionActive
                            ]}
                            onPress={() => setPostVisibility('department')}
                            disabled={isPosting}
                        >
                            <Building size={20} color={postVisibility === 'department' ? COLORS.primary : COLORS.textSecondary} />
                            <Text style={[
                                styles.visibilityOptionText,
                                postVisibility === 'department' && styles.visibilityOptionTextActive
                            ]}>
                                Department
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.visibilityOption,
                                postVisibility === 'public' && styles.visibilityOptionActive
                            ]}
                            onPress={() => setPostVisibility('public')}
                            disabled={isPosting}
                        >
                            <Globe size={20} color={postVisibility === 'public' ? COLORS.primary : COLORS.textSecondary} />
                            <Text style={[
                                styles.visibilityOptionText,
                                postVisibility === 'public' && styles.visibilityOptionTextActive
                            ]}>
                                Public
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Error message display */}
                {postError && (
                    <View style={styles.postErrorContainer}>
                        <AlertCircle size={20} color={COLORS.error} />
                        <Text style={styles.postErrorMessage}>{postError}</Text>
                    </View>
                )}

                {/* Media options */}
                <View style={styles.mediaOptions}>
                    <TouchableOpacity
                        style={styles.mediaButton}
                        onPress={handleImagePicker}
                        disabled={isPosting}
                    >
                        <ImageIcon size={20} color={isPosting ? COLORS.disabled : COLORS.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.mediaButton}
                        onPress={() => setShowEmojiPicker(true)}
                        disabled={isPosting}
                    >
                        <Smile size={20} color={isPosting ? COLORS.disabled : COLORS.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.mediaButton} disabled={isPosting}>
                        <MapPin size={20} color={isPosting ? COLORS.disabled : COLORS.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.mediaButton} disabled={isPosting}>
                        <Calendar size={20} color={isPosting ? COLORS.disabled : COLORS.primary} />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Character counter for content */}
            <View style={styles.footer}>
                <View style={styles.characterCounter}>
                    <Text style={[
                        styles.characterCount,
                        isContentOverLimit && styles.characterCountError
                    ]}>
                        {contentCharacterCount}/{MAX_CONTENT_CHARACTERS}
                    </Text>
                </View>
            </View>

            {/* Image Options Modal (Mobile) */}
            <Modal
                visible={showImageOptions}
                transparent
                animationType="slide"
                onRequestClose={() => setShowImageOptions(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.imageOptionsModal}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Image</Text>
                            <TouchableOpacity onPress={() => setShowImageOptions(false)}>
                                <X size={24} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.imageOptionsContainer}>
                            <TouchableOpacity
                                style={styles.imageOption}
                                onPress={() => handleImageOption('camera')}
                            >
                                <Camera size={24} color={COLORS.primary} />
                                <Text style={styles.imageOptionText}>Take Photo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.imageOption}
                                onPress={() => handleImageOption('gallery')}
                            >
                                <ImageIcon size={24} color={COLORS.primary} />
                                <Text style={styles.imageOptionText}>Choose from Gallery</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Emoji Picker Modal */}
            <Modal
                visible={showEmojiPicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowEmojiPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.emojiPicker}>
                        <View style={styles.emojiHeader}>
                            <Text style={styles.emojiTitle}>Quick Emojis</Text>
                            <TouchableOpacity onPress={() => setShowEmojiPicker(false)}>
                                <X size={24} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.emojiGrid}>
                            {commonEmojis.map((emoji, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.emojiButton}
                                    onPress={() => insertEmoji(emoji)}
                                >
                                    <Text style={styles.emoji}>{emoji}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </Modal>
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
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    closeButton: {
        padding: SPACING.xs,
    },
    postButton: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.round,
        minWidth: 60,
        alignItems: 'center',
    },
    postButtonActive: {
        backgroundColor: COLORS.primary,
    },
    postButtonDisabled: {
        backgroundColor: COLORS.disabled,
    },
    postButtonText: {
        fontFamily: FONT.semiBold,
        fontSize: FONT_SIZE.md,
    },
    postButtonTextActive: {
        color: COLORS.card,
    },
    postButtonTextDisabled: {
        color: COLORS.placeholder,
    },
    content: {
        flex: 1,
    },
    userSection: {
        flexDirection: 'row',
        padding: SPACING.md,
    },
    userAvatar: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS.round,
        marginRight: SPACING.sm,
    },
    inputContainer: {
        flex: 1,
    },
    titleContainer: {
        marginBottom: SPACING.md,
    },
    titleInput: {
        fontFamily: FONT.semiBold,
        fontSize: FONT_SIZE.lg,
        color: COLORS.text,
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    contentInput: {
        fontFamily: FONT.regular,
        fontSize: FONT_SIZE.md,
        color: COLORS.text,
        lineHeight: 24,
        minHeight: 120,
        textAlignVertical: 'top',
    },
    characterCount: {
        fontFamily: FONT.regular,
        fontSize: FONT_SIZE.xs,
        color: COLORS.textSecondary,
        textAlign: 'right',
        marginTop: SPACING.xs,
    },
    characterCountError: {
        color: COLORS.error,
    },
    imagePreview: {
        position: 'relative',
        marginTop: SPACING.md,
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: BORDER_RADIUS.md,
    },
    removeImageButton: {
        position: 'absolute',
        top: SPACING.sm,
        right: SPACING.sm,
        backgroundColor: COLORS.overlay,
        borderRadius: BORDER_RADIUS.round,
        padding: SPACING.xs,
    },
    fileInfoContainer: {
        position: 'absolute',
        bottom: SPACING.sm,
        left: SPACING.sm,
        backgroundColor: COLORS.overlay,
        borderRadius: BORDER_RADIUS.sm,
        padding: SPACING.xs,
    },
    fileInfoText: {
        fontFamily: FONT.regular,
        fontSize: FONT_SIZE.xs,
        color: COLORS.card,
    },
    announcementSection: {
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.md,
    },
    announcementToggle: {
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.md,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        alignItems: 'center',
    },
    announcementToggleActive: {
        backgroundColor: COLORS.accent + '20',
        borderColor: COLORS.accent,
    },
    announcementToggleText: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
    },
    announcementToggleTextActive: {
        color: COLORS.accentDark,
    },
    mediaOptions: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        marginLeft: 60,
    },
    mediaButton: {
        padding: SPACING.sm,
        marginRight: SPACING.md,
    },
    footer: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        alignItems: 'flex-end',
    },
    characterCounter: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    postErrorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.error + '10',
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        marginHorizontal: SPACING.md,
        marginTop: SPACING.md,
    },
    postErrorMessage: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.sm,
        color: COLORS.error,
        marginLeft: SPACING.sm,
        flex: 1,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    errorTitle: {
        fontFamily: FONT.semiBold,
        fontSize: FONT_SIZE.xl,
        color: COLORS.text,
        marginTop: SPACING.md,
        marginBottom: SPACING.sm,
    },
    errorMessage: {
        fontFamily: FONT.regular,
        fontSize: FONT_SIZE.md,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.lg,
    },
    backButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        borderRadius: BORDER_RADIUS.md,
    },
    backButtonText: {
        fontFamily: FONT.semiBold,
        fontSize: FONT_SIZE.md,
        color: COLORS.card,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: COLORS.overlay,
        justifyContent: 'flex-end',
    },
    imageOptionsModal: {
        backgroundColor: COLORS.card,
        borderTopLeftRadius: BORDER_RADIUS.lg,
        borderTopRightRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    modalTitle: {
        fontFamily: FONT.semiBold,
        fontSize: FONT_SIZE.lg,
        color: COLORS.text,
    },
    imageOptionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: SPACING.md,
    },
    imageOption: {
        alignItems: 'center',
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.background,
        minWidth: 120,
    },
    imageOptionText: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.sm,
        color: COLORS.text,
        marginTop: SPACING.sm,
    },
    emojiPicker: {
        backgroundColor: COLORS.card,
        borderTopLeftRadius: BORDER_RADIUS.lg,
        borderTopRightRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        maxHeight: '50%',
    },
    emojiHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    emojiTitle: {
        fontFamily: FONT.semiBold,
        fontSize: FONT_SIZE.lg,
        color: COLORS.text,
    },
    emojiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    emojiButton: {
        width: '20%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.sm,
    },
    emoji: {
        fontSize: 24,
    },
    visibilitySection: {
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.md,
    },
    visibilityTitle: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.md,
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    visibilityOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: SPACING.sm,
    },
    visibilityOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.md,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.xs,
    },
    visibilityOptionActive: {
        backgroundColor: COLORS.primary + '10',
        borderColor: COLORS.primary,
    },
    visibilityOptionText: {
        fontFamily: FONT.medium,
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        marginLeft: SPACING.xs,
    },
    visibilityOptionTextActive: {
        color: COLORS.primary,
    },
});