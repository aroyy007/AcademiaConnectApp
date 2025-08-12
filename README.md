# AcademiaConnect

A social networking platform designed specifically for East Delta University students to connect, share, and collaborate within their academic community.

## 🎯 Project Overview

AcademiaConnect is a React Native mobile application built with Expo that serves as a dedicated social platform for East Delta University students. The app enables students to create accounts using their EDU email addresses, connect with peers, share posts with images, and interact through a modern social interface.

## ✨ Features

### Currently Implemented
- ✅ **User Authentication**
  - Email/password registration and login
  - Secure session management with Supabase
  - EDU email validation (@eastdelta.edu.bd)
  - Profile management with avatar upload

- ✅ **Social Features**
  - Create and share posts with text and images
  - View posts from the community
  - Modern feed interface with pull-to-refresh
  - Image upload and processing

- ✅ **Profile System**
  - Customizable user profiles
  - Academic information (department, semester, section)
  - Profile picture upload and management
  - Faculty/Student role distinction

### Planned Features
- 🤝 **Social Connections**
  - Friend requests and connections
  - User search functionality
  - Direct messaging

- 📚 **Academic Features**
  - Class schedules
  - Course information
  - Academic announcements

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