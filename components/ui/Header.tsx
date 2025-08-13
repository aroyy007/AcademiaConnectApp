import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  StatusBar,
  TextInput,
} from 'react-native';
import { Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { FONT, FONT_SIZE } from '@/constants/typography';
import { SPACING, BORDER_RADIUS } from '@/constants/spacing';

interface HeaderProps {
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (text: string) => void;
  searchValue?: string;
  variant?: 'default' | 'feed';
}

export const Header = ({ 
  showBackButton = false, 
  onBackPress, 
  rightComponent,
  showSearch = false,
  searchPlaceholder = "Search People",
  onSearchChange,
  searchValue = "",
  variant = 'default'
}: HeaderProps) => {
  const router = useRouter();

  const handleSearchPress = () => {
    router.push('/(tabs)/search');
  };

  if (variant === 'feed') {
    return (
      <View style={styles.feedContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.feedContent}>
          <View style={styles.feedHeader}>
            {/* Logo */}
            <Image 
              source={require('@/assets/images/logo.png')} 
              style={styles.feedLogo} 
              resizeMode="contain"
            />
            
            {/* Modern Search Box */}
            {showSearch && (
              <TouchableOpacity 
                style={styles.modernSearchContainer}
                onPress={handleSearchPress}
                activeOpacity={0.9}
              >
                <Search size={18} color="#FFFFFF" style={styles.modernSearchIcon} />
                <Text style={styles.modernSearchPlaceholder}>{searchPlaceholder}</Text>
              </TouchableOpacity>
            )}
            
            {rightComponent && (
              <View style={styles.feedRightSection}>
                {rightComponent}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }

  // Default header variant (existing implementation)
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.leftSection}>
            <Image 
              source={require('@/assets/images/logo.png')} 
              style={showSearch ? styles.logoSmall : styles.logo} 
              resizeMode="contain"
            />
          </View>
          
          {showSearch && (
            <TouchableOpacity 
              style={styles.searchContainer}
              onPress={handleSearchPress}
              activeOpacity={0.7}
            >
              <Search size={18} color={COLORS.textSecondary} style={styles.searchIcon} />
              <Text style={styles.searchPlaceholder}>{searchPlaceholder}</Text>
            </TouchableOpacity>
          )}
          
          {rightComponent && (
            <View style={styles.rightSection}>
              {rightComponent}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Default header styles
  container: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingTop: Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight || 0),
  },
  content: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    height: 40,
    width: 200,
  },
  logoSmall: {
    height: 32,
    width: 160,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: SPACING.md,
    marginLeft: SPACING.md,
    height: 36,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchPlaceholder: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: COLORS.placeholder,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },

  // Feed header styles with updated colors
  feedContainer: {
    backgroundColor: '#1A1A1A', // Dark gray/black header background
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    paddingTop: Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight || 0),
  },
  feedContent: {
    padding: SPACING.md,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feedLogo: {
    height: 48,
    width: 180,
    tintColor: '#FFFFFF', // White tint for logo visibility on dark background
  },
  
  // Modern Search Box Design with charcoal gray background
  modernSearchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B3C36', // Charcoal gray background for search box
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginLeft: SPACING.md,
    height: 48,
    // Enhanced interactive states
    ...(Platform.OS === 'web' && {
      transition: 'all 0.3s ease-in-out',
      cursor: 'pointer',
      ':hover': {
        backgroundColor: '#4A4B45', // Slightly lighter on hover
        transform: 'translateY(-1px)',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      ':focus': {
        backgroundColor: '#4A4B45',
        borderWidth: 1,
        borderColor: '#FFFFFF',
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      }
    }),
  },
  modernSearchIcon: {
    marginRight: 12,
    opacity: 0.8,
  },
  modernSearchPlaceholder: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 15,
    color: '#FFFFFF', // White text for contrast on charcoal background
    fontWeight: '400',
    letterSpacing: 0.2,
    opacity: 0.8, // Slightly transparent for placeholder effect
  },
  
  feedRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
});
