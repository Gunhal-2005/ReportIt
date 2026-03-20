# ReportIt - Police Complaint Management System

A full-stack web application for managing and tracking police complaints with role-based access control, real-time tracking, and administrative oversight.

## 🎯 Project Overview

ReportIt is a comprehensive complaint management system that streamlines the process of filing, tracking, and resolving police complaints. The system provides different dashboards and features based on user roles, enabling efficient complaint management from submission to resolution.

## ✨ Key Features

### User Features
- **User Registration & Authentication**: Secure sign-up and login with JWT-based authentication
- **Submit Complaints**: File complaints with detailed descriptions, location, and evidence
- **Complaint Tracking**: Real-time status tracking of submitted complaints
- **Complaint History**: View all past complaints with detailed information
- **Password Recovery**: Secure password reset functionality
- **Location Selection**: Interactive map for specifying complaint location

### Police Officer Features
- **Dashboard**: Overview of assigned complaints
- **Complaint Management**: View and manage assigned complaints
- **Status Updates**: Update complaint status (Viewed, In Progress, Action Taken, Cancelled)
- **Evidence Tracking**: Upload proof of action for complaints
- **Remarks**: Add detailed remarks and notes to complaints

### Station Head Features
- **Station Management**: Oversee all complaints at their police station
- **Officer Assignment**: Assign complaints to police officers
- **Performance Monitoring**: Track complaint resolution statistics
- **Bulk Operations**: Manage multiple complaints efficiently

### Admin Features
- **Complete Dashboard**: System-wide statistics and analytics
- **Station Management**: Create and manage police stations
- **Police Officer Management**: Add, edit, and manage police personnel
- **User Management**: Control user accounts and permissions
- **Complaint Oversight**: Review all complaints in the system
- **Analytics**: Real-time charts and statistics on complaint data

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: Bcrypt
- **File Upload**: Multer
- **Email Service**: Nodemailer
- **Environment Management**: Dotenv
- **CORS**: Enabled for cross-origin requests

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Maps**: Leaflet & React-Leaflet
- **Charts**: Chart.js & React-ChartJS-2
- **UI Icons**: Lucide React
- **Authentication**: JWT Decode

## 📁 Project Structure

```
ReportIt/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection configuration
│   ├── controllers/
│   │   ├── adminController.js       # Admin operations
│   │   ├── authController.js        # Authentication logic
│   │   ├── complaintController.js   # Complaint management
│   │   └── policeController.js      # Police operations
│   ├── middlewares/
│   │   ├── authMiddleware.js        # JWT verification
│   │   └── uploadMiddleware.js      # File upload handling
│   ├── models/
│   │   ├── Complaint.js             # Complaint schema
│   │   ├── PoliceStation.js         # Police station schema
│   │   └── User.js                  # User schema
│   ├── routes/
│   │   ├── adminRoutes.js           # Admin endpoints
│   │   ├── authRoutes.js            # Auth endpoints
│   │   ├── complaintRoutes.js       # Complaint endpoints
│   │   └── policeRoutes.js          # Police endpoints
│   ├── utils/
│   │   ├── email.js                 # Email sending utilities
│   │   └── haversine.js             # Geolocation distance calculation
│   ├── uploads/                     # Directory for uploaded files
│   ├── .env                         # Environment variables (not in repo)
│   ├── package.json
│   ├── seed.js                      # Database seeding script
│   └── server.js                    # Express server entry point
│
└── frontend/
    ├── public/                      # Static assets
    ├── src/
    │   ├── assets/                  # Images and media
    │   ├── components/
    │   │   ├── MapSelector.jsx      # Interactive map component
    │   │   ├── Navbar.jsx           # Navigation bar
    │   │   └── ProtectedRoute.jsx   # Role-based route protection
    │   ├── context/
    │   │   └── AuthContext.jsx      # Authentication state management
    │   ├── pages/
    │   │   ├── AdminComplaints.jsx  # Admin complaint management
    │   │   ├── AdminPolice.jsx      # Admin police management
    │   │   ├── AdminStations.jsx    # Admin station management
    │   │   ├── AdminUsers.jsx       # Admin user management
    │   │   ├── ComplaintDetails.jsx # Complaint detail view
    │   │   ├── ComplaintHistory.jsx # User complaint history
    │   │   ├── DashboardAdmin.jsx   # Admin dashboard
    │   │   ├── DashboardPolice.jsx  # Police dashboard
    │   │   ├── ForgotPassword.jsx   # Password recovery
    │   │   ├── Login.jsx            # Login page
    │   │   ├── Register.jsx         # Registration page
    │   │   ├── ResetPassword.jsx    # Password reset
    │   │   └── SubmitComplaint.jsx  # Complaint submission
    │   ├── services/
    │   │   └── api.js               # API service configuration
    │   ├── App.jsx                  # Main app component
    │   ├── App.css                  # Main styles
    │   ├── index.css                # Global styles
    │   └── main.jsx                 # React DOM entry point
    ├── package.json
    ├── vite.config.js
    ├── eslint.config.js
    └── index.html
```

## 📊 Database Models

### User Model
```
- name: String (required)
- email: String (unique, required)
- password: String (hashed, required)
- role: Enum ['user', 'police', 'station_head', 'admin']
- isBlocked: Boolean (default: false)
- policeStationId: ObjectId (reference to PoliceStation)
- resetPasswordToken: String
- resetPasswordExpire: Date
```

### Complaint Model
```
- userId: ObjectId (reference to User, required)
- policeStationId: ObjectId (reference to PoliceStation)
- type: Enum ['Harassment', 'Theft', 'Accident', 'Online Fraud', 'Office Harassment']
- description: String (required)
- address: String
- phoneNumber: String
- evidence: [String] (array of file paths)
- status: Enum ['Sent', 'Viewed', 'In Progress', 'Action Taken', 'Cancelled']
- cancelRequested: Boolean (default: false)
- remarks: String
- assignedPoliceMemberId: ObjectId (reference to User)
- proofOfAction: [String] (array of file paths)
- timestamps: CreatedAt, UpdatedAt
```

### Police Station Model
```
- stationName: String (required)
- address: String (required)
- contactNumber: String
- email: String
- latitude: Number
- longitude: Number
- policeHeadId: ObjectId (reference to User)
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- Git

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/reportit
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=7d
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   EMAIL_FROM=noreply@reportit.com
   FRONTEND_URL=http://localhost:5173
   ```

4. **Seed the database** (optional)
   ```bash
   npm run seed
   ```

5. **Start the server**
   ```bash
   npm run dev           # Development mode with nodemon
   npm start             # Production mode
   ```

   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** (if needed for API configuration)
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:5173`

5. **Build for production**
   ```bash
   npm run build
   ```

## 🔐 User Roles & Access Control

### Role Hierarchy

| Role | Features | Access Level |
|------|----------|--------------|
| **User** | Submit complaints, track status, view history | Limited |
| **Police Officer** | View assigned complaints, update status, add remarks | Medium |
| **Station Head** | Manage station complaints, assign officers, analytics | High |
| **Admin** | Full system control, manage stations, users, complaints | Complete |

### Route Protection
Routes are protected using the `ProtectedRoute` component which validates:
- User authentication status
- User role permissions
- Token validity

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /forgot-password` - Request password reset
- `POST /reset-password/:token` - Reset password with token
- `POST /logout` - User logout

### Complaint Routes (`/api/complaints`)
- `POST /` - Create new complaint
- `GET /` - Get user's complaints
- `GET /:id` - Get complaint details
- `PUT /:id` - Update complaint
- `DELETE /:id` - Delete complaint
- `POST /:id/cancel` - Request complaint cancellation
- `POST /:id/update-status` - Update complaint status

### Police Routes (`/api/police`)
- `GET /dashboard` - Get police dashboard data
- `GET /assigned-complaints` - Get assigned complaints
- `PUT /complaint/:id` - Update assigned complaint
- `POST /complaint/:id/proof` - Upload proof of action

### Admin Routes (`/api/admin`)
- `GET /dashboard` - Admin dashboard statistics
- `GET /complaints` - All complaints
- `GET /users` - All users
- `GET /stations` - All police stations
- `POST /stations` - Create new station
- `PUT /stations/:id` - Update station
- `DELETE /stations/:id` - Delete station
- `POST /police` - Add police officer
- `PUT /users/:id/block` - Block/unblock user

## 📝 Environment Variables

### Backend (.env)
```
PORT                    # Server port (default: 5000)
MONGODB_URI             # MongoDB connection string
JWT_SECRET              # Secret key for JWT
JWT_EXPIRE              # JWT expiration time
EMAIL_SERVICE           # Email service provider
EMAIL_USER              # Email account username
EMAIL_PASSWORD          # Email account password
EMAIL_FROM              # From email address
FRONTEND_URL            # Frontend URL for redirects
```

### Frontend (.env)
```
VITE_API_URL            # Backend API URL
```

## 🧪 Available Scripts

### Backend
```bash
npm start               # Run production server
npm run dev             # Run development server with nodemon
npm run seed            # Seed database with sample data
```

### Frontend
```bash
npm run dev             # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
```

## 🎨 Features Explained

### Complaint Submission (User)
1. Navigate to "Submit Complaint"
2. Select complaint type from predefined categories
3. Describe the incident in detail
4. Select location using interactive map
5. Upload evidence files
6. Submit complaint
7. Receive confirmation and tracking ID

### Complaint Tracking (Police/Admin)
1. View complaints in dashboard
2. Update status through workflow
3. Assign to police officers
4. Add remarks and investigation notes
5. Upload proof of action
6. Mark as resolved

### Administrative Management
1. **Stations**: Create, edit, delete police stations
2. **Police**: Add officers, assign to stations, deactivate
3. **Users**: View all users, block/unblock accounts
4. **Analytics**: View system-wide complaint statistics

## 🗺️ Geolocation Features

The application uses Leaflet and Haversine distance calculation for:
- Interactive map selection for complaint location
- Finding nearest police stations
- Distance-based assignment suggestions

## 📈 Analytics

The admin dashboard includes:
- Total complaints filed
- Complaints by status
- Complaints by type
- Resolution time statistics
- User activity metrics
- Station performance data

## 🔒 Security Features

- **Password Hashing**: Bcrypt for secure password storage
- **JWT Authentication**: Token-based request authorization
- **Role-Based Access Control (RBAC)**: Endpoint protection based on user roles
- **CORS**: Cross-origin resource sharing configured
- **Email Verification**: Secure password reset via email tokens
- **Input Validation**: Server-side validation for all inputs
- **Protected Routes**: Frontend route protection with role checking

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify network connectivity

### Authentication Errors
- Clear browser localStorage
- Check JWT_SECRET configuration
- Verify token expiration settings

### File Upload Issues
- Ensure uploads directory exists
- Check multer configuration
- Verify file size limits

### CORS Errors
- Check FRONTEND_URL in backend .env
- Ensure CORS middleware is properly configured
- Verify API endpoint access

## 📝 Development Workflow

1. **Feature Branch**: Create feature branch from main
2. **Development**: Make changes with npm run dev
3. **Testing**: Test all user roles and scenarios
4. **Commit**: Commit changes with descriptive messages
5. **Pull Request**: Submit PR for review
6. **Merge**: Merge to main after approval

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add an amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Support & Contact

For issues, questions, or suggestions:
- Open an issue in the repository
- Contact the development team
- Email: support@reportit.com

## 🔄 Version History

**v1.0.0** - Initial Release
- User registration and authentication
- Complaint submission and tracking
- Police dashboard
- Admin panel with full system management
- Geolocation features
- Analytics dashboard

---

**Last Updated**: March 2026
