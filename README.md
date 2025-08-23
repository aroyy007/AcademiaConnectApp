# AcademiaConnect

A social networking platform designed specifically for East Delta University students to connect, share, and collaborate within their academic community.

## 🎯 Project Status

### ✅ Completed Features

1. **Authentication System**

   - Email/password registration with EDU email validation
   - Secure session management with Supabase
   - Profile creation with academic details
   - Avatar upload and management
   - Session persistence

2. **Social Features**

   - Feed with posts and announcements
   - Image sharing with post creation
   - Like and comment system
   - Real-time updates using Supabase subscriptions
   - Post visibility controls

3. **Friend System**

   - Send/receive friend requests
   - Accept/reject requests
   - Friend list management
   - Real-time friend request notifications

4. **Profile System**

   - Detailed academic profiles
   - Department and semester information
   - Faculty/Student role distinction
   - Profile editing capabilities
   - Avatar management

5. **User Search**

   - Search by name or email
   - Department and semester filters
   - Real-time search results
   - Friend status indicators

6. **Messaging Foundation**
   - Database schema implemented
   - Basic conversation structure
   - Real-time message delivery
   - Read receipts system
   - Typing indicators

### 🚧 In Progress

1. **Schedule System**

   - Database schema complete
   - Basic UI implemented
   - Working on:
     - Course enrollment
     - Schedule display
     - Time slot management
     - Faculty schedule management

2. **Messaging Interface**
   - Working on:
     - Conversation UI
     - Message thread view
     - Media sharing
     - Group chat functionality

### 🎯 Planned Features

1. **Enhanced Academic Features**

   - Course materials sharing
   - Assignment tracking
   - Study group formation
   - Academic calendar

2. **Advanced Social Features**
   - Event organization
   - Department-specific feeds
   - Club and society management
   - Academic announcements system

## 🛠 Technical Stack

- **Frontend**: React Native (Expo)
- **Backend**: Supabase
  - PostgreSQL Database
  - Real-time subscriptions
  - Storage for media
  - Authentication
- **State Management**: React Hooks + Context
- **Form Handling**: Formik + Yup
- **UI Components**: Custom React Native components
- **Icons**: Lucide React Native
- **Type Safety**: TypeScript

## 🗄️ Database Structure

### Core Tables

- `profiles`: User profiles and academic info
- `posts`: Social media content
- `post_likes`: Post interaction tracking
- `post_comments`: Comment system
- `friendships`: Bidirectional friend relationships
- `friend_requests`: Friend request management
- `notifications`: System notifications
- `departments`: Academic departments
- `courses`: Course catalog
- `schedules`: Class schedules
- `conversations`: Messaging system
- `messages`: Chat messages

## 🎨 Design System

Implements a consistent design system with:

- **Colors**: Defined in `constants/colors.ts`
- **Typography**: Custom font system with Inter font family
- **Spacing**: Standardized spacing scale
- **Components**: Reusable UI components
- **Platform Adaptations**: iOS and Android specific adjustments

## 🚀 Getting Started

### Prerequisites

- Node.js v16+
- npm or yarn
- Expo CLI
- Supabase account
- iOS Simulator/Android Emulator

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start development: `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request
