# Test Requirements for Flatmates Platform

## Project Overview

Flatmates is a full-stack web application that connects people looking for flatmates or properties to rent. The platform supports four distinct user types with specific functionalities.

## Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

## User Types

1. Users searching for a room in a preoccupied flat
2. Users looking for roommates to find a flat together
3. Users willing to rent out a preoccupied flat
4. Users willing to rent out the whole property

## Test Scenarios

### 1. Authentication & User Management

#### Registration

- [ ] User can register with email and password
- [ ] User can register with Google account
- [ ] User can register with Facebook account
- [ ] User can register with Instagram account
- [ ] Registration validates required fields (name, email, password)
- [ ] Registration validates email format
- [ ] Registration validates password strength
- [ ] Duplicate email registration is prevented
- [ ] User type selection works correctly

#### Login

- [ ] User can login with email and password
- [ ] User can login with Google account
- [ ] User can login with Facebook account
- [ ] User can login with Instagram account
- [ ] Invalid credentials show appropriate error
- [ ] Successful login redirects to dashboard
- [ ] JWT token is stored after login

#### Password Management

- [ ] User can request password reset
- [ ] Password reset email is sent
- [ ] User can reset password with valid token
- [ ] Invalid reset token is rejected

#### Profile Management

- [ ] User can view their profile
- [ ] User can edit their profile
- [ ] User can upload avatar image
- [ ] Profile updates are saved correctly
- [ ] User type can be selected/updated

### 2. Property Management

#### Property Listing

- [ ] User can view all properties
- [ ] Properties are displayed with correct information
- [ ] Property images are displayed correctly
- [ ] Property details include: title, description, location, price, type
- [ ] Properties can be filtered by type
- [ ] Properties can be searched
- [ ] Pagination works (if implemented)

#### Property Creation

- [ ] Authenticated user can create a property
- [ ] Property form validates required fields
- [ ] User can upload property images
- [ ] Property is saved with correct user association
- [ ] Property status defaults to 'active'
- [ ] Created property appears in listings

#### Property Editing

- [ ] Property owner can edit their property
- [ ] Non-owners cannot edit property
- [ ] Property updates are saved correctly
- [ ] Property images can be updated

#### Property Details

- [ ] Property details page displays all information
- [ ] Property owner information is displayed
- [ ] User can contact property owner (message button)
- [ ] Property images are displayed in gallery

#### Property Expiration

- [ ] Properties older than 30 days are marked inactive
- [ ] Inactive properties don't appear in active listings

### 3. Messaging System

#### Conversation Management

- [ ] User can view all conversations
- [ ] Conversations list shows participants
- [ ] Conversations show last message preview
- [ ] User can start a new conversation
- [ ] User can select a conversation to view messages

#### Message Sending

- [ ] User can send text messages
- [ ] Messages are delivered in real-time (Socket.io)
- [ ] Messages appear in conversation
- [ ] Message timestamp is displayed
- [ ] Sender information is displayed correctly

#### Message Notifications

- [ ] New message notifications appear
- [ ] Unread message count is displayed
- [ ] Notifications are cleared when message is read
- [ ] Real-time notifications work via Socket.io

#### Property Sharing

- [ ] User can share property in message
- [ ] Shared property link works correctly
- [ ] Property preview appears in message

### 4. Navigation & Routing

#### Public Routes

- [ ] Home page loads correctly
- [ ] Login page is accessible
- [ ] Register page is accessible
- [ ] Forgot password page is accessible
- [ ] Property listings are accessible
- [ ] Property details are accessible

#### Protected Routes

- [ ] Dashboard requires authentication
- [ ] Profile page requires authentication
- [ ] Create property requires authentication
- [ ] Messages require authentication
- [ ] Unauthenticated users are redirected to login

### 5. UI/UX Testing

#### Responsive Design

- [ ] Application works on desktop (1920x1080)
- [ ] Application works on tablet (768x1024)
- [ ] Application works on mobile (375x667)
- [ ] Navigation menu works on all screen sizes
- [ ] Forms are usable on mobile devices

#### Material-UI Components

- [ ] Buttons work correctly
- [ ] Forms validate input
- [ ] Modals/dialogs open and close
- [ ] Alerts/notifications display correctly
- [ ] Loading states are shown

### 6. API Testing

#### Authentication Endpoints

- [ ] POST /api/auth/register - Creates new user
- [ ] POST /api/auth/login - Authenticates user
- [ ] GET /api/auth/verify - Verifies JWT token
- [ ] POST /api/auth/logout - Logs out user
- [ ] POST /api/auth/forgot-password - Sends reset email
- [ ] POST /api/auth/reset-password - Resets password

#### User Endpoints

- [ ] GET /api/users/profile - Gets user profile
- [ ] PUT /api/users/update - Updates user profile
- [ ] GET /api/users/:id - Gets user by ID

#### Property Endpoints

- [ ] GET /api/properties - Lists all properties
- [ ] POST /api/properties - Creates property
- [ ] GET /api/properties/:id - Gets property details
- [ ] PUT /api/properties/:id - Updates property
- [ ] DELETE /api/properties/:id - Deletes property
- [ ] GET /api/properties/search - Searches properties

#### Message Endpoints

- [ ] GET /api/messages/conversations - Gets all conversations
- [ ] GET /api/messages/:conversationId - Gets messages
- [ ] POST /api/messages - Sends message
- [ ] PUT /api/messages/:id/read - Marks message as read

### 7. Security Testing

#### Authentication Security

- [ ] JWT tokens are required for protected routes
- [ ] Invalid tokens are rejected
- [ ] Expired tokens are rejected
- [ ] Passwords are hashed (bcrypt)
- [ ] Rate limiting works on auth endpoints

#### Input Validation

- [ ] SQL injection attempts are blocked
- [ ] XSS attacks are prevented
- [ ] File uploads are validated
- [ ] Email format is validated
- [ ] Required fields are enforced

### 8. Error Handling

#### Frontend Errors

- [ ] Network errors are handled gracefully
- [ ] 404 page is displayed for invalid routes
- [ ] Form validation errors are shown
- [ ] API errors are displayed to user

#### Backend Errors

- [ ] 400 errors for bad requests
- [ ] 401 errors for unauthorized access
- [ ] 404 errors for not found resources
- [ ] 500 errors are logged and handled
- [ ] Error messages are user-friendly

## Test Data Requirements

### Test Users

Create test accounts for each user type:

1. Room seeker (userType: "seeking_room")
2. Roommate finder (userType: "finding_roommate")
3. Room renter (userType: "renting_room")
4. Property owner (userType: "renting_property")

### Test Properties

- At least 5 test properties with different types
- Properties with images
- Properties with different statuses (active/inactive)
- Properties from different users

## Performance Considerations

- Page load times should be < 3 seconds
- API response times should be < 500ms
- Real-time messages should appear within 1 second
- Image uploads should complete within 10 seconds

## Browser Compatibility

Test on:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- Ensure MongoDB is running before testing
- Backend must be running on port 5000
- Frontend must be running on port 3000
- Socket.io connections should be tested for real-time features
- Test with both authenticated and unauthenticated states
