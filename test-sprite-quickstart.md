# TestSprite Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Start Your Application

```bash
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend
cd frontend
npm start
```

Verify both are running:

- ✅ Backend: http://localhost:5000
- ✅ Frontend: http://localhost:3000

### Step 2: Create Test Account

Register a test account at http://localhost:3000/register or use:

- Email: `namritasaxena2000@gmail.com`
- Password: `Hello@123`

### Step 3: Run TestSprite

**Option A: Using Cursor IDE (Recommended)**

1. Open a new chat in Cursor
2. Type: `Can you test this project with TestSprite?`
3. Follow the configuration prompts

**Option B: Using Web Portal**

1. Go to TestSprite Dashboard
2. Create new test project
3. Enter:
   - Frontend URL: `http://localhost:3000`
   - Backend URL: `http://localhost:5000/api`
   - Upload `TEST_REQUIREMENTS.md` as PRD
   - Upload `testsprite.config.json` for config

### Step 4: Review & Execute

- Review the generated test plan
- Execute tests
- Review results and fix issues

## 📋 Configuration Files

All TestSprite configuration files are ready:

- ✅ `testsprite.config.json` - Project configuration
- ✅ `TEST_REQUIREMENTS.md` - Test scenarios & requirements
- ✅ `TESTSprite_SETUP.md` - Detailed setup guide

## 🎯 What Will Be Tested

- Authentication (Login, Register, Social Auth)
- Property Management (Create, Read, Update, Delete)
- Real-time Messaging
- User Profiles
- Navigation & Routing
- API Endpoints
- Security & Validation

## ⚠️ Troubleshooting

**Backend not starting?**

- Check MongoDB is running
- Verify `.env` file exists in `backend/`
- Check port 5000 is free

**Frontend not starting?**

- Check port 3000 is free
- Run `npm install` in `frontend/`

**TestSprite connection issues?**

- Ensure both servers are running
- Verify URLs are accessible
- Check firewall settings

## 📚 More Information

- Full setup guide: `TESTSprite_SETUP.md`
- Test requirements: `TEST_REQUIREMENTS.md`
- Configuration: `testsprite.config.json`

---

**Ready to test?** Start your servers and run TestSprite! 🎉
