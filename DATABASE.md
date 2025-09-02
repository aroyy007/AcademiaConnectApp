# Database Documentation

<div align="center">
  <h2>Academia Connect Database Schema</h2>
  <p>Comprehensive documentation for the Academia Connect PostgreSQL database structure, relationships, and policies.</p>
</div>

---

## 📚 Quick Navigation

**📖 Documentation Hub**
- 📱 **[Main Documentation](README.md)** - Project overview, setup, and development guide
- 🚀 **[API Reference](API.md)** - REST API endpoints and authentication
- 🗄️ **[Database Schema](#)** - You are here! Complete database documentation

---

## 📋 Table of Contents

- [Overview](#overview)
- [Core Tables](#core-tables)
- [Academic Tables](#academic-tables)
- [Relationship Diagrams](#relationship-diagrams)
- [Security Policies](#security-policies)
- [Database Setup](#database-setup)
- [Seeding Data](#seeding-data)
- [Migration Scripts](#migration-scripts)

---

## 🎯 Overview

The Academia Connect database is built on PostgreSQL with Supabase as the backend-as-a-service platform. It implements a comprehensive schema designed specifically for university social networking, featuring user profiles, social interactions, academic management, and real-time messaging capabilities.

### Key Features

- **Row Level Security (RLS)**: Database-level access control for data protection
- **Real-time Subscriptions**: Live data updates using Supabase subscriptions
- **Academic Integration**: Purpose-built tables for university data management
- **Social Networking**: Complete friend system and content sharing capabilities
- **Messaging System**: Real-time chat with media sharing support

---

## 🗄️ Core Tables

### `profiles` - User Information

The central table for all user data, extending Supabase auth.users with academic information.

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

**Field Descriptions:**
- `id`: Primary key referencing Supabase auth.users
- `email`: University email address (validated as @eastdelta.edu.bd) - see [Authentication API](API.md#sign-up)
- `full_name`: User's complete name
- `student_id`: Unique student identification number
- `department_id`: Foreign key to [departments table](#departments---academic-departments)
- `semester`: Current semester (1-12 for undergraduate/graduate)
- `section`: Class section (A, B, C, or D)
- `avatar_url`: Profile picture URL in Supabase storage - see [Upload Avatar API](API.md#upload-avatar)
- `bio`: Optional user biography
- `is_faculty`: Boolean flag distinguishing faculty from students
- `is_active`: Account status flag

**Related API Endpoints:**
- [Get Profile](API.md#get-profile) - Retrieve user profile information
- [Update Profile](API.md#update-profile) - Modify profile data
- [Search Users](API.md#search-users) - Find users by name or email

### `posts` - Social Content

Stores all user-generated content including regular posts and official announcements.

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

**Field Descriptions:**
- `id`: Unique post identifier
- `author_id`: Foreign key to [profiles table](#profiles---user-information)
- `content`: Post text content (required)
- `image_url`: Optional attached image URL - see [Create Post API](API.md#create-post)
- `is_announcement`: Flag for official university announcements
- `likes_count`: Cached count of post likes - updated via [Like Post API](API.md#like-post)
- `comments_count`: Cached count of post comments - updated via [Create Comment API](API.md#create-comment)
- `created_at`: Post creation timestamp
- `updated_at`: Last modification timestamp

**Related API Endpoints:**
- [Get Feed Posts](API.md#get-feed-posts) - Retrieve posts for user's feed
- [Create Post](API.md#create-post) - Create new posts with images
- [Like/Unlike Post](API.md#like-post) - Manage post likes
- [Post Comments](API.md#get-post-comments) - Comment system

### `friendships` - User Relationships

Manages bidirectional friendship relationships between users.

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

**Field Descriptions:**
- `id`: Unique friendship record identifier
- `user_id`: First user in the friendship
- `friend_id`: Second user in the friendship
- `created_at`: Friendship establishment timestamp
- **Constraints**: Unique pair constraint and self-friendship prevention

### `friend_requests` - Friendship Management

Handles pending, accepted, and rejected friend requests.

```sql
CREATE TABLE friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES profiles(id) NOT NULL,
  receiver_id uuid REFERENCES profiles(id) NOT NULL,
  status text CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(sender_id, receiver_id),
  CHECK (sender_id != receiver_id)
);
```

### `messages` - Chat System

Stores all chat messages with support for attachments and threading.

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

**Field Descriptions:**
- `conversation_id`: Reference to the conversation thread
- `sender_id`: Message author
- `content`: Message text content
- `attachment_url`: Optional file attachment URL
- `attachment_type`: Type of attached media
- `reply_to_id`: Reference for threaded conversations

### `conversations` - Chat Threads

Manages chat conversations between users or groups.

```sql
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  is_group boolean DEFAULT false,
  created_by uuid REFERENCES profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### `conversation_participants` - Chat Membership

Links users to their conversations.

```sql
CREATE TABLE conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) NOT NULL,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);
```

---

## 🎓 Academic Tables

### `departments` - Academic Departments

Stores university department information.

```sql
CREATE TABLE departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

**Field Descriptions:**
- `code`: Short department code (e.g., 'CSE', 'EEE')
- `name`: Full department name

**Related API Endpoints:**
- [Get Departments](API.md#get-departments) - Retrieve all academic departments

### `courses` - Course Catalog

Comprehensive course information for the university.

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

**Field Descriptions:**
- `code`: Unique course code (e.g., 'CSE101')
- `title`: Course title
- `department_id`: Owning [department](#departments---academic-departments)
- `credits`: Credit hours for the course

**Related API Endpoints:**
- [Get Courses](API.md#get-courses) - Retrieve courses, optionally filtered by department

### `schedules` - Class Schedules

Manages class scheduling and timetables.

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

**Field Descriptions:**
- `course_id`: Reference to the [course being scheduled](#courses---course-catalog)
- `instructor_id`: Faculty member teaching the course (references [profiles](#profiles---user-information))
- `semester`: Academic semester number
- `section`: Class section identifier
- `day_of_week`: Day of the week (1=Monday, 7=Sunday)
- `start_time`: Class start time
- `end_time`: Class end time
- `room`: Classroom location
- `academic_year`: Academic year (e.g., '2024-2025')

**Related API Endpoints:**
- [Get User Schedule](API.md#get-user-schedule) - Retrieve schedule for specific user and semester

---

## 🔗 Relationship Diagrams

### Core Entity Relationships

```
auth.users (Supabase)
    ↓ (1:1)
profiles
    ↓ (1:many)
posts, messages, friend_requests
    ↓
friendships (many:many self-reference)
```

### Academic Relationships

```
departments
    ↓ (1:many)
courses, profiles
    ↓
schedules (links courses + instructors)
```

### Messaging Relationships

```
conversations
    ↓ (1:many)
messages, conversation_participants
    ↓
profiles (through participants)
```

---

## 🔒 Security Policies

### Row Level Security (RLS) Implementation

All tables implement comprehensive RLS policies to ensure data security and privacy.

#### Posts Access Policy

```sql
-- Users can view posts from friends or public announcements
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

#### Profile Access Policy

```sql
-- Users can view their own profile and friends' profiles
CREATE POLICY "Users can view accessible profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM friendships 
      WHERE user_id = auth.uid() 
      AND friend_id = id
    )
  );
```

#### Messages Access Policy

```sql
-- Users can only access messages in conversations they participate in
CREATE POLICY "Users can access their conversation messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = messages.conversation_id 
      AND user_id = auth.uid()
    )
  );
```

---

## 🚀 Database Setup

### Prerequisites

- Supabase project created
- PostgreSQL database access
- Supabase CLI installed (optional)

### Setup Steps

1. **Create Supabase Project**
   ```bash
   # Visit https://supabase.com and create a new project
   # Note your project URL and anon key
   ```

2. **Run Schema Scripts**
   
   Execute the following SQL scripts in order in your Supabase SQL editor:

   ```sql
   -- 1. Core tables and policies
   \i supabase/create_core_tables_and_policies.sql
   
   -- 2. Messaging system
   \i supabase/create_messaging_tables_and_rls.sql
   
   -- 3. Storage buckets
   \i supabase/create_storage_buckets_and_policies.sql
   
   -- 4. Seed data
   \i supabase/seed_departments_courses_schedules.sql
   ```

3. **Configure Storage Buckets**
   
   Create the following storage buckets in Supabase:
   - `avatars` - User profile pictures
   - `posts` - Post image attachments
   - `messages` - Message attachments

4. **Set Up Authentication**
   
   Configure authentication providers in Supabase dashboard:
   - Email/Password (required)
   - Google OAuth (optional)

---

## 🌱 Seeding Data

### Sample Departments

```sql
-- Insert sample departments
INSERT INTO departments (code, name) VALUES
  ('CSE', 'Computer Science & Engineering'),
  ('EEE', 'Electrical & Electronic Engineering'),
  ('BBA', 'Bachelor of Business Administration'),
  ('ENG', 'English'),
  ('LAW', 'Law');
```

### Sample Courses

```sql
-- Insert sample courses
INSERT INTO courses (code, title, department_id, credits) VALUES
  ('CSE101', 'Introduction to Programming', (SELECT id FROM departments WHERE code = 'CSE'), 3),
  ('CSE201', 'Data Structures', (SELECT id FROM departments WHERE code = 'CSE'), 3),
  ('EEE101', 'Circuit Analysis', (SELECT id FROM departments WHERE code = 'EEE'), 3),
  ('BBA101', 'Principles of Management', (SELECT id FROM departments WHERE code = 'BBA'), 3),
  ('ENG101', 'English Composition', (SELECT id FROM departments WHERE code = 'ENG'), 3);
```

### Sample Schedules

```sql
-- Insert sample schedules
INSERT INTO schedules (course_id, semester, section, day_of_week, start_time, end_time, room, academic_year) VALUES
  ((SELECT id FROM courses WHERE code = 'CSE101'), 1, 'A', 1, '09:00', '10:30', 'Room 101', '2024-2025'),
  ((SELECT id FROM courses WHERE code = 'CSE201'), 3, 'A', 2, '11:00', '12:30', 'Room 102', '2024-2025'),
  ((SELECT id FROM courses WHERE code = 'EEE101'), 1, 'B', 3, '14:00', '15:30', 'Lab 201', '2024-2025');
```

---

## 📝 Migration Scripts

### Database Functions

#### Update Timestamps Function

```sql
-- Function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

#### Apply Timestamp Triggers

```sql
-- Apply to all tables with updated_at columns
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at 
  BEFORE UPDATE ON posts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friend_requests_updated_at 
  BEFORE UPDATE ON friend_requests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Indexes for Performance

```sql
-- Indexes for common queries
CREATE INDEX idx_posts_author_created ON posts(author_id, created_at DESC);
CREATE INDEX idx_friendships_user_id ON friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_profiles_department ON profiles(department_id);
CREATE INDEX idx_schedules_course_semester ON schedules(course_id, semester, section);
```

---

## 🔧 Maintenance

### Regular Maintenance Tasks

1. **Monitor Storage Usage**
   - Check storage bucket sizes regularly
   - Clean up orphaned files
   - Implement file retention policies

2. **Performance Optimization**
   - Monitor query performance
   - Update table statistics
   - Review and optimize indexes

3. **Security Audits**
   - Review RLS policies regularly
   - Monitor access patterns
   - Update security configurations

### Backup Strategy

- **Automated Backups**: Supabase provides automatic daily backups
- **Manual Backups**: Use `pg_dump` for additional backup points
- **Point-in-Time Recovery**: Available through Supabase dashboard

---

---

## 🔗 See Also

**API Integration:**
- **[Authentication Endpoints](API.md#authentication)** - User signup, login, and profile creation APIs
- **[Profile Management API](API.md#profile-management)** - CRUD operations for the `profiles` table
- **[Social Features API](API.md#social-features)** - Posts, likes, and comments API endpoints
- **[Friend System API](API.md#friend-system)** - Friend requests and relationships management
- **[Messaging API](API.md#messaging-system)** - Real-time chat and conversation endpoints
- **[Academic API](API.md#academic-features)** - Department, course, and schedule management

**Development Resources:**
- **[Project Setup](README.md#installation--setup)** - Environment configuration and Supabase setup
- **[Technical Architecture](README.md#technical-architecture)** - Frontend and backend stack overview
- **[API Error Handling](API.md#error-handling)** - Database error codes and troubleshooting

**Database-Specific References:**
- **[RLS Policies](#security-policies)** - Row Level Security implementation details
- **[Migration Scripts](#migration-scripts)** - Database setup and maintenance procedures
- **[Seeding Data](#seeding-data)** - Sample data for development and testing

---

## 📖 Documentation Navigation

**Quick Links:**
- **[📱 Main Documentation](README.md)** - Project overview and setup guide
- **[🚀 API Reference](API.md)** - REST API endpoints and examples
- **[🗄️ Database Schema](#)** - Complete database documentation (current page)

**Key Sections:**
- [Core Tables](#core-tables) - User profiles, posts, and social features
- [Academic Tables](#academic-tables) - University-specific data structures
- [Security Policies](#security-policies) - Row Level Security implementation
- [Database Setup](#database-setup) - Installation and configuration guide

---

<div align="center">
  <p>📚 <strong>Related Documentation</strong></p>
  <p>
    <a href="README.md">← Back to Main Documentation</a> | 
    <a href="API.md">API Documentation →</a>
  </p>
</div>