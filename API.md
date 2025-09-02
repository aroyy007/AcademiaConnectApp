# Academia Connect API Documentation

<div align="center">
  <h2>🚀 Comprehensive REST API Reference</h2>
  <p>Complete documentation for Academia Connect's backend API endpoints</p>
</div>

---

## 📚 Quick Navigation

**📖 Documentation Hub**
- 📱 **[Main Documentation](README.md)** - Project overview, setup, and development guide
- 🗄️ **[Database Schema](DATABASE.md)** - Complete database structure and relationships
- 🚀 **[API Reference](#)** - You are here! REST API endpoints and examples

---

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
  - [Authentication Flow](#authentication-flow)
  - [Sign Up](#sign-up)
  - [Sign In](#sign-in)
  - [Sign Out](#sign-out)
  - [Password Reset](#password-reset)
- [Profile Management](#profile-management)
  - [Get Profile](#get-profile)
  - [Update Profile](#update-profile)
  - [Upload Avatar](#upload-avatar)
  - [Search Users](#search-users)
- [Social Features](#social-features)
  - [Posts](#posts)
  - [Likes](#likes)
  - [Comments](#comments)
- [Friend System](#friend-system)
  - [Friend Requests](#friend-requests)
  - [Friendships](#friendships)
- [Messaging System](#messaging-system)
  - [Conversations](#conversations)
  - [Messages](#messages)
- [Academic Features](#academic-features)
  - [Departments](#departments)
  - [Courses](#courses)
  - [Schedules](#schedules)
- [Notifications](#notifications)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Security Considerations](#security-considerations)

---

## 🎯 Overview

The Academia Connect API is a RESTful service built on Supabase that provides comprehensive functionality for a university social networking platform. All endpoints require authentication unless otherwise specified.

### Base URL
```
https://your-project.supabase.co/rest/v1
```

### Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer {jwt_token}
```

### Content Types
- **Request**: `application/json` or `multipart/form-data` (for file uploads)
- **Response**: `application/json`

---

## 🔐 Authentication

### Authentication Flow

The authentication system uses JWT tokens provided by Supabase Auth. The flow includes:

1. **Registration**: User signs up with EDU email
2. **Email Verification**: Confirmation email sent to user
3. **Login**: User receives JWT token and refresh token
4. **Token Refresh**: Automatic token renewal
5. **Logout**: Token invalidation

### Sign Up

Create a new user account with EDU email validation.

**Endpoint:** `POST /auth/v1/signup`

**Request Body:**
```json
{
  "email": "student@eastdelta.edu.bd",
  "password": "securePassword123",
  "data": {
    "full_name": "John Doe",
    "semester": 5,
    "section": "A",
    "department_code": "CSE",
    "student_id": "CSE-2019-001"
  }
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@eastdelta.edu.bd",
    "email_confirmed_at": null,
    "created_at": "2024-01-01T00:00:00.000Z",
    "user_metadata": {
      "full_name": "John Doe"
    }
  },
  "session": null
}
```

**Error Responses:**
```json
// Invalid email domain
{
  "error": "signup_disabled",
  "error_description": "Only @eastdelta.edu.bd emails are allowed"
}

// Weak password
{
  "error": "weak_password", 
  "error_description": "Password should be at least 8 characters"
}

// Email already exists
{
  "error": "email_address_already_in_use",
  "error_description": "A user with this email address has already been registered"
}
```

### Sign In

Authenticate user and receive access tokens.

**Endpoint:** `POST /auth/v1/token?grant_type=password`

**Request Body:**
```json
{
  "email": "student@eastdelta.edu.bd",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "v1.MjAyNC0wMS0wMVQwMDowMDowMC4wMDBa...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@eastdelta.edu.bd",
    "email_confirmed_at": "2024-01-01T00:00:00.000Z",
    "last_sign_in_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
```json
// Invalid credentials
{
  "error": "invalid_grant",
  "error_description": "Invalid login credentials"
}

// Email not confirmed
{
  "error": "email_not_confirmed",
  "error_description": "Email not confirmed"
}
```

### Sign Out

Invalidate the current session.

**Endpoint:** `POST /auth/v1/logout`
**Headers:** `Authorization: Bearer {jwt_token}`

**Response (204 No Content)**

### Password Reset

Initiate password reset flow.

**Endpoint:** `POST /auth/v1/recover`

**Request Body:**
```json
{
  "email": "student@eastdelta.edu.bd"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset email sent"
}
```

---

## 👤 Profile Management

### Get Profile

Retrieve user profile information.

**Endpoint:** `GET /profiles?id=eq.{userId}`
**Headers:** `Authorization: Bearer {jwt_token}`

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "student@eastdelta.edu.bd",
  "full_name": "John Doe",
  "student_id": "CSE-2019-001",
  "department": {
    "id": "dept-uuid",
    "code": "CSE",
    "name": "Computer Science & Engineering"
  },
  "semester": 5,
  "section": "A",
  "avatar_url": "https://storage.supabase.co/object/public/avatars/user-avatar.jpg",
  "bio": "Computer Science student passionate about AI and machine learning",
  "is_faculty": false,
  "is_active": true,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

**Database Reference:** See [profiles table schema](DATABASE.md#profiles---user-information) for complete field descriptions and constraints.
```

### Update Profile

Update user profile information.

**Endpoint:** `PATCH /profiles?id=eq.{userId}`
**Headers:** 
- `Authorization: Bearer {jwt_token}`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "full_name": "John Doe Updated",
  "bio": "Updated bio text",
  "semester": 6,
  "section": "B"
}
```

**Response (200 OK):**
```json
{
  "message": "Profile updated successfully"
}
```

### Upload Avatar

Upload and set user avatar image.

**Endpoint:** `POST /storage/v1/object/avatars/{userId}`
**Headers:** 
- `Authorization: Bearer {jwt_token}`
- `Content-Type: multipart/form-data`

**Request Body:**
```
file: [image file]
```

**Response (200 OK):**
```json
{
  "Key": "avatars/550e8400-e29b-41d4-a716-446655440000.jpg",
  "url": "https://storage.supabase.co/object/public/avatars/user-avatar.jpg"
}
```

### Search Users

Search for users by name or email.

**Endpoint:** `GET /profiles?or=(full_name.ilike.*{query}*,email.ilike.*{query}*)&limit=20`
**Headers:** `Authorization: Bearer {jwt_token}`

**Query Parameters:**
- `query`: Search term
- `department`: Filter by department code (optional)
- `semester`: Filter by semester (optional)

**Response (200 OK):**
```json
[
  {
    "id": "user-uuid",
    "full_name": "Jane Smith",
    "email": "jane@eastdelta.edu.bd",
    "avatar_url": "https://...",
    "department": {
      "code": "CSE",
      "name": "Computer Science & Engineering"
    },
    "semester": 4,
    "section": "A",
    "friendship_status": "friends"
  }
]
```

---

## 📱 Social Features

### Posts

#### Get Feed Posts

Retrieve posts for the user's feed (friends' posts and announcements).

**Endpoint:** `GET /posts?order=created_at.desc&limit=20&offset=0`
**Headers:** `Authorization: Bearer {jwt_token}`

**Query Parameters:**
- `limit`: Number of posts to retrieve (default: 20, max: 50)
- `offset`: Pagination offset (default: 0)
- `author_id`: Filter by specific author (optional)

**Response (200 OK):**
```json
[
  {
    "id": "post-uuid",
    "content": "Just finished my Data Structures assignment! 🎉",
    "image_url": "https://storage.supabase.co/object/public/posts/image.jpg",
    "is_announcement": false,
    "likes_count": 15,
    "comments_count": 3,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "author": {
      "id": "author-uuid",
      "full_name": "John Doe",
      "avatar_url": "https://...",
      "department": {
        "code": "CSE"
      }
    },
    "user_has_liked": true
  }
]
```

**Database Reference:** See [posts table schema](DATABASE.md#posts---social-content) for complete field descriptions and [RLS policies](DATABASE.md#posts-access-policy) for access control.
```

#### Create Post

Create a new post with optional image attachment.

**Endpoint:** `POST /posts`
**Headers:** 
- `Authorization: Bearer {jwt_token}`
- `Content-Type: multipart/form-data`

**Request Body:**
```
content: "Post content text"
image: [image file] (optional)
is_announcement: false (optional, faculty only)
```

**Response (201 Created):**
```json
{
  "id": "new-post-uuid",
  "content": "Post content text",
  "image_url": "https://storage.supabase.co/object/public/posts/image.jpg",
  "author_id": "user-uuid",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

#### Update Post

Update an existing post (author only).

**Endpoint:** `PATCH /posts?id=eq.{postId}`
**Headers:** 
- `Authorization: Bearer {jwt_token}`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "content": "Updated post content"
}
```

#### Delete Post

Delete a post (author only).

**Endpoint:** `DELETE /posts?id=eq.{postId}`
**Headers:** `Authorization: Bearer {jwt_token}`

**Response (204 No Content)**

### Likes

#### Like Post

Add a like to a post.

**Endpoint:** `POST /post_likes`
**Headers:** 
- `Authorization: Bearer {jwt_token}`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "post_id": "post-uuid"
}
```

**Response (201 Created):**
```json
{
  "id": "like-uuid",
  "post_id": "post-uuid",
  "user_id": "user-uuid",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

#### Unlike Post

Remove a like from a post.

**Endpoint:** `DELETE /post_likes?post_id=eq.{postId}&user_id=eq.{userId}`
**Headers:** `Authorization: Bearer {jwt_token}`

**Response (204 No Content)**

### Comments

#### Get Post Comments

Retrieve comments for a specific post.

**Endpoint:** `GET /comments?post_id=eq.{postId}&order=created_at.asc`
**Headers:** `Authorization: Bearer {jwt_token}`

**Response (200 OK):**
```json
[
  {
    "id": "comment-uuid",
    "content": "Great post! Thanks for sharing.",
    "post_id": "post-uuid",
    "created_at": "2024-01-01T00:00:00.000Z",
    "author": {
      "id": "author-uuid",
      "full_name": "Jane Smith",
      "avatar_url": "https://..."
    }
  }
]
```

#### Create Comment

Add a comment to a post.

**Endpoint:** `POST /comments`
**Headers:** 
- `Authorization: Bearer {jwt_token}`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "post_id": "post-uuid",
  "content": "This is a comment on the post"
}
```

**Response (201 Created):**
```json
{
  "id": "new-comment-uuid",
  "content": "This is a comment on the post",
  "post_id": "post-uuid",
  "author_id": "user-uuid",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 🤝 Friend System

### Friend Requests

#### Send Friend Request

Send a friend request to another user.

**Endpoint:** `POST /friend_requests`
**Headers:** 
- `Authorization: Bearer {jwt_token}`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "receiver_id": "target-user-uuid"
}
```

**Response (201 Created):**
```json
{
  "id": "request-uuid",
  "sender_id": "user-uuid",
  "receiver_id": "target-user-uuid",
  "status": "pending",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

#### Get Friend Requests

Retrieve friend requests (sent or received).

**Endpoint:** `GET /friend_requests?receiver_id=eq.{userId}&status=eq.pending`
**Headers:** `Authorization: Bearer {jwt_token}`

**Query Parameters:**
- `type`: `sent` or `received` (determines filter)
- `status`: `pending`, `accepted`, `rejected`

**Response (200 OK):**
```json
[
  {
    "id": "request-uuid",
    "status": "pending",
    "created_at": "2024-01-01T00:00:00.000Z",
    "sender": {
      "id": "sender-uuid",
      "full_name": "John Doe",
      "avatar_url": "https://...",
      "department": {
        "code": "CSE"
      }
    }
  }
]
```

#### Respond to Friend Request

Accept or reject a friend request.

**Endpoint:** `PATCH /friend_requests?id=eq.{requestId}`
**Headers:** 
- `Authorization: Bearer {jwt_token}`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "status": "accepted"
}
```

**Response (200 OK):**
```json
{
  "message": "Friend request accepted",
  "friendship_created": true
}
```

### Friendships

#### Get Friends List

Retrieve user's friends.

**Endpoint:** `GET /friendships?user_id=eq.{userId}`
**Headers:** `Authorization: Bearer {jwt_token}`

**Response (200 OK):**
```json
[
  {
    "id": "friendship-uuid",
    "created_at": "2024-01-01T00:00:00.000Z",
    "friend": {
      "id": "friend-uuid",
      "full_name": "Jane Smith",
      "avatar_url": "https://...",
      "department": {
        "code": "EEE",
        "name": "Electrical & Electronic Engineering"
      },
      "semester": 6
    }
  }
]
```

**Database Reference:** See [friendships table schema](DATABASE.md#friendships---user-relationships) and [friend_requests table](DATABASE.md#friend_requests---friendship-management) for the complete friendship system design.
```

#### Remove Friend

Remove a friendship connection.

**Endpoint:** `DELETE /friendships?user_id=eq.{userId}&friend_id=eq.{friendId}`
**Headers:** `Authorization: Bearer {jwt_token}`

**Response (204 No Content)**

---

## 💬 Messaging System

### Conversations

#### Get Conversations

Retrieve user's conversations.

**Endpoint:** `GET /conversations?order=updated_at.desc`
**Headers:** `Authorization: Bearer {jwt_token}`

**Response (200 OK):**
```json
[
  {
    "id": "conversation-uuid",
    "name": "John & Jane",
    "is_group": false,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z",
    "participants": [
      {
        "id": "user1-uuid",
        "full_name": "John Doe",
        "avatar_url": "https://..."
      },
      {
        "id": "user2-uuid", 
        "full_name": "Jane Smith",
        "avatar_url": "https://..."
      }
    ],
    "last_message": {
      "id": "message-uuid",
      "content": "Hey, how's your project going?",
      "sender_id": "user2-uuid",
      "created_at": "2024-01-01T12:00:00.000Z"
    },
    "unread_count": 2
  }
]
```

**Database Reference:** See [conversations table](DATABASE.md#conversations---chat-threads) and [conversation_participants table](DATABASE.md#conversation_participants---chat-membership) for the complete messaging system schema.
```

#### Create Conversation

Start a new conversation.

**Endpoint:** `POST /conversations`
**Headers:** 
- `Authorization: Bearer {jwt_token}`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "participant_ids": ["user1-uuid", "user2-uuid"],
  "is_group": false,
  "name": "Study Group"
}
```

### Messages

#### Get Messages

Retrieve messages from a conversation.

**Endpoint:** `GET /messages?conversation_id=eq.{conversationId}&order=created_at.desc&limit=50`
**Headers:** `Authorization: Bearer {jwt_token}`

**Response (200 OK):**
```json
[
  {
    "id": "message-uuid",
    "content": "Hey, how's your Data Structures assignment going?",
    "conversation_id": "conversation-uuid",
    "sender_id": "sender-uuid",
    "attachment_url": null,
    "attachment_type": null,
    "reply_to_id": null,
    "created_at": "2024-01-01T12:00:00.000Z",
    "sender": {
      "id": "sender-uuid",
      "full_name": "Jane Smith",
      "avatar_url": "https://..."
    },
    "read_by": [
      {
        "user_id": "user-uuid",
        "read_at": "2024-01-01T12:01:00.000Z"
      }
    ]
  }
]
```

#### Send Message

Send a message in a conversation.

**Endpoint:** `POST /messages`
**Headers:** 
- `Authorization: Bearer {jwt_token}`
- `Content-Type: multipart/form-data`

**Request Body:**
```
conversation_id: "conversation-uuid"
content: "Message text content"
attachment: [file] (optional)
reply_to_id: "message-uuid" (optional)
```

**Response (201 Created):**
```json
{
  "id": "new-message-uuid",
  "content": "Message text content",
  "conversation_id": "conversation-uuid",
  "sender_id": "user-uuid",
  "attachment_url": "https://storage.supabase.co/object/public/messages/file.jpg",
  "created_at": "2024-01-01T12:00:00.000Z"
}
```

---

## 🎓 Academic Features

### Departments

#### Get Departments

Retrieve all academic departments.

**Endpoint:** `GET /departments?order=name.asc`

**Response (200 OK):**
```json
[
  {
    "id": "dept-uuid",
    "code": "CSE",
    "name": "Computer Science & Engineering",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "dept-uuid-2",
    "code": "EEE", 
    "name": "Electrical & Electronic Engineering",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

**Database Reference:** See [departments table schema](DATABASE.md#departments---academic-departments) for complete field descriptions and sample data.
```

### Courses

#### Get Courses

Retrieve courses, optionally filtered by department.

**Endpoint:** `GET /courses?department_id=eq.{departmentId}&order=code.asc`
**Headers:** `Authorization: Bearer {jwt_token}`

**Response (200 OK):**
```json
[
  {
    "id": "course-uuid",
    "code": "CSE101",
    "title": "Introduction to Programming",
    "department_id": "dept-uuid",
    "credits": 3,
    "created_at": "2024-01-01T00:00:00.000Z",
    "department": {
      "code": "CSE",
      "name": "Computer Science & Engineering"
    }
  }
]
```

### Schedules

#### Get User Schedule

Retrieve schedule for a specific user and semester.

**Endpoint:** `GET /schedules?instructor_id=eq.{userId}&semester=eq.{semester}`
**Headers:** `Authorization: Bearer {jwt_token}`

**Response (200 OK):**
```json
[
  {
    "id": "schedule-uuid",
    "semester": 5,
    "section": "A",
    "day_of_week": 1,
    "start_time": "09:00:00",
    "end_time": "10:30:00",
    "room": "Room 301",
    "academic_year": "2024-25",
    "course": {
      "code": "CSE201",
      "title": "Data Structures",
      "credits": 3
    },
    "instructor": {
      "full_name": "Dr. John Smith",
      "email": "john.smith@eastdelta.edu.bd"
    }
  }
]
```

---

## 🔔 Notifications

### Get Notifications

Retrieve user notifications.

**Endpoint:** `GET /notifications?user_id=eq.{userId}&order=created_at.desc&limit=20`
**Headers:** `Authorization: Bearer {jwt_token}`

**Response (200 OK):**
```json
[
  {
    "id": "notification-uuid",
    "type": "friend_request",
    "title": "New Friend Request",
    "message": "John Doe sent you a friend request",
    "data": {
      "friend_request_id": "request-uuid",
      "sender_id": "sender-uuid"
    },
    "is_read": false,
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "notification-uuid-2",
    "type": "post_like",
    "title": "Post Liked",
    "message": "Jane Smith liked your post",
    "data": {
      "post_id": "post-uuid",
      "liker_id": "liker-uuid"
    },
    "is_read": true,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### Mark Notification as Read

Mark a notification as read.

**Endpoint:** `PATCH /notifications?id=eq.{notificationId}`
**Headers:** 
- `Authorization: Bearer {jwt_token}`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "is_read": true
}
```

---

## ⚠️ Error Handling

### HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **204 No Content**: Request successful, no content returned
- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Authentication required or invalid
- **403 Forbidden**: Access denied
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource conflict (e.g., duplicate email)
- **422 Unprocessable Entity**: Validation errors
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

### Error Response Format

```json
{
  "error": "error_code",
  "error_description": "Human readable error message",
  "details": {
    "field": "Specific field error message"
  }
}
```

### Common Error Codes

#### Authentication Errors
- `invalid_grant`: Invalid login credentials
- `email_not_confirmed`: Email verification required
- `signup_disabled`: Registration not allowed for email domain
- `weak_password`: Password doesn't meet requirements

#### Validation Errors
- `invalid_input`: Request validation failed
- `missing_required_field`: Required field not provided
- `invalid_format`: Field format is incorrect

#### Authorization Errors
- `insufficient_permissions`: User lacks required permissions
- `resource_not_found`: Requested resource doesn't exist
- `access_denied`: User cannot access this resource

#### Rate Limiting Errors
- `rate_limit_exceeded`: Too many requests in time window

---

## 🚦 Rate Limiting

### Rate Limits

- **Authentication**: 5 requests per minute per IP
- **API Calls**: 100 requests per minute per user
- **File Uploads**: 10 uploads per minute per user
- **Message Sending**: 30 messages per minute per user

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Rate Limit Exceeded Response

```json
{
  "error": "rate_limit_exceeded",
  "error_description": "Too many requests. Please try again later.",
  "retry_after": 60
}
```

---

## 🔒 Security Considerations

### Authentication Security

- **JWT Tokens**: Short-lived access tokens (1 hour)
- **Refresh Tokens**: Long-lived tokens for token renewal
- **Token Rotation**: Automatic token refresh on API calls
- **Secure Storage**: Tokens stored securely on client

### Data Protection

- **Row Level Security**: Database-level access control
- **Input Validation**: All inputs validated and sanitized
- **SQL Injection Prevention**: Parameterized queries only
- **XSS Protection**: Output encoding and CSP headers

### Privacy Controls

- **Friend-Only Content**: Posts visible only to friends
- **Profile Privacy**: Granular privacy settings
- **Data Minimization**: Only necessary data collected
- **Right to Deletion**: Complete data removal on request

### API Security

- **HTTPS Only**: All API calls encrypted in transit
- **CORS Configuration**: Restricted cross-origin requests
- **Request Signing**: Optional request signature validation
- **IP Whitelisting**: Optional IP-based access control

---

---

## 🔗 See Also

**Database Integration:**
- **[User Profiles Table](DATABASE.md#profiles---user-information)** - Database schema for profile management endpoints
- **[Posts Table](DATABASE.md#posts---social-content)** - Social content database structure
- **[Friendships Table](DATABASE.md#friendships---user-relationships)** - Friend system database design
- **[Messages Tables](DATABASE.md#messages---chat-system)** - Real-time messaging database schema
- **[Academic Tables](DATABASE.md#academic-tables)** - University-specific database structures
- **[Security Policies](DATABASE.md#security-policies)** - Row Level Security implementation for API endpoints

**Development Resources:**
- **[Project Setup](README.md#installation--setup)** - Environment configuration and API setup
- **[Technical Architecture](README.md#technical-architecture)** - Backend stack and Supabase integration
- **[Database Setup](DATABASE.md#database-setup)** - Required database configuration for API functionality

**API-Specific References:**
- **[Authentication Flow](#authentication-flow)** - Complete JWT token management
- **[Error Handling](#error-handling)** - Comprehensive error codes and responses
- **[Rate Limiting](#rate-limiting)** - API usage limits and best practices
- **[Security Considerations](#security-considerations)** - API security implementation

**Feature Documentation:**
- **[Social Features](README.md#social-features)** - Frontend implementation of social API endpoints
- **[Friend System](README.md#friend-system)** - User interface for friendship management
- **[Messaging System](README.md#messaging-system-in-development)** - Real-time chat implementation
- **[Academic Features](README.md#schedule-management-in-development)** - University-specific functionality

---

## 📖 Documentation Navigation

**Quick Links:**
- **[📱 Main Documentation](README.md)** - Project overview and setup guide
- **[🗄️ Database Schema](DATABASE.md)** - Complete database documentation
- **[🚀 API Reference](#)** - REST API endpoints and examples (current page)

**Key Sections:**
- [Authentication](#authentication) - User signup, login, and security
- [Social Features](#social-features) - Posts, likes, comments, and feeds
- [Friend System](#friend-system) - Friend requests and relationships
- [Messaging System](#messaging-system) - Real-time chat and conversations
- [Error Handling](#error-handling) - Comprehensive error codes and responses

---

<div align="center">
  <p><strong>📚 Need Help?</strong></p>
  <p>Check our <a href="README.md">main documentation</a> or <a href="DATABASE.md">database schema</a></p>
  <p>© 2025 Academia Connect. All rights reserved.</p>
</div>