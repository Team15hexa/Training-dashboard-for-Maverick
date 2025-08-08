# Maverick Forge - Dynamic Fresher Dashboard

## Overview
This project implements a dynamic fresher dashboard where each fresher sees their own personalized data when they log in with their credentials.

## Key Features

### Dynamic Fresher Dashboard
- Each fresher sees their own personalized dashboard data
- Dashboard displays individual progress, scores, and training status
- Real-time data fetching based on logged-in user's ID
- Fallback to user data if backend is unavailable

### Authentication Flow
1. Fresher logs in with email and password
2. System stores user data in localStorage
3. Dashboard fetches fresher-specific data using stored user ID
4. Displays personalized information for the logged-in fresher

## Testing the Dynamic Dashboard

### Prerequisites
1. Start the backend server: `cd backend && npm start`
2. Start the frontend: `cd Frontend && npm run dev`

### Test Credentials

#### Existing Freshers (with sample data):
1. **Nimisha Ramesh**
   - Email: `nimisharamesh21@gmail.com`
   - Password: `nimi123`
   - Department: Software Engineering
   - Scores: Quiz: 95%, Coding: 88%, Assignment: 92%, Certification: 85%

2. **John Doe**
   - Email: `john.doe@company.com`
   - Password: `john123`
   - Department: Software Engineering
   - Scores: Quiz: 85%, Coding: 92%, Assignment: 88%, Certification: 90%

3. **Jane Smith**
   - Email: `jane.smith@company.com`
   - Password: `jane123`
   - Department: Data Science
   - Scores: Quiz: 92%, Coding: 88%, Assignment: 95%, Certification: 87%

### Testing Steps

1. **Login with different freshers:**
   - Go to the login page
   - Use different fresher credentials
   - Each fresher will see their own dashboard with personalized data

2. **Add new fresher from admin dashboard:**
   - Login as admin: `admin@mavericks.com` / `admin123`
   - Go to "Manage Freshers" section
   - Add a new fresher with name, email, and department
   - System generates password automatically
   - New fresher can login with generated credentials

3. **Verify dynamic data:**
   - Each fresher sees their own:
     - Name and department
     - Individual assessment scores
     - Personal training progress
     - Custom skills and workflow status

### Database Structure

The `freshers` table contains:
- `id`: Unique identifier
- `name`: Fresher's name
- `email`: Login email
- `password`: Login password
- `department`: Department assignment
- `quizzes`, `coding`, `assignments`, `certifications`: Assessment scores
- `skills`: JSON array of skills
- `training_schedule`: JSON object with training details
- `workflow_progress`: JSON object with workflow status

### API Endpoints

- `GET /api/fresher/profile/:id` - Get fresher data by ID
- `GET /api/fresher/profile/email/:email` - Get fresher data by email
- `PUT /api/fresher/skills/:id` - Update fresher skills
- `POST /api/fresher/admin-create` - Create new fresher (admin only)

## Technical Implementation

### Frontend Changes
- Modified `FresherDashboard.tsx` to fetch user-specific data
- Added authentication check and user data retrieval from localStorage
- Implemented fallback data handling
- Dynamic calculation of overall progress and training status

### Backend Changes
- Enhanced fresher creation with default values
- Added email-based profile retrieval endpoint
- Improved error handling and data validation

## Troubleshooting

1. **Dashboard shows default data:**
   - Check if user is properly logged in
   - Verify localStorage contains currentUser data
   - Check backend server is running

2. **Login fails:**
   - Verify email and password match database
   - Check backend authentication endpoint
   - Ensure database is properly set up

3. **Data not updating:**
   - Check network requests in browser dev tools
   - Verify API endpoints are working
   - Check database connection

## Future Enhancements

- Real-time data updates
- Advanced progress tracking
- Integration with external training platforms
- Enhanced security with JWT tokens
- Role-based access control improvements 