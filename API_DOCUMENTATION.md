# API Documentation

## Overview
ReportIt REST API provides endpoints for user authentication, complaint management, police operations, and administrative functions. All endpoints return JSON responses with appropriate HTTP status codes.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Auth Endpoints

### 1. User Registration
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "role": "user"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Status Codes:**
- `201` - User created successfully
- `400` - Invalid input or user already exists
- `500` - Server error

---

### 2. User Login
**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isBlocked": false
  }
}
```

**Status Codes:**
- `200` - Login successful
- `400` - Invalid credentials or user blocked
- `404` - User not found
- `500` - Server error

---

### 3. Forgot Password
**POST** `/auth/forgot-password`

Request password reset link via email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

**Status Codes:**
- `200` - Email sent
- `400` - Invalid email
- `404` - User not found
- `500` - Server error

---

### 4. Reset Password
**POST** `/auth/reset-password/:token`

Reset password using token from email.

**Request Body:**
```json
{
  "password": "NewPassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Status Codes:**
- `200` - Password updated
- `400` - Invalid or expired token
- `500` - Server error

---

## Complaint Endpoints

### 1. Create Complaint
**POST** `/complaints`

Create a new complaint. Requires authentication.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "Harassment",
  "description": "Detailed description of the incident",
  "address": "123 Main Street, City",
  "phoneNumber": "+1234567890",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Complaint filed successfully",
  "complaint": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "type": "Harassment",
    "description": "Detailed description of the incident",
    "address": "123 Main Street, City",
    "status": "Sent",
    "createdAt": "2024-03-20T10:30:00Z"
  }
}
```

**Status Codes:**
- `201` - Complaint created
- `400` - Invalid input
- `401` - Unauthorized
- `500` - Server error

---

### 2. Get User Complaints
**GET** `/complaints`

Retrieve all complaints filed by authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)
- `status`: Filter by status (Sent, Viewed, In Progress, Action Taken, Cancelled)

**Response (200 OK):**
```json
{
  "success": true,
  "complaints": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "type": "Harassment",
      "description": "Detailed description",
      "status": "In Progress",
      "assignedPoliceMemberId": "507f1f77bcf86cd799439013",
      "createdAt": "2024-03-20T10:30:00Z"
    }
  ],
  "totalComplaints": 5,
  "currentPage": 1,
  "totalPages": 1
}
```

---

### 3. Get Complaint Details
**GET** `/complaints/:id`

Retrieve detailed information about a specific complaint.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "complaint": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "type": "Harassment",
    "description": "Detailed description",
    "address": "123 Main Street, City",
    "status": "In Progress",
    "remarks": "Investigation ongoing",
    "evidence": [
      "uploads/evidence_1.jpg",
      "uploads/evidence_2.pdf"
    ],
    "proofOfAction": [
      "uploads/proof_1.jpg"
    ],
    "assignedPoliceMemberId": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Officer Smith"
    },
    "createdAt": "2024-03-20T10:30:00Z",
    "updatedAt": "2024-03-21T14:20:00Z"
  }
}
```

---

### 4. Update Complaint
**PUT** `/complaints/:id`

Update complaint details. Only dispute owner can update, before assignment.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "description": "Updated description",
  "address": "456 Oak Avenue, City"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Complaint updated successfully",
  "complaint": { ... }
}
```

---

### 5. Delete Complaint
**DELETE** `/complaints/:id`

Delete a complaint. Only possible before assignment.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Complaint deleted successfully"
}
```

---

### 6. Request Complaint Cancellation
**POST** `/complaints/:id/cancel`

Request to cancel an assigned complaint.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Reason for cancellation"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cancellation requested successfully"
}
```

---

### 7. Update Complaint Status
**POST** `/complaints/:id/update-status`

Update complaint status. Requires police or admin role.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "In Progress",
  "remarks": "Investigation in progress"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Status updated successfully",
  "complaint": { ... }
}
```

---

## Police Endpoints

### 1. Get Police Dashboard
**GET** `/police/dashboard`

Get police officer dashboard data.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalAssignedComplaints": 15,
    "viewedComplaints": 10,
    "inProgressComplaints": 3,
    "resolvedComplaints": 2,
    "pendingComplaints": 5,
    "avgResolutionTime": "3.5 days"
  }
}
```

---

### 2. Get Assigned Complaints
**GET** `/police/assigned-complaints`

Get all complaints assigned to police officer.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: Filter by status
- `page`: Page number
- `limit`: Results per page

**Response (200 OK):**
```json
{
  "success": true,
  "complaints": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "type": "Theft",
      "description": "Description",
      "status": "In Progress",
      "userId": { "name": "John Doe" },
      "createdAt": "2024-03-20T10:30:00Z"
    }
  ],
  "totalComplaints": 15
}
```

---

### 3. Update Complaint (Police)
**PUT** `/police/complaint/:id`

Update complaint details and status as police officer.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "Action Taken",
  "remarks": "Case resolved with follow-up action"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Complaint updated successfully",
  "complaint": { ... }
}
```

---

### 4. Upload Proof of Action
**POST** `/police/complaint/:id/proof`

Upload proof images or documents for complaint.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `proofFiles`: Multiple file upload

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Proof uploaded successfully",
  "proofPaths": [
    "uploads/proof_507f1f77bcf86cd799439012_1.jpg"
  ]
}
```

---

## Admin Endpoints

### 1. Get Admin Dashboard
**GET** `/admin/dashboard`

Get system-wide statistics.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalComplaints": 250,
    "totalUsers": 500,
    "totalStations": 15,
    "totalPolice": 200,
    "complaintsByStatus": {
      "Sent": 50,
      "Viewed": 75,
      "In Progress": 80,
      "Action Taken": 40,
      "Cancelled": 5
    },
    "complaintsByType": {
      "Harassment": 80,
      "Theft": 65,
      "Accident": 50,
      "Online Fraud": 30,
      "Office Harassment": 25
    }
  }
}
```

---

### 2. Get All Complaints
**GET** `/admin/complaints`

Retrieve all complaints in system with filters.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: Filter by status
- `type`: Filter by type
- `startDate`: Filter by date range (YYYY-MM-DD)
- `endDate`: Filter by date range (YYYY-MM-DD)
- `page`: Page number
- `limit`: Results per page
- `sortBy`: Sort field (createdAt, status, type)

**Response (200 OK):**
```json
{
  "success": true,
  "complaints": [ ... ],
  "totalComplaints": 250,
  "currentPage": 1,
  "totalPages": 25
}
```

---

### 3. Get All Users
**GET** `/admin/users`

Retrieve all system users.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `role`: Filter by role
- `isBlocked`: Filter by blocked status
- `page`: Page number
- `limit`: Results per page

**Response (200 OK):**
```json
{
  "success": true,
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isBlocked": false,
      "createdAt": "2024-03-01T10:30:00Z"
    }
  ],
  "totalUsers": 500
}
```

---

### 4. Block/Unblock User
**PUT** `/admin/users/:id/block`

Block or unblock a user account.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "isBlocked": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User blocked successfully",
  "user": { ... }
}
```

---

### 5. Get All Police Stations
**GET** `/admin/stations`

Retrieve all police stations.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "stations": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "stationName": "Central Police Station",
      "address": "123 Police Ave",
      "contactNumber": "555-1234",
      "email": "central@police.gov",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "policeHeadId": { "name": "Officer Smith" }
    }
  ]
}
```

---

### 6. Create Police Station
**POST** `/admin/stations`

Create a new police station.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "stationName": "North Police Station",
  "address": "456 North Ave",
  "contactNumber": "555-5678",
  "email": "north@police.gov",
  "latitude": 40.8128,
  "longitude": -74.1060,
  "policeHeadId": "507f1f77bcf86cd799439021"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Station created successfully",
  "station": { ... }
}
```

---

### 7. Update Police Station
**PUT** `/admin/stations/:id`

Update police station information.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "stationName": "North Police Station Updated",
  "contactNumber": "555-9999"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Station updated successfully",
  "station": { ... }
}
```

---

### 8. Delete Police Station
**DELETE** `/admin/stations/:id`

Delete a police station.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Station deleted successfully"
}
```

---

### 9. Add Police Officer
**POST** `/admin/police`

Add a new police officer to the system.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Officer Johnson",
  "email": "johnson@police.gov",
  "password": "SecurePassword123",
  "policeStationId": "507f1f77bcf86cd799439020",
  "role": "police"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Police officer added successfully",
  "officer": { ... }
}
```

---

### 10. Get All Police Officers
**GET** `/admin/police`

Retrieve all police officers by station.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `stationId`: Filter by station
- `page`: Page number
- `limit`: Results per page

**Response (200 OK):**
```json
{
  "success": true,
  "officers": [
    {
      "_id": "507f1f77bcf86cd799439021",
      "name": "Officer Johnson",
      "email": "johnson@police.gov",
      "role": "police",
      "policeStationId": {
        "stationName": "Central Police Station"
      }
    }
  ],
  "totalOfficers": 50
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Error details (in development only)"
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Server Error - Internal error |

---

## Authentication Flow

1. User registers or logs in
2. Receives JWT token
3. Includes token in Authorization header for subsequent requests
4. Token validated on server for each protected request
5. Token expires after configured duration
6. User must login again to get new token

---

## Rate Limiting

Currently no rate limiting implemented. Consider adding for production:
- 100 requests per 15 minutes per IP for public endpoints
- 1000 requests per 15 minutes per user for authenticated endpoints

---

## Pagination

Paginated endpoints support:
- `page`: Current page (1-indexed)
- `limit`: Results per page

Example: `/api/complaints?page=2&limit=20`

---

## Sorting

Supported sort parameters vary by endpoint. Use:
- `sortBy`: Field name
- `sortOrder`: 'asc' or 'desc'

Example: `/api/complaints?sortBy=createdAt&sortOrder=desc`

---

**Last Updated:** March 2026
