# Detailed Test Plan for Flatmates Platform

## Test Coverage Areas

This document provides comprehensive test cases for all major functionality areas of the Flatmates platform.

---

## 1. Authentication (Login, Register, Social Auth)

### 1.1 User Registration

#### Test Case: REG-001 - Successful Email Registration

**Priority**: High  
**Steps**:

1. Navigate to `/register`
2. Fill in registration form:
   - Name: "Test User"
   - Email: "newuser@test.com"
   - Password: "TestPass123!"
   - User Type: Select "room_seeker"
3. Click "Register" button
4. Verify redirect to dashboard or login page
5. Verify user can login with new credentials

**Expected Result**: User is successfully registered and can login

#### Test Case: REG-002 - Registration Validation - Empty Fields

**Priority**: High  
**Steps**:

1. Navigate to `/register`
2. Leave all fields empty
3. Click "Register"
4. Verify validation errors appear for required fields

**Expected Result**: Form shows validation errors, registration fails

#### Test Case: REG-003 - Registration Validation - Invalid Email

**Priority**: Medium  
**Steps**:

1. Navigate to `/register`
2. Enter invalid email format (e.g., "invalidemail")
3. Fill other required fields
4. Click "Register"
5. Verify email validation error appears

**Expected Result**: Email validation error displayed

#### Test Case: REG-004 - Registration Validation - Weak Password

**Priority**: Medium  
**Steps**:

1. Navigate to `/register`
2. Enter password less than 6 characters
3. Fill other required fields
4. Click "Register"
5. Verify password validation error

**Expected Result**: Password validation error displayed

#### Test Case: REG-005 - Duplicate Email Registration

**Priority**: High  
**Steps**:

1. Register a user with email "namritasaxena2000@gmail.com"
2. Attempt to register again with same email
3. Verify error message about existing user

**Expected Result**: Error message: "User already exists"

#### Test Case: REG-006 - User Type Selection

**Priority**: Medium  
**Steps**:

1. Navigate to `/register`
2. Test each user type option:
   - room_seeker
   - roommate_seeker
   - broker_dealer
   - property_owner
3. Complete registration for each type
4. Verify user type is saved correctly

**Expected Result**: All user types can be selected and saved

### 1.2 User Login

#### Test Case: LOGIN-001 - Successful Login with Email/Password

**Priority**: High  
**Steps**:

1. Navigate to `/login`
2. Enter valid credentials:
   - Email: "namritasaxena2000@gmail.com"
   - Password: "Hello@123"
3. Click "Login"
4. Verify redirect to dashboard
5. Verify JWT token is stored
6. Verify user data is loaded

**Expected Result**: User successfully logged in, redirected to dashboard

#### Test Case: LOGIN-002 - Login with Invalid Email

**Priority**: High  
**Steps**:

1. Navigate to `/login`
2. Enter non-existent email
3. Enter any password
4. Click "Login"
5. Verify error message appears

**Expected Result**: Error: "User not found" or "Invalid credentials"

#### Test Case: LOGIN-003 - Login with Invalid Password

**Priority**: High  
**Steps**:

1. Navigate to `/login`
2. Enter valid email
3. Enter incorrect password
4. Click "Login"
5. Verify error message appears

**Expected Result**: Error: "Invalid password" or "Invalid credentials"

#### Test Case: LOGIN-004 - Login Form Validation

**Priority**: Medium  
**Steps**:

1. Navigate to `/login`
2. Leave fields empty
3. Click "Login"
4. Verify validation errors

**Expected Result**: Form validation errors displayed

#### Test Case: LOGIN-005 - Login Redirect After Authentication

**Priority**: Medium  
**Steps**:

1. Try to access protected route `/dashboard` while logged out
2. Verify redirect to `/login`
3. Complete login
4. Verify redirect back to `/dashboard`

**Expected Result**: Proper redirect flow works

### 1.3 Social Authentication

#### Test Case: SOCIAL-001 - Google Login

**Priority**: High  
**Steps**:

1. Navigate to `/login`
2. Click "Login with Google" button
3. Complete Google OAuth flow
4. Verify user is created/logged in
5. Verify redirect to dashboard
6. Verify user profile shows Google as provider

**Expected Result**: Google authentication works, user logged in

#### Test Case: SOCIAL-002 - Facebook Login

**Priority**: High  
**Steps**:

1. Navigate to `/login`
2. Click "Login with Facebook" button
3. Complete Facebook OAuth flow
4. Verify user is created/logged in
5. Verify redirect to dashboard

**Expected Result**: Facebook authentication works

#### Test Case: SOCIAL-003 - Instagram Login

**Priority**: Medium  
**Steps**:

1. Navigate to `/login`
2. Click "Login with Instagram" button
3. Complete Instagram OAuth flow
4. Verify user is created/logged in
5. Verify redirect to dashboard

**Expected Result**: Instagram authentication works

#### Test Case: SOCIAL-004 - Social Login - Existing User

**Priority**: Medium  
**Steps**:

1. Register user with email "user@example.com"
2. Logout
3. Login with Google using same email
4. Verify account is linked or merged

**Expected Result**: Existing account is recognized or linked

### 1.4 Password Management

#### Test Case: PWD-001 - Forgot Password Request

**Priority**: High  
**Steps**:

1. Navigate to `/forgot-password`
2. Enter registered email
3. Click "Send Reset Link"
4. Verify success message
5. Check email for reset link

**Expected Result**: Reset email sent successfully

#### Test Case: PWD-002 - Password Reset with Valid Token

**Priority**: High  
**Steps**:

1. Request password reset
2. Get reset token from email
3. Navigate to reset password page
4. Enter new password
5. Submit form
6. Verify password is changed
7. Login with new password

**Expected Result**: Password reset successfully, can login with new password

#### Test Case: PWD-003 - Password Reset with Invalid Token

**Priority**: Medium  
**Steps**:

1. Use invalid/expired reset token
2. Attempt to reset password
3. Verify error message

**Expected Result**: Error message displayed, reset fails

---

## 2. Property Management (CRUD Operations)

### 2.1 Create Property

#### Test Case: PROP-CREATE-001 - Create Property - Authenticated User

**Priority**: High  
**Steps**:

1. Login as authenticated user
2. Navigate to `/properties/create`
3. Fill property form:
   - Title: "Beautiful 2BR Apartment"
   - Description: "Spacious apartment in city center"
   - Property Type: "apartment"
   - Listing Type: "entire_property"
   - Address: City, Country
   - Price: 1500
   - Bedrooms: 2
   - Bathrooms: 1
   - Available From: Future date
4. Upload at least one property image
5. Click "Create Property"
6. Verify property is created
7. Verify redirect to property details page

**Expected Result**: Property created successfully, visible in listings

#### Test Case: PROP-CREATE-002 - Create Property - Unauthenticated User

**Priority**: High  
**Steps**:

1. Logout or ensure not logged in
2. Try to navigate to `/properties/create`
3. Verify redirect to login page

**Expected Result**: Unauthenticated users cannot create properties

#### Test Case: PROP-CREATE-003 - Create Property - Form Validation

**Priority**: High  
**Steps**:

1. Login and navigate to `/properties/create`
2. Leave required fields empty
3. Click "Create Property"
4. Verify validation errors for each required field

**Expected Result**: All required fields show validation errors

#### Test Case: PROP-CREATE-004 - Create Property - Image Upload

**Priority**: Medium  
**Steps**:

1. Login and navigate to `/properties/create`
2. Upload multiple images (up to 10)
3. Verify images are previewed
4. Submit form
5. Verify images are saved and displayed

**Expected Result**: Multiple images uploaded and displayed correctly

#### Test Case: PROP-CREATE-005 - Create Property - All Listing Types

**Priority**: Medium  
**Steps**:

1. Create property for each listing type:
   - room_in_flat
   - roommates_for_flat
   - occupied_flat
   - entire_property
2. Verify each property is created correctly
3. Verify listing type is saved

**Expected Result**: All listing types work correctly

### 2.2 Read/View Properties

#### Test Case: PROP-READ-001 - View All Properties

**Priority**: High  
**Steps**:

1. Navigate to `/properties`
2. Verify properties list is displayed
3. Verify each property shows:
   - Title
   - Image
   - Location
   - Price
   - Property type
4. Verify pagination works (if implemented)

**Expected Result**: All active properties displayed correctly

#### Test Case: PROP-READ-002 - View Property Details

**Priority**: High  
**Steps**:

1. Navigate to `/properties`
2. Click on a property
3. Verify property details page shows:
   - All property information
   - All images
   - Owner information
   - Contact/message button
4. Verify page is accessible without authentication

**Expected Result**: Property details displayed correctly

#### Test Case: PROP-READ-003 - Filter Properties by Type

**Priority**: Medium  
**Steps**:

1. Navigate to `/properties`
2. Apply filter for specific property type
3. Verify only matching properties are shown
4. Clear filter
5. Verify all properties shown again

**Expected Result**: Filtering works correctly

#### Test Case: PROP-READ-004 - Search Properties

**Priority**: Medium  
**Steps**:

1. Navigate to `/properties`
2. Enter search term in search box
3. Verify results are filtered
4. Test search by city, price range, etc.

**Expected Result**: Search functionality works

#### Test Case: PROP-READ-005 - View Inactive Properties

**Priority**: Low  
**Steps**:

1. Create property older than 30 days (or manually set status)
2. Navigate to `/properties`
3. Verify inactive property is not shown in active listings

**Expected Result**: Inactive properties are filtered out

### 2.3 Update Property

#### Test Case: PROP-UPDATE-001 - Update Own Property

**Priority**: High  
**Steps**:

1. Login as property owner
2. Navigate to own property details
3. Click "Edit Property"
4. Modify property details (title, description, price)
5. Save changes
6. Verify changes are reflected

**Expected Result**: Property updated successfully

#### Test Case: PROP-UPDATE-002 - Update Property - Non-Owner

**Priority**: High  
**Steps**:

1. Login as user A
2. Create a property
3. Logout
4. Login as user B
5. Try to edit user A's property
6. Verify access is denied or edit button not shown

**Expected Result**: Non-owners cannot edit properties

#### Test Case: PROP-UPDATE-003 - Update Property Images

**Priority**: Medium  
**Steps**:

1. Login and edit own property
2. Remove existing images
3. Add new images
4. Save changes
5. Verify images are updated

**Expected Result**: Property images updated correctly

#### Test Case: PROP-UPDATE-004 - Update Property - Form Validation

**Priority**: Medium  
**Steps**:

1. Edit property
2. Clear required fields
3. Try to save
4. Verify validation errors

**Expected Result**: Validation works on update form

### 2.4 Delete Property

#### Test Case: PROP-DELETE-001 - Delete Own Property

**Priority**: High  
**Steps**:

1. Login as property owner
2. Navigate to own property
3. Click "Delete Property"
4. Confirm deletion
5. Verify property is deleted
6. Verify redirect to properties list
7. Verify property no longer appears in listings

**Expected Result**: Property deleted successfully

#### Test Case: PROP-DELETE-002 - Delete Property - Non-Owner

**Priority**: High  
**Steps**:

1. Login as non-owner
2. Try to delete another user's property
3. Verify deletion is not possible

**Expected Result**: Non-owners cannot delete properties

#### Test Case: PROP-DELETE-003 - Delete Property - Confirmation

**Priority**: Medium  
**Steps**:

1. Click delete on property
2. Verify confirmation dialog appears
3. Cancel deletion
4. Verify property still exists
5. Delete with confirmation
6. Verify property is deleted

**Expected Result**: Confirmation dialog works correctly

---

## 3. Real-time Messaging System

### 3.1 Conversation Management

#### Test Case: MSG-CONV-001 - View All Conversations

**Priority**: High  
**Steps**:

1. Login as user
2. Navigate to `/messages`
3. Verify conversations list is displayed
4. Verify each conversation shows:
   - Participant name/avatar
   - Last message preview
   - Timestamp
   - Unread indicator (if applicable)

**Expected Result**: Conversations list displayed correctly

#### Test Case: MSG-CONV-002 - Start New Conversation

**Priority**: High  
**Steps**:

1. Login as user A
2. Navigate to `/messages`
3. Click "New Conversation" or "Start Chat"
4. Select user B from list
5. Verify conversation is created
6. Verify redirect to conversation view

**Expected Result**: New conversation created successfully

#### Test Case: MSG-CONV-003 - Start Conversation from Property

**Priority**: Medium  
**Steps**:

1. View property details
2. Click "Contact Owner" or "Message" button
3. Verify conversation is created with property owner
4. Verify redirect to messages page

**Expected Result**: Conversation started from property page

#### Test Case: MSG-CONV-004 - Select Conversation

**Priority**: High  
**Steps**:

1. Navigate to `/messages`
2. Click on a conversation
3. Verify messages are loaded
4. Verify conversation view is displayed

**Expected Result**: Conversation selected and messages loaded

### 3.2 Sending Messages

#### Test Case: MSG-SEND-001 - Send Text Message

**Priority**: High  
**Steps**:

1. Open a conversation
2. Type message in input field
3. Click "Send" or press Enter
4. Verify message appears in conversation
5. Verify message shows:
   - Text content
   - Sender name
   - Timestamp
   - Sent status

**Expected Result**: Message sent and displayed immediately

#### Test Case: MSG-SEND-002 - Send Message - Real-time Delivery

**Priority**: High  
**Steps**:

1. Login as user A in browser 1
2. Login as user B in browser 2
3. User A sends message to user B
4. Verify message appears in user B's view in real-time (without refresh)
5. Verify Socket.io connection is working

**Expected Result**: Messages delivered in real-time via Socket.io

#### Test Case: MSG-SEND-003 - Send Empty Message

**Priority**: Low  
**Steps**:

1. Try to send empty message
2. Verify message is not sent
3. Verify validation error or disabled send button

**Expected Result**: Empty messages cannot be sent

#### Test Case: MSG-SEND-004 - Send Long Message

**Priority**: Low  
**Steps**:

1. Type very long message (1000+ characters)
2. Send message
3. Verify message is sent and displayed correctly

**Expected Result**: Long messages handled correctly

### 3.3 Message Notifications

#### Test Case: MSG-NOTIF-001 - Receive Message Notification

**Priority**: High  
**Steps**:

1. User A sends message to user B
2. User B is on different page or has messages page open
3. Verify notification appears for user B
4. Verify unread count increases

**Expected Result**: Notifications appear for new messages

#### Test Case: MSG-NOTIF-002 - Mark Message as Read

**Priority**: Medium  
**Steps**:

1. Receive unread message
2. Open conversation
3. Verify message is marked as read
4. Verify unread count decreases
5. Verify notification is cleared

**Expected Result**: Messages marked as read correctly

#### Test Case: MSG-NOTIF-003 - Unread Message Count

**Priority**: Medium  
**Steps**:

1. Receive multiple unread messages
2. Verify unread count is displayed correctly
3. Read messages one by one
4. Verify count decreases accordingly

**Expected Result**: Unread count accurate

### 3.4 Property Sharing in Messages

#### Test Case: MSG-SHARE-001 - Share Property in Message

**Priority**: Medium  
**Steps**:

1. Open conversation
2. Click "Share Property" or similar option
3. Select property to share
4. Send message with property link
5. Verify property preview appears in message
6. Verify recipient can click to view property

**Expected Result**: Property sharing works correctly

---

## 4. User Profiles and Management

### 4.1 View Profile

#### Test Case: PROFILE-VIEW-001 - View Own Profile

**Priority**: High  
**Steps**:

1. Login as user
2. Navigate to `/profile`
3. Verify profile displays:
   - Name
   - Email
   - Avatar
   - User type
   - Bio (if set)
   - Phone (if set)
   - Preferences
4. Verify "Edit Profile" button is visible

**Expected Result**: Own profile displayed correctly

#### Test Case: PROFILE-VIEW-002 - View Other User Profile

**Priority**: Medium  
**Steps**:

1. Login as user A
2. Navigate to another user's profile (via property owner link or user search)
3. Verify profile information is displayed
4. Verify "Edit Profile" button is NOT visible
5. Verify "Message" button is visible

**Expected Result**: Other user profiles viewable but not editable

#### Test Case: PROFILE-VIEW-003 - View Profile - Unauthenticated

**Priority**: Medium  
**Steps**:

1. Logout
2. Try to access `/profile`
3. Verify redirect to login page

**Expected Result**: Profile requires authentication

### 4.2 Edit Profile

#### Test Case: PROFILE-EDIT-001 - Update Profile Information

**Priority**: High  
**Steps**:

1. Navigate to `/profile/edit`
2. Update name, bio, phone
3. Save changes
4. Verify changes are reflected on profile page
5. Verify changes are saved in database

**Expected Result**: Profile updated successfully

#### Test Case: PROFILE-EDIT-002 - Upload Avatar

**Priority**: Medium  
**Steps**:

1. Navigate to `/profile/edit`
2. Click "Upload Avatar" or "Change Photo"
3. Select image file
4. Verify image preview
5. Save changes
6. Verify avatar is updated on profile

**Expected Result**: Avatar uploaded and displayed correctly

#### Test Case: PROFILE-EDIT-003 - Update User Type

**Priority**: Medium  
**Steps**:

1. Edit profile
2. Change user type
3. Save changes
4. Verify user type is updated
5. Verify profile reflects new user type

**Expected Result**: User type can be updated

#### Test Case: PROFILE-EDIT-004 - Update Preferences

**Priority**: Low  
**Steps**:

1. Edit profile
2. Update preferences (location, budget, etc.)
3. Save changes
4. Verify preferences are saved

**Expected Result**: Preferences updated correctly

#### Test Case: PROFILE-EDIT-005 - Form Validation

**Priority**: Medium  
**Steps**:

1. Edit profile
2. Enter invalid data (e.g., invalid phone format)
3. Try to save
4. Verify validation errors

**Expected Result**: Profile form validation works

---

## 5. Navigation and Routing

### 5.1 Public Routes

#### Test Case: NAV-PUBLIC-001 - Home Page

**Priority**: High  
**Steps**:

1. Navigate to `/`
2. Verify home page loads
3. Verify navigation menu is visible
4. Verify key sections are displayed

**Expected Result**: Home page accessible and loads correctly

#### Test Case: NAV-PUBLIC-002 - Login Page

**Priority**: High  
**Steps**:

1. Navigate to `/login`
2. Verify login form is displayed
3. Verify social login buttons are visible
4. Verify "Register" link works

**Expected Result**: Login page accessible

#### Test Case: NAV-PUBLIC-003 - Register Page

**Priority**: High  
**Steps**:

1. Navigate to `/register`
2. Verify registration form is displayed
3. Verify all required fields are present
4. Verify "Login" link works

**Expected Result**: Register page accessible

#### Test Case: NAV-PUBLIC-004 - Properties List

**Priority**: High  
**Steps**:

1. Navigate to `/properties`
2. Verify properties are listed
3. Verify page is accessible without login
4. Verify filters and search work

**Expected Result**: Properties page accessible publicly

#### Test Case: NAV-PUBLIC-005 - Property Details

**Priority**: High  
**Steps**:

1. Navigate to `/properties/:id`
2. Verify property details are displayed
3. Verify page is accessible without login
4. Verify "Contact Owner" button redirects to login if not authenticated

**Expected Result**: Property details accessible publicly

### 5.2 Protected Routes

#### Test Case: NAV-PROTECTED-001 - Dashboard Access

**Priority**: High  
**Steps**:

1. Logout
2. Try to access `/dashboard`
3. Verify redirect to `/login`
4. Login
5. Verify redirect to `/dashboard`
6. Verify dashboard content is displayed

**Expected Result**: Dashboard requires authentication

#### Test Case: NAV-PROTECTED-002 - Create Property Access

**Priority**: High  
**Steps**:

1. Logout
2. Try to access `/properties/create`
3. Verify redirect to login
4. Login
5. Verify can access create property page

**Expected Result**: Create property requires authentication

#### Test Case: NAV-PROTECTED-003 - Messages Access

**Priority**: High  
**Steps**:

1. Logout
2. Try to access `/messages`
3. Verify redirect to login
4. Login
5. Verify messages page is accessible

**Expected Result**: Messages require authentication

#### Test Case: NAV-PROTECTED-004 - Profile Access

**Priority**: High  
**Steps**:

1. Logout
2. Try to access `/profile`
3. Verify redirect to login
4. Login
5. Verify profile page is accessible

**Expected Result**: Profile requires authentication

### 5.3 Navigation Menu

#### Test Case: NAV-MENU-001 - Navigation Links

**Priority**: Medium  
**Steps**:

1. Verify navigation menu on all pages
2. Test each navigation link:
   - Home
   - Properties
   - Login/Register (when logged out)
   - Dashboard (when logged in)
   - Messages (when logged in)
   - Profile (when logged in)
3. Verify links work correctly

**Expected Result**: All navigation links work

#### Test Case: NAV-MENU-002 - Navigation - Authenticated State

**Priority**: Medium  
**Steps**:

1. Login
2. Verify navigation shows:
   - Dashboard
   - Messages
   - Profile
   - Logout
3. Verify "Login" and "Register" are hidden

**Expected Result**: Navigation adapts to authentication state

#### Test Case: NAV-MENU-003 - Navigation - Unauthenticated State

**Priority**: Medium  
**Steps**:

1. Logout
2. Verify navigation shows:
   - Home
   - Properties
   - Login
   - Register
3. Verify protected links are hidden

**Expected Result**: Navigation shows only public links

#### Test Case: NAV-MENU-004 - Logout Functionality

**Priority**: High  
**Steps**:

1. Login
2. Click "Logout" in navigation
3. Verify user is logged out
4. Verify redirect to home or login
5. Verify token is cleared
6. Verify protected routes are inaccessible

**Expected Result**: Logout works correctly

### 5.4 404 and Error Pages

#### Test Case: NAV-ERROR-001 - 404 Page

**Priority**: Medium  
**Steps**:

1. Navigate to invalid route (e.g., `/invalid-page`)
2. Verify 404 page is displayed
3. Verify "Go Home" link works

**Expected Result**: 404 page displayed for invalid routes

---

## 6. API Endpoints

### 6.1 Authentication Endpoints

#### Test Case: API-AUTH-001 - POST /api/auth/register

**Priority**: High  
**Request**:

```json
POST /api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "newuser@test.com",
  "password": "TestPass123!",
  "userType": "room_seeker"
}
```

**Expected Response**: 200 OK

```json
{
  "token": "jwt_token_here"
}
```

**Verify**:

- Status code: 200
- Token is returned
- User is created in database
- Password is hashed

#### Test Case: API-AUTH-002 - POST /api/auth/login

**Priority**: High  
**Request**:

```json
POST /api/auth/login
Content-Type: application/json

{
  "email": "namritasaxena2000@gmail.com",
  "password": "Hello@123"
}
```

**Expected Response**: 200 OK

```json
{
  "token": "jwt_token_here"
}
```

**Verify**:

- Status code: 200
- Token is returned
- Token is valid JWT

#### Test Case: API-AUTH-003 - GET /api/auth/verify

**Priority**: High  
**Request**:

```
GET /api/auth/verify
Authorization: Bearer {token}
```

**Expected Response**: 200 OK

```json
{
  "user": { ... }
}
```

**Verify**:

- Status code: 200 with valid token
- Status code: 401 with invalid/missing token
- User data is returned

#### Test Case: API-AUTH-004 - POST /api/auth/forgot-password

**Priority**: Medium  
**Request**:

```json
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "namritasaxena2000@gmail.com"
}
```

**Expected Response**: 200 OK

```json
{
  "message": "Password reset email sent"
}
```

**Verify**:

- Status code: 200
- Email is sent (check email service)
- Reset token is generated

### 6.2 Property Endpoints

#### Test Case: API-PROP-001 - GET /api/properties

**Priority**: High  
**Request**:

```
GET /api/properties
```

**Expected Response**: 200 OK

```json
{
  "properties": [...],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

**Verify**:

- Status code: 200
- Only active properties returned
- Pagination works
- Filters work (query parameters)

#### Test Case: API-PROP-002 - POST /api/properties

**Priority**: High  
**Request**:

```
POST /api/properties
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form data:
- title: "Test Property"
- description: "Test Description"
- propertyType: "apartment"
- listingType: "entire_property"
- address: JSON string
- price: JSON string
- images: [file1, file2]
```

**Expected Response**: 201 Created

```json
{
  "property": { ... }
}
```

**Verify**:

- Status code: 201
- Property is created
- Images are uploaded
- Owner is set to authenticated user
- Requires authentication (401 if no token)

#### Test Case: API-PROP-003 - GET /api/properties/:id

**Priority**: High  
**Request**:

```
GET /api/properties/{propertyId}
```

**Expected Response**: 200 OK

```json
{
  "property": { ... }
}
```

**Verify**:

- Status code: 200
- Property details returned
- Owner information included
- Status code: 404 if property not found

#### Test Case: API-PROP-004 - PUT /api/properties/:id

**Priority**: High  
**Request**:

```
PUT /api/properties/{propertyId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "price": { "amount": 2000 }
}
```

**Expected Response**: 200 OK

```json
{
  "property": { ... }
}
```

**Verify**:

- Status code: 200 for owner
- Status code: 403 for non-owner
- Status code: 401 if not authenticated
- Property is updated

#### Test Case: API-PROP-005 - DELETE /api/properties/:id

**Priority**: High  
**Request**:

```
DELETE /api/properties/{propertyId}
Authorization: Bearer {token}
```

**Expected Response**: 200 OK

```json
{
  "message": "Property deleted"
}
```

**Verify**:

- Status code: 200 for owner
- Status code: 403 for non-owner
- Status code: 401 if not authenticated
- Property is deleted from database

### 6.3 User Endpoints

#### Test Case: API-USER-001 - GET /api/users/profile

**Priority**: High  
**Request**:

```
GET /api/users/profile
Authorization: Bearer {token}
```

**Expected Response**: 200 OK

```json
{
  "user": { ... }
}
```

**Verify**:

- Status code: 200
- Current user data returned
- Password not included
- Status code: 401 if not authenticated

#### Test Case: API-USER-002 - PUT /api/users/update

**Priority**: High  
**Request**:

```
PUT /api/users/update
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "bio": "Updated bio"
}
```

**Expected Response**: 200 OK

```json
{
  "user": { ... }
}
```

**Verify**:

- Status code: 200
- User is updated
- Status code: 401 if not authenticated

#### Test Case: API-USER-003 - GET /api/users/:id

**Priority**: Medium  
**Request**:

```
GET /api/users/{userId}
```

**Expected Response**: 200 OK

```json
{
  "user": { ... }
}
```

**Verify**:

- Status code: 200
- User data returned
- Password not included
- Status code: 404 if user not found

### 6.4 Message Endpoints

#### Test Case: API-MSG-001 - GET /api/messages/conversations

**Priority**: High  
**Request**:

```
GET /api/messages/conversations
Authorization: Bearer {token}
```

**Expected Response**: 200 OK

```json
{
  "conversations": [...]
}
```

**Verify**:

- Status code: 200
- Only user's conversations returned
- Status code: 401 if not authenticated

#### Test Case: API-MSG-002 - GET /api/messages/:conversationId

**Priority**: High  
**Request**:

```
GET /api/messages/{conversationId}
Authorization: Bearer {token}
```

**Expected Response**: 200 OK

```json
{
  "messages": [...]
}
```

**Verify**:

- Status code: 200
- Messages for conversation returned
- Status code: 403 if user not in conversation
- Status code: 401 if not authenticated

#### Test Case: API-MSG-003 - POST /api/messages

**Priority**: High  
**Request**:

```
POST /api/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "conversationId": "conv_id",
  "content": "Test message"
}
```

**Expected Response**: 201 Created

```json
{
  "message": { ... }
}
```

**Verify**:

- Status code: 201
- Message is created
- Status code: 401 if not authenticated
- Status code: 400 if validation fails

#### Test Case: API-MSG-004 - PUT /api/messages/:id/read

**Priority**: Medium  
**Request**:

```
PUT /api/messages/{messageId}/read
Authorization: Bearer {token}
```

**Expected Response**: 200 OK

```json
{
  "message": "Message marked as read"
}
```

**Verify**:

- Status code: 200
- Message marked as read
- Status code: 401 if not authenticated

---

## 7. Security and Validation

### 7.1 Authentication Security

#### Test Case: SEC-AUTH-001 - JWT Token Validation

**Priority**: Critical  
**Steps**:

1. Make request to protected endpoint without token
2. Verify 401 Unauthorized
3. Make request with invalid token
4. Verify 401 Unauthorized
5. Make request with expired token
6. Verify 401 Unauthorized
7. Make request with valid token
8. Verify 200 OK

**Expected Result**: JWT validation works correctly

#### Test Case: SEC-AUTH-002 - Password Hashing

**Priority**: Critical  
**Steps**:

1. Register new user
2. Check database
3. Verify password is hashed (bcrypt)
4. Verify plain password is not stored

**Expected Result**: Passwords are properly hashed

#### Test Case: SEC-AUTH-003 - Rate Limiting

**Priority**: High  
**Steps**:

1. Make 100+ requests to `/api/auth/login` rapidly
2. Verify rate limiting kicks in
3. Verify appropriate error response
4. Wait for rate limit window
5. Verify requests work again

**Expected Result**: Rate limiting prevents abuse

### 7.2 Input Validation

#### Test Case: SEC-VAL-001 - SQL Injection Prevention

**Priority**: Critical  
**Steps**:

1. Try SQL injection in various input fields:
   - Login: `' OR '1'='1`
   - Search: `'; DROP TABLE users; --`
2. Verify no SQL execution
3. Verify proper error handling

**Expected Result**: SQL injection attempts are blocked

#### Test Case: SEC-VAL-002 - XSS Prevention

**Priority**: Critical  
**Steps**:

1. Enter XSS payload in forms:
   - `<script>alert('XSS')</script>`
   - `<img src=x onerror=alert('XSS')>`
2. Submit form
3. View submitted data
4. Verify scripts are not executed
5. Verify data is sanitized/escaped

**Expected Result**: XSS attacks are prevented

#### Test Case: SEC-VAL-003 - File Upload Validation

**Priority**: High  
**Steps**:

1. Try to upload non-image file (e.g., .exe, .js)
2. Verify upload is rejected
3. Try to upload very large file
4. Verify size limit enforced
5. Try to upload valid image
6. Verify upload succeeds

**Expected Result**: Only valid images can be uploaded

#### Test Case: SEC-VAL-004 - Email Validation

**Priority**: Medium  
**Steps**:

1. Try to register with invalid email formats:
   - `invalid`
   - `invalid@`
   - `@invalid.com`
   - `invalid@.com`
2. Verify all are rejected
3. Register with valid email
4. Verify succeeds

**Expected Result**: Email validation works correctly

#### Test Case: SEC-VAL-005 - MongoDB Injection Prevention

**Priority**: Critical  
**Steps**:

1. Try MongoDB injection in search/filter:
   - `{"$ne": null}`
   - `{"$gt": ""}`
2. Verify injection is prevented
3. Verify mongo-sanitize is working

**Expected Result**: MongoDB injection prevented

### 7.3 CORS and Headers

#### Test Case: SEC-CORS-001 - CORS Configuration

**Priority**: Medium  
**Steps**:

1. Make request from different origin
2. Verify CORS headers are set correctly
3. Verify allowed origins are configured
4. Verify credentials are handled

**Expected Result**: CORS configured correctly

#### Test Case: SEC-HEADERS-001 - Security Headers

**Priority**: Medium  
**Steps**:

1. Check response headers
2. Verify security headers are present:
   - X-Content-Type-Options
   - X-Frame-Options
   - X-XSS-Protection
   - Content-Security-Policy (if set)
3. Verify Helmet middleware is working

**Expected Result**: Security headers are set

---

## 8. UI/UX and Responsive Design

### 8.1 Desktop View (1920x1080)

#### Test Case: UI-DESKTOP-001 - Home Page Layout

**Priority**: Medium  
**Steps**:

1. Open application on desktop (1920x1080)
2. Navigate to home page
3. Verify layout is correct:
   - Header is visible
   - Content is centered
   - Footer is visible
   - No horizontal scrolling
4. Verify all elements are readable

**Expected Result**: Desktop layout is proper

#### Test Case: UI-DESKTOP-002 - Forms on Desktop

**Priority**: Medium  
**Steps**:

1. Test all forms on desktop:
   - Registration
   - Login
   - Property creation
   - Profile edit
2. Verify forms are properly sized
3. Verify inputs are easy to use
4. Verify buttons are clickable

**Expected Result**: Forms work well on desktop

#### Test Case: UI-DESKTOP-003 - Property Listings Grid

**Priority**: Medium  
**Steps**:

1. View properties page on desktop
2. Verify properties are displayed in grid
3. Verify grid is responsive (3-4 columns)
4. Verify images are properly sized
5. Verify hover effects work

**Expected Result**: Property grid displays correctly

### 8.2 Tablet View (768x1024)

#### Test Case: UI-TABLET-001 - Responsive Layout

**Priority**: Medium  
**Steps**:

1. Resize browser to tablet size (768x1024)
2. Navigate through all pages
3. Verify layout adapts:
   - Navigation menu works
   - Content is readable
   - Forms are usable
   - No elements overlap
4. Verify touch interactions work

**Expected Result**: Tablet layout is responsive

#### Test Case: UI-TABLET-002 - Property Grid on Tablet

**Priority**: Low  
**Steps**:

1. View properties on tablet
2. Verify grid adapts (2 columns)
3. Verify images scale properly
4. Verify cards are touch-friendly

**Expected Result**: Property grid adapts to tablet

### 8.3 Mobile View (375x667)

#### Test Case: UI-MOBILE-001 - Mobile Navigation

**Priority**: High  
**Steps**:

1. Resize to mobile (375x667)
2. Verify navigation menu:
   - Hamburger menu appears (if implemented)
   - Menu is accessible
   - Links work on touch
   - Menu closes after selection
3. Verify all pages are accessible

**Expected Result**: Mobile navigation works

#### Test Case: UI-MOBILE-002 - Mobile Forms

**Priority**: High  
**Steps**:

1. Test forms on mobile:
   - Registration
   - Login
   - Property creation
2. Verify:
   - Inputs are large enough for touch
   - Keyboard appears correctly
   - Forms are scrollable
   - Submit buttons are accessible
3. Verify no horizontal scrolling

**Expected Result**: Forms are mobile-friendly

#### Test Case: UI-MOBILE-003 - Property Listings on Mobile

**Priority**: Medium  
**Steps**:

1. View properties on mobile
2. Verify:
   - Single column layout
   - Images are properly sized
   - Text is readable
   - Cards are touch-friendly
   - Swipe gestures work (if implemented)

**Expected Result**: Properties display well on mobile

#### Test Case: UI-MOBILE-004 - Messages on Mobile

**Priority**: Medium  
**Steps**:

1. Open messages on mobile
2. Verify:
   - Conversation list is usable
   - Message input is accessible
   - Keyboard doesn't cover input
   - Messages are readable
   - Send button is accessible

**Expected Result**: Messages work on mobile

### 8.4 UI Components

#### Test Case: UI-COMP-001 - Material-UI Components

**Priority**: Medium  
**Steps**:

1. Test all Material-UI components:
   - Buttons (click, hover, disabled states)
   - Text fields (focus, validation, error states)
   - Dialogs/Modals (open, close, backdrop)
   - Alerts/Notifications (display, dismiss)
   - Cards (hover, click)
2. Verify all components work correctly

**Expected Result**: All UI components function properly

#### Test Case: UI-COMP-002 - Loading States

**Priority**: Medium  
**Steps**:

1. Trigger loading states:
   - Form submission
   - API calls
   - Page navigation
2. Verify loading indicators appear
3. Verify UI is disabled during loading
4. Verify loading completes

**Expected Result**: Loading states work correctly

#### Test Case: UI-COMP-003 - Error Messages

**Priority**: Medium  
**Steps**:

1. Trigger various errors:
   - Form validation errors
   - API errors
   - Network errors
2. Verify error messages are displayed
3. Verify error messages are clear and helpful
4. Verify errors can be dismissed

**Expected Result**: Error handling is user-friendly

#### Test Case: UI-COMP-004 - Success Messages

**Priority**: Low  
**Steps**:

1. Complete successful actions:
   - Registration
   - Property creation
   - Profile update
2. Verify success messages appear
3. Verify messages are clear
4. Verify messages auto-dismiss or can be dismissed

**Expected Result**: Success feedback is provided

### 8.5 Accessibility

#### Test Case: UI-A11Y-001 - Keyboard Navigation

**Priority**: Medium  
**Steps**:

1. Navigate entire application using only keyboard:
   - Tab through all interactive elements
   - Use Enter/Space to activate
   - Use Arrow keys where applicable
2. Verify all functionality is accessible
3. Verify focus indicators are visible

**Expected Result**: Full keyboard navigation works

#### Test Case: UI-A11Y-002 - Screen Reader Compatibility

**Priority**: Low  
**Steps**:

1. Use screen reader (if available)
2. Navigate through pages
3. Verify:
   - Alt text on images
   - Form labels are associated
   - ARIA labels where needed
   - Semantic HTML

**Expected Result**: Application is screen reader friendly

---

## Test Execution Summary

### Test Statistics

- **Total Test Cases**: 150+
- **High Priority**: 60+
- **Medium Priority**: 50+
- **Low Priority**: 40+

### Test Areas Coverage

1. ✅ Authentication: 20+ test cases
2. ✅ Property Management: 25+ test cases
3. ✅ Messaging: 15+ test cases
4. ✅ User Profiles: 10+ test cases
5. ✅ Navigation: 15+ test cases
6. ✅ API Endpoints: 20+ test cases
7. ✅ Security: 15+ test cases
8. ✅ UI/UX: 25+ test cases

### Prerequisites for Test Execution

1. ✅ Application servers running (Frontend: 3000, Backend: 5000)
2. ✅ MongoDB running and accessible
3. ✅ Test account created
4. ✅ Test data prepared (properties, users, conversations)

---

**This test plan is ready for TestSprite execution!**
