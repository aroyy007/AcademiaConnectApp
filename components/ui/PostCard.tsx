import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Heart, MessageSquare, Share, MoveVertical as MoreVertical, Clock, Send } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { FONT, FONT_SIZE } from '@/constants/typography';
import { SPACING, BORDER_RADIUS } from '@/constants/spacing';
import { Post } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import { CommentItem, Comment } from './CommentItem';

interface PostCardProps {
  post: Post;
  onLike: (postId: string, isLiked: boolean) => void;
  onComment: (postId: string, content: string) => void;
  onShare: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

export const PostCard = ({ 
  post, 
  onLike, 
  onComment, 
  onShare, 
  onDelete 
}: PostCardProps) => {
  const { user } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  
  const isLiked = post.post_likes?.some(like => like.user_id === user?.id) || false;
  const isAuthor = post.author_id === user?.id;
  
  const handleLike = async () => {
    if (isLiking || !user) return;
    
    setIsLiking(true);
    try {
      await onLike(post.id, isLiked);
    } catch (error) {
      console.error('Error liking post:', error);
      Alert.alert('Error', 'Failed to like post. Please try again.');
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentPress = () => {
    setShowCommentInput(!showCommentInput);
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || isCommenting || !user) return;
    
    setIsCommenting(true);
    try {
      await onComment(post.id, commentText.trim());
      setCommentText('');
      setShowCommentInput(false);
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDelete = () => {
    if (!isAuthor || !onDelete) return;
    
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => onDelete(post.id)
        }
      ]
    );
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return postDate.toLocaleDateString();
  };

  const getDepartmentInfo = () => {
    const profile = post.profiles;
    if (!profile) return '';
    
    let info = '';
    if (profile.departments?.code) {
      info += profile.departments.code;
    }
    if (profile.semester) {
      info += ` • Semester ${profile.semester}`;
    }
    if (profile.section) {
      info += ` • Section ${profile.section}`;
    }
    if (profile.is_faculty) {
      info = 'Faculty' + (profile.departments?.code ? ` • ${profile.departments.code}` : '');
    }
    
    return info;
  };

  return (
    <View style={styles.container}>
      {/* Post Header */}
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <Image 
            source={{ 
              uri: post.profiles?.avatar_url || 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'
            }} 
            style={styles.avatar}
          />
          <View style={styles.authorDetails}>
            <Text style={styles.authorName}>
              {post.profiles?.full_name || 'Unknown User'}
            </Text>
            <Text style={styles.authorMeta}>
              {getDepartmentInfo()}
            </Text>
          </View>
        </View>
        
        <View style={styles.postMeta}>
          <View style={styles.timeContainer}>
            <Clock size={12} color={COLORS.textSecondary} />
            <Text style={styles.timestamp}>
              {formatTimeAgo(post.created_at)}
            </Text>
          </View>
          {isAuthor && (
            <TouchableOpacity onPress={handleDelete} style={styles.moreButton}>
              <MoreVertical size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Announcement Badge */}
      {post.is_announcement && (
        <View style={styles.announcementBadge}>
          <Text style={styles.announcementText}>📢 Announcement</Text>
        </View>
      )}

      {/* Post Content */}
      <Text style={styles.content}>{post.content}</Text>

      {/* Post Image */}
      {post.image_url && (
        <Image 
          source={{ uri: post.image_url }} 
          style={styles.postImage}
          resizeMode="cover"
        />
      )}

      {/* Post Actions */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, isLiked && styles.likedButton]}
          onPress={handleLike}
          disabled={isLiking}
        >
          <Heart 
            size={20} 
            color={isLiked ? COLORS.error : COLORS.textSecondary}
            fill={isLiked ? COLORS.error : 'none'}
          />
          <Text style={[
            styles.actionText,
            isLiked && styles.likedText
          ]}>
            {post.likes_count || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, showCommentInput && styles.activeCommentButton]}
          onPress={handleCommentPress}
        >
          <MessageSquare 
            size={20} 
            color={showCommentInput ? '#3B3C36' : COLORS.textSecondary}
          />
          <Text style={[
            styles.actionText,
            showCommentInput && styles.activeCommentText
          ]}>
            {post.comments_count || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onShare(post.id)}
        >
          <Share size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Comment Input */}
      {showCommentInput && (
        <View style={styles.commentInputContainer}>
          <Image 
            source={{ 
              uri: user?.user_metadata?.avatar_url || 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'
            }} 
            style={styles.commentAvatar}
          />
          <View style={styles.commentInputWrapper}>
            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment..."
              placeholderTextColor={COLORS.placeholder}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
              editable={!isCommenting}
            />
            <TouchableOpacity
              style={[
                styles.commentSubmitButton,
                (!commentText.trim() || isCommenting) && styles.commentSubmitButtonDisabled
              ]}
              onPress={handleCommentSubmit}
              disabled={!commentText.trim() || isCommenting}
            >
              {isCommenting ? (
                <ActivityIndicator size="small" color={COLORS.card} />
              ) : (
                <Send size={16} color={COLORS.card} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Comments List */}
      {post.post_comments && post.post_comments.length > 0 && (
        <View style={styles.commentsContainer}>
          <View style={styles.commentsDivider} />
          {post.post_comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  authorInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.sm,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontFamily: FONT.semiBold,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    marginBottom: 2,
  },
  authorMeta: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  postMeta: {
    alignItems: 'flex-end',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  timestamp: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  moreButton: {
    padding: SPACING.xs,
  },
  announcementBadge: {
    backgroundColor: COLORS.accent + '20',
    alignSelf: 'flex-start',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    marginBottom: SPACING.sm,
  },
  announcementText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.xs,
    color: COLORS.accentDark,
  },
  content: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.md,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
    gap: SPACING.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likedButton: {
    // Additional styling for liked state if needed
  },
  activeCommentButton: {
    // Additional styling for active comment state
  },
  actionText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  likedText: {
    color: COLORS.error,
  },
  activeCommentText: {
    color: '#3B3C36',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.sm,
  },
  commentInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  commentInput: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    maxHeight: 80,
    paddingVertical: SPACING.xs,
    paddingRight: SPACING.sm,
  },
  commentSubmitButton: {
    backgroundColor: '#3B3C36',
    borderRadius: BORDER_RADIUS.round,
    padding: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: 32,
  },
  commentSubmitButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  commentsContainer: {
    marginTop: SPACING.sm,
  },
  commentsDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
});
