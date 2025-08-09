import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { User } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { FONT, FONT_SIZE } from '@/constants/typography';
import { SPACING, BORDER_RADIUS } from '@/constants/spacing';

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
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
}

interface CommentItemProps {
  comment: Comment;
}

export const CommentItem = ({ comment }: CommentItemProps) => {
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return commentDate.toLocaleDateString();
  };

  const getDepartmentInfo = () => {
    const profile = comment.profiles;
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
      <View style={styles.avatarContainer}>
        {comment.profiles?.avatar_url ? (
          <Image 
            source={{ uri: comment.profiles.avatar_url }} 
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <User size={16} color={COLORS.textSecondary} />
          </View>
        )}
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.authorName}>
            {comment.profiles?.full_name || 'Unknown User'}
          </Text>
          <Text style={styles.timestamp}>
            {formatTimeAgo(comment.created_at)}
          </Text>
        </View>
        
        {getDepartmentInfo() && (
          <Text style={styles.authorMeta}>
            {getDepartmentInfo()}
          </Text>
        )}
        
        <Text style={styles.content}>{comment.content}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  avatarContainer: {
    marginRight: SPACING.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.round,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  authorName: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  timestamp: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  authorMeta: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  content: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
});