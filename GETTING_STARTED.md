# Getting Started Guide - ReportIt

A quick guide to set up and run the ReportIt Police Complaint Management System locally.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)
- **Code Editor** - VS Code recommended - [Download](https://code.visualstudio.com/)

### Verify Installation

Open terminal/PowerShell and run:
```powershell
node --version
npm --version
```

## 🚀 Quick Start (5 minutes)

### Step 1: Clone or Download Project

```powershell
# If using git
git clone <repository-url>
cd ReportIt

# Or manually download and extract the project folder
```

### Step 2: Backend Setup

Open a terminal/PowerShell and navigate to backend:

```powershell
cd backend
npm install
```

Create `.env` file in `backend` folder:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/reportit
JWT_SECRET=your-secret-key-123
JWT_EXPIRE=7d
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@reportit.com
FRONTEND_URL=http://localhost:5173
```

**Note**: For Gmail, use [App Password](https://support.google.com/accounts/answer/185833) instead of regular password.

Start backend server:

```powershell
npm run dev
```

You should see: `Server running on port 5000` ✅

### Step 3: Frontend Setup

Open **new terminal/PowerShell** window:

```powershell
cd frontend
npm install
npm run dev
```

Frontend will be available at: **http://localhost:5173** ✅

## 📖 Detailed Setup

### MongoDB Setup

#### Option 1: Local Installation (Windows)

1. **Install MongoDB Community Edition**
   - Download from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Run installer with default settings
   - MongoDB runs as service on `localhost:27017`

2. **Verify Installation**
   ```powershell
   mongod --version
   ```

#### Option 2: MongoDB Atlas (Cloud)

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Update `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/reportit
   ```

#### Option 3: Docker (if installed)

```powershell
docker run -d -p 27017:27017 --name mongodb mongo
```

### Email Configuration

#### Using Gmail:

1. Enable 2-factor authentication on Gmail
2. Generate [App Password](https://support.google.com/accounts/answer/185833)
3. Use app password in `.env`:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

#### Using Alternative Email Service:

```env
EMAIL_SERVICE=outlook  # or other service
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### JWT Secret Generation

Generate a secure JWT secret:

```powershell
# Using Node.js crypto
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output to `.env` as `JWT_SECRET`.

## 🌱 Database Seeding (Optional)

Populate database with sample data:

```powershell
cd backend
npm run seed
```

This creates:
- Sample users (admin, police, station heads, regular users)
- Sample police stations
- Sample complaints

Default credentials (change in production):
- **Admin**: admin@reportit.com / password123
- **Police**: officer@reportit.com / password123
- **User**: user@reportit.com / password123

## 🧪 Testing the Application

### 1. Test User Registration

1. Go to http://localhost:5173
2. Click "Register"
3. Fill in the registration form
4. Submit

### 2. Test Complaint Submission

1. Login as user
2. Click "Submit Complaint"
3. Fill complaint form
4. Submit

### 3. Test Police Dashboard

1. Login as police officer (if seeded)
2. Navigate to Police Dashboard
3. View assigned complaints

### 4. Test Admin Panel

1. Login as admin
2. Navigate to Admin Dashboard
3. Manage stations, police, users

## 📂 Project Structure After Setup

```
ReportIt/
├── backend/
│   ├── node_modules/          (created after npm install)
│   ├── uploads/               (stores user uploads)
│   ├── .env                   (created manually)
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── node_modules/          (created after npm install)
│   ├── .env                   (optional)
│   ├── package.json
│   ├── vite.config.js
│   └── src/
├── README.md
├── API_DOCUMENTATION.md
└── GETTING_STARTED.md
```

## 🔍 Troubleshooting

### Issue: "Cannot find module" error

**Solution:**
```powershell
# Clear node_modules and reinstall
rm -Force -Recurse node_modules
npm install
```

### Issue: MongoDB connection error

**Solution:**
```powershell
# Check if MongoDB is running
# Windows: 
tasklist | findstr mongod

# If not running, start it:
mongod

# Verify connection string in .env
```

### Issue: Port already in use

**Solution:**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID> /F

# Or change port in backend .env:
PORT=5001
```

### Issue: CORS errors in frontend

**Solution:**
```env
# Backend .env - Ensure FRONTEND_URL matches frontend URL
FRONTEND_URL=http://localhost:5173
```

### Issue: "Email sending failed"

**Solution:**
- Verify Gmail App Password (not regular password)
- Enable "Less secure app access" (Gmail)
- Check email credentials in `.env`
- Verify internet connection

### Issue: Module not found errors

**Solution:**
```powershell
# Reinstall specific package
npm install package-name

# Or reinstall all
cd backend
npm install
cd ../frontend
npm install
```

## 🛠️ Development Workflow

### Starting Development

1. **Terminal 1 - Backend:**
   ```powershell
   cd backend
   npm run dev
   ```

2. **Terminal 2 - Frontend:**
   ```powershell
   cd frontend
   npm run dev
   ```

3. **Terminal 3 - Optional MongoDB:**
   ```powershell
   mongod
   ```

### Making Changes

- **Backend**: Changes auto-reload with nodemon
- **Frontend**: Changes auto-reload with Vite
- Refresh browser if needed

### Checking Logs

- **Backend logs**: Check terminal where `npm run dev` runs
- **Frontend logs**: Check browser console (F12)
- **API logs**: Check backend terminal

## 🚀 Building for Production

### Backend

```powershell
cd backend
npm start
```

### Frontend

```powershell
cd frontend
npm run build
npm run preview
```

Visit: http://localhost:4173

## 📝 Default Test Accounts (if seeded)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@reportit.com | password123 |
| Police | officer@reportit.com | password123 |
| User | user@reportit.com | password123 |

**⚠️ Change these credentials in production!**

## 🔒 Security Checklist

Before deployment:

- [ ] Change all default passwords
- [ ] Generate new JWT_SECRET
- [ ] Set strong database passwords
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Use environment variables from secrets manager
- [ ] Enable database backups
- [ ] Set up monitoring and logging
- [ ] Review API rate limiting needs
- [ ] Test all authentication flows

## 📚 Common Commands

### Backend
```powershell
npm start                 # Production mode
npm run dev              # Development with hot reload
npm run seed             # Seed database with sample data
npm test                 # Run tests (if configured)
```

### Frontend
```powershell
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run lint -- --fix    # Fix linting issues
```

## 🆘 Getting Help

### Check Logs
```powershell
# Backend logs
cd backend
npm run dev              # Watch console output

# Frontend browser logs
# Press F12 in browser, check Console tab
```

### Verify Services

```powershell
# Check if services are running
netstat -ano | findstr :5000      # Backend
netstat -ano | findstr :5173      # Frontend
tasklist | findstr mongod          # MongoDB
```

### Common Issues & Solutions

1. **Port Conflicts**: Use different ports in `.env`
2. **Database Issues**: Verify MongoDB is running and connection string is correct
3. **Email Issues**: Check Gmail App Password and SMTP settings
4. **CORS Issues**: Verify FRONTEND_URL in backend `.env`
5. **Module Issues**: Delete `node_modules` and `package-lock.json`, then `npm install`

## 📞 Support Resources

- **MongoDB Docs**: https://docs.mongodb.com
- **Express.js**: https://expressjs.com
- **React**: https://react.dev
- **Vite**: https://vitejs.dev
- **JWT**: https://jwt.io

## 🎯 Next Steps

1. ✅ Complete setup following this guide
2. ✅ Run seeding to populate test data
3. ✅ Test all user roles
4. ✅ Read API_DOCUMENTATION.md for endpoint details
5. ✅ Explore codebase structure
6. ✅ Start developing new features

---

**Last Updated**: March 2026

Need help? Check the main README.md or API_DOCUMENTATION.md for more details.
