import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
  Platform,
  BackHandler,
  Alert,
  AccessibilityInfo,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { FONT, FONT_SIZE } from '@/constants/typography';
import { SPACING, BORDER_RADIUS } from '@/constants/spacing';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

// Floating particle component for subtle background animation
const FloatingParticle = ({ 
  delay = 0, 
  size = 4, 
  reduceMotion = false 
}: { 
  delay?: number; 
  size?: number; 
  reduceMotion?: boolean;
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.1)).current;

  useEffect(() => {
    if (reduceMotion) {
      // Static particle for users who prefer reduced motion
      opacity.setValue(0.15);
      return;
    }

    const animate = () => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(translateY, {
              toValue: -30,
              duration: 8000 + delay * 100,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration: 8000 + delay * 100,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(translateX, {
              toValue: 15,
              duration: 6000 + delay * 50,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: -15,
              duration: 6000 + delay * 50,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: 0,
              duration: 6000 + delay * 50,
              useNativeDriver: true,
            }),
          ]),
          Animated.loop(
            Animated.sequence([
              Animated.timing(opacity, {
                toValue: 0.3,
                duration: 4000,
                useNativeDriver: true,
              }),
              Animated.timing(opacity, {
                toValue: 0.1,
                duration: 4000,
                useNativeDriver: true,
              }),
            ])
          ),
        ])
      ).start();
    };

    const timer = setTimeout(animate, delay);
    return () => clearTimeout(timer);
  }, [delay, translateY, translateX, opacity, reduceMotion]);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: reduceMotion ? [] : [{ translateY }, { translateX }],
          opacity,
          top: Math.random() * height * 0.8,
          left: Math.random() * width,
        },
      ]}
    />
  );
};

export default function WelcomeScreen() {
  const logoAnim = useRef(new Animated.Value(0)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    if (Platform.OS !== 'web') {
      AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    }
  }, []);

  // Android back button handler
  useEffect(() => {
    if (Platform.OS === 'android') {
      const backAction = () => {
        Alert.alert(
          "Exit App", 
          "Are you sure you want to exit Academia Connect?", 
          [
            { text: "Cancel", style: "cancel" },
            { text: "Exit", onPress: () => BackHandler.exitApp() }
          ]
        );
        return true;
      };

      const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
      return () => backHandler.remove();
    }
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      // Immediate appearance for reduced motion
      logoAnim.setValue(1);
      logoScale.setValue(1);
      buttonsAnim.setValue(1);
      backgroundOpacity.setValue(1);
      return;
    }

    // Entrance animation sequence
    Animated.sequence([
      // Background fade in
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Logo animation
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(logoAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      // Buttons animation with slight delay
      Animated.timing(buttonsAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoAnim, buttonsAnim, logoScale, backgroundOpacity, reduceMotion]);

  const handleLogin = () => {
    router.push('/login');
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Background Image with Selective Blur */}
      <Animated.View 
        style={[
          styles.backgroundContainer,
          { opacity: backgroundOpacity }
        ]}
      >
        {/* Blurred Background */}
        <View style={styles.blurredBackground}>
          <Image 
            source={require('../assets/images/image.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
          <View style={styles.blurOverlay} />
        </View>
        
        {/* Clear Logo Area */}
        <View style={styles.logoMask}>
          <Image 
            source={require('../assets/images/image.png')}
            style={styles.logoAreaImage}
            resizeMode="cover"
          />
        </View>
      </Animated.View>
      
      {/* Floating Particles */}
      <View style={styles.particlesContainer}>
        {Array.from({ length: 8 }).map((_, index) => (
          <FloatingParticle 
            key={index} 
            delay={index * 400} 
            size={Math.random() * 4 + 2}
            reduceMotion={reduceMotion}
          />
        ))}
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo Section */}
        <Animated.View
          style={[
            styles.logoSection,
            {
              opacity: logoAnim,
              transform: reduceMotion ? [] : [
                { scale: logoScale },
                {
                  translateY: logoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
              accessible={true}
              accessibilityLabel="Academia Connect Logo"
            />
            <Text style={styles.logoSubtext}>Connect • Learn • Grow</Text>
          </View>
        </Animated.View>

        {/* Buttons Section */}
        <Animated.View
          style={[
            styles.buttonsSection,
            {
              opacity: buttonsAnim,
              transform: reduceMotion ? [] : [
                {
                  translateY: buttonsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.8}
            accessible={true}
            accessibilityLabel="Login to your Academia Connect account"
            accessibilityRole="button"
            accessibilityHint="Navigate to login screen"
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.signUpButton}
            onPress={handleSignUp}
            activeOpacity={0.9}
            accessible={true}
            accessibilityLabel="Create a new Academia Connect account"
            accessibilityRole="button"
            accessibilityHint="Navigate to sign up screen"
          >
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    height: height,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -2,
  },
  blurredBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(3px)',
  },
  logoMask: {
    position: 'absolute',
    top: '25%',
    left: '50%',
    width: width > 768 ? 400 : width * 0.7,
    height: width > 768 ? 120 : 80,
    marginLeft: width > 768 ? -200 : -(width * 0.35),
    marginTop: width > 768 ? -60 : -40,
    overflow: 'hidden',
    borderRadius: BORDER_RADIUS.lg,
  },
  logoAreaImage: {
    width: '100%',
    height: '100%',
    opacity: 0.15,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  particle: {
    position: 'absolute',
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING.xxl * 2,
  },
  logoContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.xxl,
    borderRadius: BORDER_RADIUS.xl,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(58, 134, 255, 0.1)',
  },
  logoImage: {
    height: width > 768 ? 120 : 100,
    width: width > 768 ? 600 : width * 0.8,
    maxWidth: 500,
  },
  logoSubtext: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: '#3B3C36',
    marginTop: SPACING.sm,
    letterSpacing: 1,
    textAlign: 'center',
  },
  buttonsSection: {
    width: '100%',
    maxWidth: 320,
    gap: SPACING.lg,
  },
  loginButton: {
    backgroundColor: 'transparent', 
    borderWidth: 2, 
    borderColor: '#3B3C36', 
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.round,
    alignItems: 'center',
    shadowColor: '#3B3C36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 56,
  },
  loginButtonText: {
    fontFamily: FONT.semiBold,
    fontSize: FONT_SIZE.lg,
    color: '#3B3C36', 
    letterSpacing: 0.5,
  },
  signUpButton: {
    backgroundColor: '#3B3C36', 
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.round,
    alignItems: 'center',
    shadowColor: '#3B3C36',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    minHeight: 56,
  },
  signUpButtonText: {
    fontFamily: FONT.semiBold,
    fontSize: FONT_SIZE.lg,
    color: '#FFFFFF', 
    letterSpacing: 0.5,
  },
});