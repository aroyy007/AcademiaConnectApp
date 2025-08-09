# AcademiaConnect

A social networking platform designed specifically for East Delta University students to connect, share, and collaborate within their academic community.

## 🎯 Project Overview

AcademiaConnect is a React Native mobile application built with Expo that serves as a dedicated social platform for East Delta University students. The app enables students to create accounts using their EDU email addresses, connect with peers, share posts, and access academic schedules.

## ✨ Features

### Currently Implemented
- ✅ **User Authentication**
  - Email/password registration and login
  - Google OAuth integration
  - EDU email validation (@eastdelta.edu.bd)
  - Secure session management with Supabase

- ✅ **User Profiles**
  - Complete profile creation with academic information
  - Department and semester tracking
  - Section assignment
  - Profile management and updates

### Planned Features
- 📝 **Social Features**
  - Create and share posts
  - Like and comment on posts
  - Friend requests and connections
  - User search functionality

- 📅 **Academic Features**
  - Class schedules viewing
  - Course information
  - Academic announcements

- 🔔 **Notifications**
  - Real-time notifications
  - Friend request alerts
  - Post interactions

## 🛠 Tech Stack

- **Frontend**: React Native with Expo
- **Navigation**: Expo Router
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Hooks
- **Form Handling**: Formik + Yup
- **UI Components**: Custom components with Lucide React Native icons
- **Styling**: StyleSheet (React Native)
- **TypeScript**: Full TypeScript support

## 📱 Supported Platforms

- iOS
- Android
- Web (Progressive Web App)

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aroyy007/AcademiaConnectApp.git
   cd AcademiaConnectApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Run on your preferred platform**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser
   - Scan QR code with Expo Go app for physical device

## 📁 Project Structure

```
AcademiaConnect/
├── app/                    # App screens and navigation
│   ├── (tabs)/            # Tab-based navigation screens
│   ├── _layout.tsx        # Root layout component
│   ├── index.tsx          # Welcome/landing screen
│   ├── login.tsx          # Login screen
│   └── signup.tsx         # Registration screen
├── components/            # Reusable UI components
│   ├── auth/             # Authentication-related components
│   └── ui/               # Generic UI components
├── constants/            # App constants
│   ├── colors.ts         # Color palette
│   ├── spacing.ts        # Spacing values
│   └── typography.ts     # Font and text styles
├── hooks/                # Custom React hooks
│   ├── useAuth.ts        # Authentication hook
│   └── useFrameworkReady.ts
├── lib/                  # External service integrations
│   └── supabase.ts       # Supabase client configuration
├── types/                # TypeScript type definitions
│   ├── database.ts       # Database schema types
│   └── env.d.ts          # Environment types
└── assets/               # Static assets (images, fonts)
```

## 🗄 Database Schema

The app uses Supabase with the following main tables:

- **profiles**: User profile information
- **departments**: Academic departments
- **courses**: Course catalog
- **posts**: User posts and content
- **post_likes**: Post like interactions
- **post_comments**: Post comments
- **friendships**: User connections
- **friend_requests**: Pending friend requests
- **notifications**: User notifications
- **schedules**: Class schedules
- **user_schedules**: User-specific schedule enrollments

## 🔐 Authentication Flow

1. **Registration**: Users sign up with EDU email (@eastdelta.edu.bd)
2. **Email Verification**: Supabase handles email verification
3. **Profile Creation**: Complete academic profile setup
4. **Session Management**: Automatic session handling with persistent login

## 🎨 Design System

The app follows a consistent design system with:

- **Color Palette**: Defined in `constants/colors.ts`
- **Typography**: Inter font family with multiple weights
- **Spacing**: Consistent spacing scale
- **Components**: Reusable UI components with proper accessibility

## 📱 Screens Overview

### Welcome Screen (`app/index.tsx`)
- Animated landing page with university branding
- Login and signup navigation
- Responsive design for all platforms

### Authentication Screens
- **Login** (`app/login.tsx`): Email/password and Google OAuth
- **Signup** (`app/signup.tsx`): Complete registration with academic info

### Main App (Planned)
- **Feed**: Social posts and interactions
- **Profile**: User profile management
- **Schedule**: Academic schedule viewing
- **Search**: Find and connect with peers

## 🔧 Development Scripts

```bash
# Start development server
npm run dev

# Build for web
npm run build:web

# Lint code
npm run lint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request



## 🎓 University

**East Delta University**
- Target audience: EDU students and faculty
- Email domain: @eastdelta.edu.bd

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team

---

**Note**: This project is currently in active development. The authentication and user management features are complete, with social features and academic tools planned for future releases.