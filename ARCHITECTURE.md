# Architecture Documentation - ReportIt

Comprehensive guide to the system architecture, design patterns, and how components interact.

## 🏗️ System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer (React)                    │
│         (Login, Dashboard, Complaint Management, etc)        │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST API
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Express.js)                       │
│  Routes → Controllers → Services → Models → Database        │
└─────────────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer (MongoDB)                       │
│              Users, Complaints, Stations, etc               │
└─────────────────────────────────────────────────────────────┘
```

## 📱 Frontend Architecture

### Component Hierarchy

```
App
├── AuthProvider (Context)
├── Router
│   ├── Public Routes
│   │   ├── Login
│   │   ├── Register
│   │   ├── ForgotPassword
│   │   └── ResetPassword
│   │
│   ├── Protected Routes (User)
│   │   ├── SubmitComplaint
│   │   ├── ComplaintHistory
│   │   └── ComplaintDetails
│   │
│   ├── Protected Routes (Police)
│   │   ├── DashboardPolice
│   │   └── ComplaintDetails
│   │
│   └── Protected Routes (Admin)
│       ├── DashboardAdmin
│       ├── AdminComplaints
│       ├── AdminStations
│       ├── AdminPolice
│       └── AdminUsers
│
├── Navbar (Navigation)
└── MainContent (Page Components)
```

### State Management

**Context API Structure:**
```
AuthContext
├── user (current authenticated user)
├── token (JWT token)
├── login() (authenticate user)
├── logout() (clear authentication)
├── register() (create new user)
└── updateUser() (update user data)
```

### Component Patterns

**Form Components:**
```javascript
// SubmitComplaint.jsx - Form with validation
const SubmitComplaint = () => {
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    address: '',
    phoneNumber: '',
    location: { lat, lng }
  });
  
  const handleSubmit = async (data) => {
    // Validate data
    // Send to API
    // Handle response
  };
};
```

**Dashboard Components:**
```javascript
// DashboardAdmin.jsx - Display analytics
const DashboardAdmin = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
};
```

**Protected Components:**
```javascript
// ProtectedRoute.jsx - Role-based access
const ProtectedRoute = ({ children, roles }) => {
  const { user, token } = useContext(AuthContext);
  
  if (!token) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};
```

## 🧠 Backend Architecture

### Layered Architecture

```
Routes Layer
    ↓
Controllers Layer
    ↓
Service Layer (if needed)
    ↓
Models/Schema Layer
    ↓
Database (MongoDB)
```

### Request Flow

```javascript
// 1. Request comes through route
POST /api/complaints

// 2. Route passes to controller
complaintController.createComplaint()

// 3. Controller validates and processes
const complaint = new Complaint(req.body);
await complaint.save();

// 4. Response sent back
res.json({ success: true, complaint });
```

### Authentication Flow

```
User Login
    ↓
Validate Credentials (bcrypt compare)
    ↓
Generate JWT Token (sign with secret)
    ↓
Return Token + User Data
    ↓
Client Stores Token (localStorage)
    ↓
Send Token in Headers for Protected Routes
    ↓
Middleware Verifies Token
    ↓
Allow/Deny Access
```

### File Structure by Feature

#### Authentication
```
routes/authRoutes.js        → Define auth endpoints
  ↓
controllers/authController.js → Handle registration, login, password reset
  ↓
models/User.js              → Define user schema and methods
  ↓
utils/email.js              → Send password reset emails
```

#### Complaint Management
```
routes/complaintRoutes.js          → Define complaint endpoints
  ↓
controllers/complaintController.js → Handle CRUD operations
  ↓
models/Complaint.js                → Define complaint schema
  ↓
middlewares/uploadMiddleware.js    → Handle file uploads
```

#### Police Operations
```
routes/policeRoutes.js         → Define police endpoints
  ↓
controllers/policeController.js → Handle police-specific operations
  ↓
models/User.js, Complaint.js  → Reference models
```

#### Admin Functions
```
routes/adminRoutes.js         → Define admin endpoints
  ↓
controllers/adminController.js → Handle admin operations
  ↓
models/User.js, PoliceStation.js, Complaint.js → Reference models
```

## 💾 Data Models

### User Schema Relationships

```
User (police) ← → PoliceStation
User (user)   ← → Complaint
User (police) ← Assignment → Complaint
```

### Complaint Status Workflow

```
Created (Sent)
    ↓
Acknowledged (Viewed)
    ↓
Investigation (In Progress)
    ↓
Resolution (Action Taken) OR Cancellation (Cancelled)
```

### Data Model Relationships

```
User
├── role: enum (user, police, station_head, admin)
├── policeStationId: ref → PoliceStation
└── complaints: [ref → Complaint]

Complaint
├── userId: ref → User (complainant)
├── policeStationId: ref → PoliceStation
├── assignedPoliceMemberId: ref → User (assigned officer)
├── type: enum (Harassment, Theft, Accident, Online Fraud, Office Harassment)
├── status: enum (Sent, Viewed, In Progress, Action Taken, Cancelled)
├── evidence: [file paths]
└── proofOfAction: [file paths]

PoliceStation
├── stationName: string
├── address: string
├── policeHeadId: ref → User (station head)
├── officers: [ref → User]
└── complaints: [ref → Complaint assigned to station]
```

## 🔐 Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────┐
│  User submits login credentials     │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ Validate email & password           │
│ (bcrypt.compare)                    │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ Generate JWT token                  │
│ (sign with secret + expiration)     │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ Return token to client              │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ Client stores token locally         │
│ (localStorage)                      │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ Client sends token in Auth header   │
│ for protected routes                │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ authMiddleware verifies token       │
│ (jwt.verify)                        │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ Role-based access control:          │
│ Route handler checks user.role      │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ Route handler executes              │
│ or access denied (403)              │
└─────────────────────────────────────┘
```

### Middleware Stack

```
Express App
    ↓
cors()              - Enable cross-origin requests
    ↓
express.json()      - Parse JSON bodies
    ↓
authMiddleware      - Verify JWT token (protected routes)
    ↓
uploadMiddleware    - Handle file uploads
    ↓
Route Handlers
```

## 🔄 API Request/Response Cycle

### Successful Request

```javascript
// Frontend
POST /api/complaints
Headers: { Authorization: "Bearer <token>" }
Body: { type, description, address, ... }

// Backend
1. Route receives request
2. authMiddleware verifies token
3. Controller validates input
4. Controller processes request
5. Controller saves to database
6. Controller returns response

Response (201 Created):
{
  success: true,
  complaint: { _id, type, status, createdAt, ... }
}

// Frontend
1. API interceptor receives response
2. Check success flag
3. Update state/UI
4. Show success message
```

### Failed Request

```javascript
// Frontend - Missing authentication
GET /api/complaints
Headers: { } // No auth header

// Backend
1. Route receives request
2. authMiddleware checks for token
3. No token found → throw error
4. Error handler catches
5. Return 401 response

Response (401 Unauthorized):
{
  success: false,
  message: "No authorization token provided"
}

// Frontend
1. API interceptor receives error
2. Check error code (401)
3. Redirect to login
4. Clear local storage
```

## 🗂️ File Organization by Responsibility

### Backend Organization

```
Controllers/
├── authController.js
│   ├── register()
│   ├── login()
│   ├── forgotPassword()
│   └── resetPassword()
├── complaintController.js
│   ├── createComplaint()
│   ├── getComplaints()
│   ├── updateComplaint()
│   ├── deleteComplaint()
│   └── updateStatus()
├── policeController.js
│   ├── getDashboard()
│   ├── getAssignedComplaints()
│   └── updateComplaint()
└── adminController.js
    ├── getDashboard()
    ├── getUsers()
    ├── getComplaints()
    ├── getStations()
    └── manageUsers()

Models/
├── User.js
│   ├── Schema
│   ├── Pre-save middleware (password hashing)
│   └── Methods (matchPassword, etc)
├── Complaint.js
│   ├── Schema
│   └── Indexes
└── PoliceStation.js
    └── Schema

Routes/
├── authRoutes.js
│   ├── POST /register
│   ├── POST /login
│   ├── POST /forgot-password
│   └── POST /reset-password/:token
├── complaintRoutes.js
│   ├── POST /
│   ├── GET /
│   ├── GET /:id
│   ├── PUT /:id
│   ├── DELETE /:id
│   └── POST /:id/update-status
├── policeRoutes.js
│   ├── GET /dashboard
│   ├── GET /assigned-complaints
│   └── PUT /complaint/:id
└── adminRoutes.js
    ├── GET /dashboard
    ├── GET /users
    ├── PUT /users/:id/block
    └── CRUD /stations, /police

Middlewares/
├── authMiddleware.js
│   └── verifyToken() - JWT validation
└── uploadMiddleware.js
    └── upload() - File upload handling

Utils/
├── email.js
│   └── sendEmail() - Email sending
└── haversine.js
    └── calculateDistance() - Geo calculations
```

### Frontend Organization

```
Pages/
├── Authentication
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── ForgotPassword.jsx
│   └── ResetPassword.jsx
├── User
│   ├── SubmitComplaint.jsx
│   ├── ComplaintHistory.jsx
│   └── ComplaintDetails.jsx
├── Police
│   ├── DashboardPolice.jsx
│   └── ComplaintDetails.jsx
└── Admin
    ├── DashboardAdmin.jsx
    ├── AdminComplaints.jsx
    ├── AdminStations.jsx
    ├── AdminPolice.jsx
    └── AdminUsers.jsx

Components/
├── Navbar.jsx           - Navigation
├── ProtectedRoute.jsx   - Route protection
└── MapSelector.jsx      - Location selection

Context/
└── AuthContext.jsx      - Authentication state

Services/
└── api.js               - API calls + interceptors
```

## 🔌 Integration Points

### Frontend-Backend Integration

```
Frontend (React)
    ↓
axios/fetch to REST API
    ↓
Backend (Express)
    ↓
Database operations
    ↓
Response to Frontend
    ↓
Update UI state
```

### Email Integration

```
User requests password reset
    ↓
Backend generates token
    ↓
Nodemailer sends email
    ↓
User clicks email link
    ↓
Frontend validates token
    ↓
User resets password
```

### File Upload Integration

```
User selects file
    ↓
Multer middleware processes
    ↓
File saved to /uploads
    ↓
Path stored in database
    ↓
File accessible via /api/uploads/:filename
```

### Geolocation Integration

```
Google Maps API / Leaflet
    ↓
User selects location
    ↓
Get coordinates (lat, lng)
    ↓
Calculate distance to stations
    ↓
Suggest nearest station
    ↓
Save location with complaint
```

## 📊 Scalability Considerations

### Horizontal Scaling

```
Load Balancer (Nginx)
    ├─ Server 1 (Backend)
    ├─ Server 2 (Backend)
    └─ Server 3 (Backend)
         ↓
    MongoDB Replica Set
    ├─ Primary
    ├─ Secondary 1
    └─ Secondary 2
```

### Database Optimization

- **Indexes**: Created on frequently queried fields
- **Pagination**: Limit results per page
- **Caching**: Redis for session management
- **Connection Pooling**: Mongoose connection pool

### API Optimization

- **Compression**: gzip compression of responses
- **Caching**: Cache headers for static content
- **Code Splitting**: Frontend lazy loading
- **Rate Limiting**: Prevent abuse

## 🧪 Testing Architecture

### Backend Testing

```
Unit Tests
├── Controllers
├── Models
└── Utils

Integration Tests
├── API Endpoints
├── Database operations
└── Authentication flow

E2E Tests
├── User workflows
├── Admin workflows
└── Error scenarios
```

### Frontend Testing

```
Component Tests
├── Form rendering
├── User interactions
└── Conditional rendering

Integration Tests
├── API integration
├── State management
└── Routing

E2E Tests
├── Complete workflows
├── Cross-browser
└── Accessibility
```

## 🔄 Deployment Architecture

### Production Environment

```
CDN / CloudFront
    ↓
Web Server (Nginx)
    ↓
Application Server (Node.js)
    ↓
Database Server (MongoDB)
```

### CI/CD Pipeline

```
Git Push
    ↓
GitHub Actions
    ├─ Run tests
    ├─ Build artifacts
    └─ Deploy to production
```

## 📈 Monitoring & Observability

### Monitoring Stack

```
Application
    ↓
Logging (Winston)
    ↓
Error Tracking (Sentry)
    ↓
Performance Monitoring (New Relic)
    ↓
Analytics Dashboard
```

---

**Last Updated**: March 2026
