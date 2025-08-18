# AcademiaConnect

A social networking platform designed specifically for East Delta University students to connect, share, and collaborate within their academic community.

## 🎯 Project Overview

AcademiaConnect is a React Native mobile application built with Expo that serves as a dedicated social platform for East Delta University students. The app enables students to create accounts using their EDU email addresses, connect with peers, share posts with images, and interact through a modern social interface.

## ✨ Features

### Currently Implemented

- ✅ **User Authentication**

  - Email/password registration and login
  - Google OAuth integration
  - EDU email validation (@eastdelta.edu.bd)
  - Secure session management with Supabase
  - Protected routes with AuthGuard

- ✅ **Social Features**

  - Create and share posts with text and images
  - Like and comment on posts in real-time
  - Modern feed interface with pull-to-refresh
  - Faculty announcement posts with special badges
  - Post visibility controls (Friends, Department, Public)
  - Rich content creation with emoji picker
  - Image upload with camera/gallery options

- ✅ **Friend System**

  - Send and receive friend requests
  - Accept/reject friend requests with real-time updates
  - Friend status tracking and management
  - Real-time friend request notifications

- ✅ **Search & Discovery**

  - Search users by name or EDU email
  - Filter results by department, semester, and section
  - Real-time search with instant results
  - Friend status indicators in search results

- ✅ **Notifications System**

  - Real-time notifications for friend requests
  - Post interaction notifications (likes, comments)
  - Unread notification badges and counters
  - Interactive notification actions (accept/reject)
  - Notification history and management

- ✅ **Messaging Foundation**

  - Floating message button with unread count
  - Direct conversation infrastructure
  - Real-time messaging backend
  - Typing indicators and message status

- ✅ **Profile System**
  - Customizable user profiles
  - Academic information (department, semester, section)
  - Profile picture upload and management
  - Faculty/Student role distinction

### In Progress

- 🚧 **Profile Management**

  - Complete profile editing interface
  - Bio and personal information updates
  - Advanced profile customization

- 🚧 **Class Schedules**
  - Personal schedule viewing
  - Course information display
  - Schedule sharing capabilities

### Planned Features

- 💬 **Complete Messaging**

  - Full messaging interface
  - Group conversations
  - File and media sharing
  - Message reactions and replies

- 📚 **Enhanced Academic Features**
  - Course enrollment tracking
  - Assignment and exam reminders
  - Academic calendar integration
  - Study group formation

## 🛠 Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase
  - Real-time PostgreSQL database
  - File storage for images
  - Authentication services
- **UI/UX**:
  - Custom React Native components
  - Lucide icons
  - Native platform styling
- **State Management**: React Hooks and Context
- **Form Handling**: Formik with Yup validation
- **TypeScript**: Full type safety

## 🗄 Database Structure

Core tables implemented:

- **profiles**: User information and academic details
- **posts**: Social media content
- **departments**: Academic department records
- **post_comments**: Post interaction system

## 🎨 Design System

Implements a consistent design system with:

- Color palette (defined in `constants/colors.ts`)
- Typography using standard fonts
- Consistent spacing and layout
- Platform-specific UI adaptations

## 🚀 Getting Started

### Prerequisites

- Node.js v16+
- npm or yarn
- Expo CLI
- Supabase account
- iOS Simulator or Android Emulator

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start development: `npm run dev`

## 📝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
