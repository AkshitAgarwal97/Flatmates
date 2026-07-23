# TestSprite Setup Guide for Flatmates Project

This guide will help you set up and run TestSprite tests for the Flatmates platform.

## Prerequisites

Before running TestSprite tests, ensure you have:

1. **Node.js** (v14 or higher) installed
2. **MongoDB** running locally or accessible
3. **TestSprite MCP Server** installed (if using IDE integration)
4. **Test accounts** created in your database

## Step 1: Install Dependencies

Make sure all project dependencies are installed:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 2: Set Up Environment Variables

Create `.env` files if they don't exist:

### Backend `.env` file (`backend/.env`):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/flatmates
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:3000
NODE_ENV=development

# OAuth Credentials (if using social login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret

# Email Configuration (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

### Frontend `.env` file (`frontend/.env`):

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## Step 3: Start the Application

You need both frontend and backend running before testing:

### Terminal 1 - Start Backend:

```bash
cd backend
npm run dev
```

Backend should be running on `http://localhost:5000`

### Terminal 2 - Start Frontend:

```bash
cd frontend
npm start
```

Frontend should be running on `http://localhost:3000`

## Step 4: Create Test Accounts

Before running tests, create test user accounts. You can do this by:

1. **Using the registration form** at `http://localhost:3000/register`
2. **Using MongoDB directly** to insert test users
3. **Using the API** with a tool like Postman

### Recommended Test Accounts:

```json
{
  "email": "namritasaxena2000@gmail.com",
  "password": "Hello@123",
  "name": "Test User",
  "userType": "seeking_room"
}
```

Create accounts for each user type:

- `seeking_room` - Users searching for a room
- `finding_roommate` - Users looking for roommates
- `renting_room` - Users renting out a room
- `renting_property` - Users renting out whole property

## Step 5: Configure TestSprite

### Option A: Using TestSprite Web Portal

1. Go to the TestSprite Dashboard
2. Create a new test project
3. Enter the following information:
   - **Project Name**: Flatmates
   - **Frontend URL**: `http://localhost:3000`
   - **Backend URL**: `http://localhost:5000/api`
   - **Test Type**: Full-stack (Frontend + Backend)
   - **Test Account Email**: `namritasaxena2000@gmail.com`
   - **Test Account Password**: `Hello@123`
4. Upload the `TEST_REQUIREMENTS.md` file as your PRD
5. Upload the `testsprite.config.json` file for configuration

### Option B: Using TestSprite MCP Server (IDE Integration)

1. Ensure TestSprite MCP Server is installed
2. In your IDE (Cursor), open a new chat
3. Enter: `Can you test this project with TestSprite?`
4. The configuration page will open in your browser
5. Fill in the testing parameters:
   - **Testing Type**: Full-stack
   - **Frontend URL**: `http://localhost:3000`
   - **Backend URL**: `http://localhost:5000/api`
   - **Test Account**: Use the credentials from Step 4
   - **PRD**: Reference the `TEST_REQUIREMENTS.md` file

## Step 6: Review Test Plan

TestSprite will generate a comprehensive test plan based on:

- The `testsprite.config.json` configuration
- The `TEST_REQUIREMENTS.md` requirements
- Analysis of your codebase

Review the generated test plan and customize if needed.

## Step 7: Execute Tests

Once configured, TestSprite will:

1. Generate detailed test cases
2. Execute tests in a cloud environment
3. Provide real-time test execution feedback
4. Generate comprehensive test reports

## Step 8: Review Test Results

After test execution, you'll receive:

- **Test Report**: Detailed results of all test cases
- **Screenshots**: Visual evidence of test execution
- **Error Logs**: Detailed error information
- **Recommendations**: AI-suggested fixes for identified issues

## Troubleshooting

### Backend not starting

- Check if MongoDB is running: `mongod` or check your MongoDB service
- Verify `.env` file exists and has correct values
- Check if port 5000 is available: `netstat -ano | findstr :5000` (Windows)

### Frontend not starting

- Check if port 3000 is available
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run type-check`

### TestSprite connection issues

- Ensure both frontend and backend are running
- Verify URLs are accessible: `curl http://localhost:3000` and `curl http://localhost:5000/api`
- Check firewall settings

### Authentication failures

- Verify test account exists in database
- Check JWT_SECRET in backend `.env`
- Ensure password matches exactly (case-sensitive)

## Test Data Cleanup

After testing, you may want to clean up test data:

```javascript
// In MongoDB shell or using a script
use flatmates
db.users.deleteMany({ email: /namritasaxena2000@gmail.com/ })
db.properties.deleteMany({ owner: ObjectId("test_user_id") })
db.conversations.deleteMany({ participants: ObjectId("test_user_id") })
```

## Continuous Testing

For continuous testing, consider:

1. Setting up automated test runs on code changes
2. Integrating TestSprite with CI/CD pipeline
3. Running tests before deployments
4. Maintaining test data separately from production

## Additional Resources

- TestSprite Documentation: https://docs.testsprite.com
- TestSprite Quick Start: https://docs.testsprite.com/get-started/Quick%20Start
- Project README: See `README.md` for general project setup

## Support

If you encounter issues:

1. Check the TestSprite documentation
2. Review test execution logs
3. Verify application is running correctly
4. Check TestSprite configuration matches your setup
