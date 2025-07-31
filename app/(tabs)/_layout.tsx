import React from 'react';
import { Tabs } from 'expo-router';
import { Chrome as Home, Bell, Calendar, User, Plus } from 'lucide-react-native';
import { View, Animated, TouchableOpacity, Platform, Text } from 'react-native';
import { COLORS } from '@/constants/colors';
import { FONT, FONT_SIZE } from '@/constants/typography';
import { SPACING } from '@/constants/spacing';
import { AuthGuard } from '@/components/auth/AuthGuard';

// Custom animated tab bar button component
const AnimatedTabButton = ({ 
  children, 
  onPress, 
  isActive, 
  isCenter = false 
}: { 
  children: React.ReactNode; 
  onPress: () => void; 
  isActive: boolean;
  isCenter?: boolean;
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const opacityAnim = React.useRef(new Animated.Value(isActive ? 1 : 0.6)).current;

  React.useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: isActive ? 1 : 0.6,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isActive, opacityAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  if (isCenter) {
    return (
      <View style={{
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: 72,
        marginBottom: -8, // Slight overlap with tab bar for seamless integration
      }}>
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          }}
        >
          <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.8}
            style={{
              // Semi-circular container - only top half visible
              width: 64,
              height: 32, // Half height for semi-circle effect
              backgroundColor: '#3B3C36',
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              justifyContent: 'flex-start', // Align icon to top of semi-circle
              alignItems: 'center',
              paddingTop: 6, // Position icon slightly below the top edge
              elevation: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              // Gradient-like effect with multiple shadows
              ...(Platform.OS === 'ios' && {
                shadowColor: '#3B3C36',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              }),
            }}
          >
            <Plus 
              size={20} 
              color="#FFFFFF" 
              strokeWidth={2.5}
            />
          </TouchableOpacity>
        </Animated.View>
        
        {/* Create Label */}
        <Text style={{
          fontFamily: FONT.medium,
          fontSize: 12,
          color: '#FFFFFF',
          marginTop: 4,
          textAlign: 'center',
          opacity: 0.9,
        }}>
          Create
        </Text>
      </View>
    );
  }

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 12,
          ...(Platform.OS === 'web' && {
            transition: 'all 0.2s ease-in-out',
          }),
        }}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function TabLayout() {
  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
          tabBarStyle: {
            backgroundColor: '#1A1A1A',
            borderTopWidth: 0,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            height: 72,
            paddingTop: 8,
            paddingBottom: 8,
            paddingLeft: 12,
            paddingRight: 12,
            elevation: 8,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
          },
          tabBarLabelStyle: {
            fontFamily: FONT.medium,
            fontSize: 12,
            marginTop: 4,
            lineHeight: 14,
          },
          tabBarItemStyle: {
            paddingVertical: 0,
            gap: 16, // Uniform 16px spacing between all tab items
          },
          headerShown: false,
          tabBarButton: (props) => {
            const isCenter = props.accessibilityRole === 'button' && 
                           props.children?.props?.children?.props?.name === 'create';
            
            return (
              <AnimatedTabButton
                onPress={props.onPress || (() => {})}
                isActive={props.accessibilityState?.selected || false}
                isCenter={isCenter}
              >
                {props.children}
              </AnimatedTabButton>
            );
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            href: null, // This hides the tab from the tab bar
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            href: null, // This hides the tab from the tab bar
          }}
        />
        <Tabs.Screen
          name="feed"
          options={{
            title: 'Feed',
            tabBarIcon: ({ color, size, focused }) => (
              <View style={{ alignItems: 'center' }}>
                <Home 
                  size={24} 
                  color={color} 
                  strokeWidth={focused ? 2.5 : 2}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: 'Notifications',
            tabBarIcon: ({ color, size, focused }) => (
              <View style={{ alignItems: 'center' }}>
                <Bell 
                  size={24} 
                  color={color} 
                  strokeWidth={focused ? 2.5 : 2}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: 'Create',
            tabBarIcon: ({ color, size, focused }) => (
              <Plus 
                size={20} 
                color="#FFFFFF" 
                strokeWidth={2.5}
              />
            ),
            tabBarLabel: () => null, // Hide default label since we have custom label
          }}
        />
        <Tabs.Screen
          name="schedule"
          options={{
            title: 'Schedule',
            tabBarIcon: ({ color, size, focused }) => (
              <View style={{ alignItems: 'center' }}>
                <Calendar 
                  size={24} 
                  color={color} 
                  strokeWidth={focused ? 2.5 : 2}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size, focused }) => (
              <View style={{ alignItems: 'center' }}>
                <User 
                  size={24} 
                  color={color} 
                  strokeWidth={focused ? 2.5 : 2}
                />
              </View>
            ),
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}