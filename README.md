
<div align="center">
  <img src="./assets/images/logo.png" alt="Academia Connect Logo" width="400"/>
  
  **A comprehensive social networking platform designed specifically for East Delta University students to connect, share, and collaborate within their academic community.**

  [![React Native](https://img.shields.io/badge/React%20Native-0.79.0-blue.svg)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-~53.0.11-black.svg)](https://expo.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-~5.3.0-blue.svg)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg)](https://supabase.com/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technical Architecture](#technical-architecture)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Installation & Setup](#installation--setup)
- [Development Guide](#development-guide)
- [Contributing](#contributing)
- [Project Structure](#project-structure)
- [Design System](#design-system)
- [Security & Privacy](#security--privacy)
- [Performance](#performance)


---

## 🎯 Overview

Academia Connect is a modern, feature-rich social networking platform built specifically for East Delta University. It combines social media functionality with academic tools to create a comprehensive ecosystem for students and faculty to interact, share knowledge, and manage their academic life.

### Key Highlights

- 🎓 **Academic-First Design**: Built specifically for university environments
- 🔐 **Secure Authentication**: EDU email validation and secure session management
- 📱 **Cross-Platform**: Native iOS, Android, and Web support via Expo
- ⚡ **Real-Time Features**: Live messaging, notifications, and updates
- 🎨 **Modern UI/UX**: Clean, accessible design with dark/light theme support
- 🔒 **Privacy-Focused**: Comprehensive RLS policies and data protection

---

## ✨ Features

### � Anuthentication & Security
- **EDU Email Validation**: Restricted to `@eastdelta.edu.bd` emails
- **Secure Session Management**: JWT-based authentication with Supabase
- **Profile Creation**: Comprehensive academic profile setup
- **Avatar Management**: Image upload and management system
- **Session Persistence**: Automatic login state management
- **Google OAuth**: Alternative sign-in method (configured)

### 👥 Social Features
- **Dynamic Feed**: Personalized content feed with friend posts and announcements
- **Post Creation**: Rich text posts with image attachments
- **Engagement System**: Like and comment functionality
- **Real-Time Updates**: Live feed updates using Supabase subscriptions
- **Content Moderation**: Announcement system for official communications
- **Media Sharing**: Image upload and display with optimized storage

### 🤝 Friend System
- **Friend Requests**: Send, receive, accept, and reject friend requests
- **Bidirectional Relationships**: Automatic mutual friendship creation
- **Friend Management**: View and manage friend connections
- **Real-Time Notifications**: Instant friend request notifications
- **Privacy Controls**: Friend-only content visibility

### 👤 Profile Management
- **Academic Profiles**: Department, semester, section information
- **Role-Based System**: Student and faculty role distinction
- **Profile Editing**: Comprehensive profile update functionality
- **Avatar System**: Profile picture upload and management
- **Academic Information**: Student ID, department affiliation, current semester

### 🔍 Search & Discovery
- **User Search**: Search by name or email with real-time results
- **Advanced Filters**: Department and semester-based filtering
- **Friend Status**: Visual indicators for friend relationships
- **Quick Actions**: Direct friend request sending from search results

### 💬 Messaging System (In Development)
- **Real-Time Messaging**: Instant message delivery
- **Direct Messages**: One-on-one conversations
- **Group Chats**: Multi-user conversation support
- **Media Sharing**: Image, document, and file sharing
- **Read Receipts**: Message read status tracking
- **Typing Indicators**: Real-time typing status
- **Message Threading**: Reply-to-message functionality

### 📅 Schedule Management (In Development)
- **Course Enrollment**: Join and manage course schedules
- **Schedule Display**: Visual timetable representation
- **Time Conflict Detection**: Automatic scheduling conflict resolution
- **Faculty Schedule Management**: Instructor schedule creation and management
- **Academic Calendar**: Important dates and events

### 🔔 Notification System
- **Real-Time Notifications**: Instant push notifications
- **Notification Types**: Friend requests, post interactions, announcements
- **Notification Management**: Mark as read, bulk actions
- **Customizable Settings**: Notification preferences

---

## 🏗️ Technical Architecture

### Frontend Stack
```
React Native 0.79.0
├── Expo SDK ~53.0.11          # Development platform and build tools
├── TypeScript ~5.3.0          # Type safety and developer experience
├── Expo Router ~5.1.0         # File-based navigation system
├── React Navigation 7.0.0     # Navigation library
├── Formik 2.4.6              # Form handling and validation
├── Yup 1.3.3                 # Schema validation
├── Lucide React Native        # Icon system
├── React Native Reanimated    # Animations and gestures
└── Expo Vector Icons          # Additional icon sets
```

### Backend Stack
```
Supabase (Backend-as-a-Service)
├── PostgreSQL Database        # Primary data storage
├── Row Level Security (RLS)   # Data access policies
├── Real-time Subscriptions   # Live data updates
├── Authentication            # User management and JWT
├── Storage                   # File and media storage
├── Edge Functions           # Serverless functions
└── Database Functions       # Custom PostgreSQL functions
```

### Development Tools
```
Development Environment
├── Expo CLI                  # Development server and build tools
├── Metro Bundler            # JavaScript bundler
├── Babel                    # JavaScript transpiler
├── ESLint                   # Code linting
├── Prettier                 # Code formatting
└── TypeScript Compiler     # Type checking
```

---

## 🗄️ Database Schema

### Core Tables

#### `profiles` - User Information
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  student_id text UNIQUE,
  department_id uuid REFERENCES departments(id),
  semester integer CHECK (semester >= 1 AND semester <= 12),
  section text CHECK (section IN ('A', 'B', 'C', 'D')),
  avatar_url text,
  bio text,
  is_faculty boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### `posts` - Social Content
```sql
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES profiles(id) NOT NULL,
  content text NOT NULL,
  image_url text,
  is_announcement boolean DEFAULT false,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### `friendships` - User Relationships
```sql
CREATE TABLE friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  friend_id uuid REFERENCES profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);
```

#### `messages` - Chat System
```sql
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) NOT NULL,
  sender_id uuid REFERENCES profiles(id) NOT NULL,
  content text NOT NULL,
  attachment_url text,
  attachment_type text CHECK (attachment_type IN ('image', 'file', 'video')),
  reply_to_id uuid REFERENCES messages(id),
  created_at timestamptz DEFAULT now()
);
```

### Academic Tables

#### `departments` - Academic Departments
```sql
CREATE TABLE departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

#### `courses` - Course Catalog
```sql
CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  title text NOT NULL,
  department_id uuid REFERENCES departments(id),
  credits integer DEFAULT 3,
  created_at timestamptz DEFAULT now()
);
```

#### `schedules` - Class Schedules
```sql
CREATE TABLE schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) NOT NULL,
  instructor_id uuid REFERENCES profiles(id),
  semester integer NOT NULL,
  section text NOT NULL,
  day_of_week integer CHECK (day_of_week >= 1 AND day_of_week <= 7),
  start_time time NOT NULL,
  end_time time NOT NULL,
  room text,
  academic_year text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

---

## 📡 API Documentation

### Authentication Endpoints

#### Sign Up
```typescript
POST /auth/signup
Content-Type: application/json

{
  "email": "student@eastdelta.edu.bd",
  "password": "securePassword123",
  "metadata": {
    "fullName": "John Doe",
    "semester": 5,
    "section": "A",
    "departmentCode": "CSE"
  }
}

Response: {
  "user": { ... },
  "session": { ... }
}
```

#### Sign In
```typescript
POST /auth/signin
Content-Type: application/json

{
  "email": "student@eastdelta.edu.bd",
  "password": "securePassword123"
}

Response: {
  "user": { ... },
  "session": { ... }
}
```

### Profile Management

#### Get Profile
```typescript
GET /profiles/{userId}
Authorization: Bearer {jwt_token}

Response: {
  "id": "uuid",
  "email": "student@eastdelta.edu.bd",
  "full_name": "John Doe",
  "department": {
    "code": "CSE",
    "name": "Computer Science & Engineering"
  },
  "semester": 5,
  "section": "A",
  "avatar_url": "https://...",
  "is_faculty": false
}
```

#### Update Profile
```typescript
PUT /profiles/{userId}
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "full_name": "John Doe Updated",
  "bio": "Computer Science student",
  "semester": 6
}
```

### Social Features

#### Get Feed Posts
```typescript
GET /posts?limit=20&offset=0
Authorization: Bearer {jwt_token}

Response: {
  "data": [
    {
      "id": "uuid",
      "content": "Post content",
      "author": {
        "full_name": "Author Name",
        "avatar_url": "https://..."
      },
      "likes_count": 5,
      "comments_count": 2,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Post
```typescript
POST /posts
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data

{
  "content": "Post content",
  "image": File (optional),
  "is_announcement": false
}
```

#### Like/Unlike Post
```typescript
POST /posts/{postId}/like
Authorization: Bearer {jwt_token}

DELETE /posts/{postId}/like
Authorization: Bearer {jwt_token}
```

### Friend System

#### Send Friend Request
```typescript
POST /friend-requests
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "receiver_id": "uuid"
}
```

#### Get Friend Requests
```typescript
GET /friend-requests?type=received
Authorization: Bearer {jwt_token}

Response: {
  "data": [
    {
      "id": "uuid",
      "sender": {
        "full_name": "Sender Name",
        "avatar_url": "https://..."
      },
      "status": "pending",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Accept/Reject Friend Request
```typescript
PUT /friend-requests/{requestId}
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "status": "accepted" // or "rejected"
}
```

### Messaging System

#### Get Conversations
```typescript
GET /conversations
Authorization: Bearer {jwt_token}

Response: {
  "data": [
    {
      "id": "uuid",
      "name": "Conversation Name",
      "is_group": false,
      "participants": [...],
      "last_message": {...},
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Send Message
```typescript
POST /messages
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data

{
  "conversation_id": "uuid",
  "content": "Message content",
  "attachment": File (optional),
  "reply_to_id": "uuid" (optional)
}
```

---

## 🚀 Installation & Setup

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **Git**
- **iOS Simulator** (macOS) or **Android Studio** (for Android development)

### Environment Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/aroyy007/AcademiaConnectApp.git
   cd academiaconnectapp
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   ```env
   # Supabase Configuration
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Optional: Google OAuth (if using)
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. **Supabase Setup**
   
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Run the SQL scripts in the `supabase/` directory in order:
     ```bash
     # Execute these in your Supabase SQL editor
     1. create_core_tables_and_policies.sql
     2. create_messaging_tables_and_rls.sql
     3. create_storage_buckets_and_policies.sql
     4. seed_departments_courses_schedules.sql
     ```
   - Configure Storage buckets for `avatars`, `posts`, and `messages`
   - Set up authentication providers if using OAuth

5. **Start Development Server**
   ```bash
   npm start
   # or
   expo start
   ```

6. **Run on Device/Simulator**
   - **iOS**: Press `i` in the terminal or scan QR code with Camera app
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go app
   - **Web**: Press `w` in the terminal

### Database Seeding

To populate your database with sample data:

```sql
-- Insert sample departments
INSERT INTO departments (code, name) VALUES
  ('CSE', 'Computer Science & Engineering'),
  ('EEE', 'Electrical & Electronic Engineering'),
  ('BBA', 'Bachelor of Business Administration'),
  ('ENG', 'English'),
  ('LAW', 'Law');

-- Insert sample courses
INSERT INTO courses (code, title, department_id, credits) VALUES
  ('CSE101', 'Introduction to Programming', (SELECT id FROM departments WHERE code = 'CSE'), 3),
  ('CSE201', 'Data Structures', (SELECT id FROM departments WHERE code = 'CSE'), 3),
  ('EEE101', 'Circuit Analysis', (SELECT id FROM departments WHERE code = 'EEE'), 3);
```

---

## 👨‍💻 Development Guide

### Project Structure

```
academia-connect/
├── app/                          # Expo Router pages
│   ├── (tabs)/                   # Tab-based navigation
│   │   ├── feed.tsx             # Main feed screen
│   │   ├── profile.tsx          # User profile screen
│   │   ├── schedule.tsx         # Schedule management
│   │   ├── notifications.tsx    # Notifications screen
│   │   └── create.tsx           # Post creation screen
│   ├── index.tsx                # Welcome/landing screen
│   ├── login.tsx                # Authentication screen
│   ├── signup.tsx               # Registration screen
│   └── _layout.tsx              # Root layout configuration
├── components/                   # Reusable UI components
│   ├── auth/                    # Authentication components
│   ├── messaging/               # Chat and messaging components
│   ├── profile/                 # Profile-related components
│   └── ui/                      # Generic UI components
├── constants/                    # Design system constants
│   ├── colors.ts               # Color palette
│   ├── typography.ts           # Font and text styles
│   └── spacing.ts              # Spacing and border radius
├── hooks/                       # Custom React hooks
│   ├── useAuth.ts              # Authentication logic
│   ├── usePosts.ts             # Post management
│   ├── useFriends.ts           # Friend system logic
│   ├── useMessages.ts          # Messaging functionality
│   └── useSchedule.ts          # Schedule management
├── lib/                         # External service integrations
│   └── supabase.ts             # Supabase client and helpers
├── types/                       # TypeScript type definitions
│   ├── database.ts             # Database schema types
│   └── env.d.ts                # Environment variable types
├── utils/                       # Utility functions
│   ├── imageUtils.ts           # Image processing helpers
│   └── validation.ts           # Form validation schemas
├── supabase/                    # Database schema and migrations
│   ├── create_core_tables_and_policies.sql
│   ├── create_messaging_tables_and_rls.sql
│   └── seed_departments_courses_schedules.sql
├── assets/                      # Static assets
│   └── images/                 # App images and icons
├── package.json                # Dependencies and scripts
├── app.json                    # Expo configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Project documentation
```




### State Management

The app uses React's built-in state management with custom hooks:

- **Local State**: `useState` for component-specific state
- **Global State**: Custom hooks with context for shared state
- **Server State**: Supabase real-time subscriptions for live data
- **Form State**: Formik for complex form handling

### Testing Strategy

```typescript
// Component testing example
import { render, fireEvent } from '@testing-library/react-native';
import { PostCard } from '../PostCard';

describe('PostCard', () => {
  it('should handle like button press', () => {
    const mockOnLike = jest.fn();
    const { getByTestId } = render(
      <PostCard post={mockPost} onLike={mockOnLike} />
    );
    
    fireEvent.press(getByTestId('like-button'));
    expect(mockOnLike).toHaveBeenCalledWith(mockPost.id, false);
  });
});
```
---

## 🔒 Security & Privacy

### Authentication Security

- **JWT Tokens**: Secure token-based authentication
- **Session Management**: Automatic token refresh and validation
- **Email Verification**: Required for account activation
- **Password Requirements**: Minimum 8 characters with complexity rules

### Data Protection

- **Row Level Security (RLS)**: Database-level access control
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Parameterized queries and prepared statements
- **XSS Protection**: Input sanitization and output encoding

### Privacy Controls

- **Friend-Only Content**: Posts visible only to friends
- **Profile Privacy**: Control over profile information visibility
- **Data Minimization**: Only collect necessary user information
- **Right to Deletion**: Users can delete their accounts and data

### Security Policies

```sql
-- Example RLS policy for posts
CREATE POLICY "Users can view posts from friends or public announcements"
  ON posts
  FOR SELECT
  TO authenticated
  USING (
    is_announcement = true OR
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM friendships 
      WHERE user_id = auth.uid() 
      AND friend_id = author_id
    )
  );
```

---

## ⚡ Performance

### Optimization Strategies

#### Image Optimization
- **Lazy Loading**: Images load as they enter viewport
- **Compression**: Automatic image compression on upload
- **Caching**: Efficient image caching with Expo Image
- **Progressive Loading**: Placeholder images while loading

#### Database Performance
- **Indexing**: Strategic database indexes for common queries
- **Query Optimization**: Efficient SQL queries with proper joins
- **Connection Pooling**: Supabase handles connection management
- **Real-time Subscriptions**: Efficient WebSocket connections

#### App Performance
- **Code Splitting**: Dynamic imports for large components
- **Memoization**: React.memo and useMemo for expensive operations
- **Virtual Lists**: FlatList for large data sets
- **Bundle Optimization**: Tree shaking and dead code elimination

### Performance Monitoring

```typescript
// Performance tracking example
const trackPerformance = (operation: string, startTime: number) => {
  const endTime = Date.now();
  const duration = endTime - startTime;
  console.log(`${operation} took ${duration}ms`);
  
  // Send to analytics service
  analytics.track('performance', {
    operation,
    duration,
    timestamp: endTime
  });
};
```

---

## 🚀 Deployment

### Build Configuration

#### Production Build
```bash
# Build for production
expo build:android --type apk
expo build:ios --type archive

# Or using EAS Build (recommended)
eas build --platform android
eas build --platform ios
```

#### Environment Variables
```bash
# Production environment
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
EXPO_PUBLIC_ENVIRONMENT=production
```

### Deployment Platforms

#### Mobile App Stores
- **Google Play Store**: Android APK/AAB deployment
- **Apple App Store**: iOS IPA deployment via Xcode
- **Expo Application Services (EAS)**: Automated build and deployment

#### Web Deployment
```bash
# Build for web
expo export:web

# Deploy to Vercel, Netlify, or similar
npm run build:web
```

### CI/CD Pipeline

```yaml
# GitHub Actions example
name: Build and Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm run test
      - run: expo build:web
      - run: npm run deploy
```

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Getting Started

1. **Fork the Repository**
   ```bash
   git clone https://github.com/your-username/academia-connect.git
   cd academia-connect
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Your Changes**
   - Follow the code style guidelines
   - Add tests for new functionality
   - Update documentation as needed

4. **Commit Your Changes**
   ```bash
   git commit -m "Add amazing feature"
   ```

5. **Push to Your Branch**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Provide a clear description of your changes
   - Include screenshots for UI changes
   - Reference any related issues

### Contribution Guidelines

#### Code Standards
- **TypeScript**: Use proper typing throughout
- **ESLint**: Follow the configured linting rules
- **Prettier**: Format code consistently
- **Testing**: Write tests for new features
- **Documentation**: Update README and inline docs

#### Commit Messages
```bash
# Use conventional commit format
feat: add user search functionality
fix: resolve authentication bug
docs: update API documentation
style: improve button component styling
test: add unit tests for auth hook
```

#### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots
Include screenshots for UI changes
```

### Development Workflow

1. **Issue Creation**: Create an issue for bugs or feature requests
2. **Discussion**: Discuss implementation approach
3. **Development**: Implement changes following guidelines
4. **Testing**: Ensure all tests pass
5. **Review**: Submit PR for code review
6. **Merge**: Merge after approval

---

## 🐛 Troubleshooting

### Common Issues

#### Installation Problems

**Node Modules Issues**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Expo CLI Issues**
```bash
# Update Expo CLI
npm install -g @expo/cli@latest

# Clear Expo cache
expo r -c
```

#### Development Issues

**Metro Bundler Problems**
```bash
# Reset Metro cache
npx react-native start --reset-cache

# Or with Expo
expo start -c
```

**iOS Simulator Issues**
```bash
# Reset iOS Simulator
xcrun simctl erase all

# Rebuild iOS
cd ios && xcodebuild clean
```

**Android Emulator Issues**
```bash
# Cold boot Android emulator
emulator -avd YourAVD -cold-boot

# Clear Android build
cd android && ./gradlew clean
```

#### Database Issues

**Supabase Connection Problems**
```typescript
// Check environment variables
console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('Supabase Key:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

// Test connection
const testConnection = async () => {
  const { data, error } = await supabase.from('profiles').select('count');
  console.log('Connection test:', { data, error });
};
```

**RLS Policy Issues**
```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Test policy with specific user
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-uuid-here';
SELECT * FROM posts;
```

#### Authentication Issues

**Session Persistence Problems**
```typescript
// Clear stored session
import AsyncStorage from '@react-native-async-storage/async-storage';

const clearSession = async () => {
  await AsyncStorage.clear();
  await supabase.auth.signOut();
};
```

**Email Validation Issues**
```typescript
// Check email domain validation
const validateEDUEmail = (email: string) => {
  const eduDomain = '@eastdelta.edu.bd';
  return email.toLowerCase().endsWith(eduDomain);
};
```

### Debug Mode

Enable debug logging:
```typescript
// Add to app entry point
if (__DEV__) {
  console.log('Debug mode enabled');
  
  // Enable network logging
  global.XMLHttpRequest = global.originalXMLHttpRequest || global.XMLHttpRequest;
  global.FormData = global.originalFormData || global.FormData;
}
```

### Performance Issues

**Memory Leaks**
```typescript
// Proper cleanup in useEffect
useEffect(() => {
  const subscription = supabase
    .from('posts')
    .on('*', handlePostChange)
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

**Slow Rendering**
```typescript
// Use React.memo for expensive components
export const PostCard = React.memo(({ post, onLike }) => {
  // Component implementation
});

// Use useMemo for expensive calculations
const sortedPosts = useMemo(() => {
  return posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}, [posts]);
```

---

## 📞 Support

If you encounter any issues or have questions:

- **GitHub Issues**: [Create an issue](https://github.com/aroyy007/AcademiaConnectApp.git/issues)
- **Documentation**: Check this README and inline code comments
- **Community**: Join our Discord server for discussions
- **Email**: contact@academiaconnect.edu (for urgent matters)

---

<div align="center">
  <p>Made with ❤️ for East Delta University</p>
  <p>© 2024 Academia Connect. All rights reserved.</p>
</div>
