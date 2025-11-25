# MiopiaScan - Environment Setup Guide

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern browser (Chrome, Safari, Firefox, Edge)

### 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Authentication
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
\`\`\`

### 2. Installation

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
\`\`\`

### 3. Demo Credentials

Use these credentials to test the application:

**Email:** admin@hospital.com
**Password:** demo123456

### 4. Frontend Routes

#### Public Routes
- `/` - Landing page / home
- `/auth/login` - Login page
- `/auth/signup` - Registration page

#### Protected Routes (Require Authentication)
- `/dashboard` - Main dashboard with statistics
- `/dashboard/patients` - Patient management (CRUD operations)
- `/dashboard/examination` - Patient examination records
- `/dashboard/predictions` - Myopia detection & AI predictions
- `/dashboard/reports` - Analytics and reports dashboard

### 5. API Integration

The frontend is configured to integrate with your Node.js backend via REST API. Key endpoints expected:

\`\`\`typescript
// Authentication
POST /api/auth/login
POST /api/auth/signup
GET /api/auth/me
POST /api/auth/logout

// Patients
GET /api/patients
POST /api/patients
PUT /api/patients/:id
DELETE /api/patients/:id
GET /api/patients/:id

// Examinations
GET /api/examinations
POST /api/examinations
PUT /api/examinations/:id
DELETE /api/examinations/:id
GET /api/examinations/:id

// Predictions
POST /api/examinations/:examinationId/predict
GET /api/predictions
GET /api/predictions?patientId=:patientId
\`\`\`

### 6. Features Overview

#### Patient Management
- Register new patients with comprehensive information
- Store: name, DOB, gender, address, phone, email, medical history
- CRUD operations (Create, Read, Update, Delete)
- Search and filter by name, phone, email

#### Examination Module
- Record eye examination data
- Store vision metrics, intraocular pressure
- Upload and analyze eye images
- Associate examinations with patients

#### AI Myopia Detection
- Analyze uploaded eye images
- Predict myopia risk levels (Low, Medium, High)
- Calculate spherical equivalent
- Generate clinical recommendations
- Confidence scoring for predictions

#### Reporting & Analytics
- Dashboard with key statistics
- Myopia distribution by severity
- Age group analysis
- Detection rate trends
- Recent examinations overview
- Export capabilities

#### Authentication
- Secure login/signup
- JWT token-based authentication
- Role-based access control (doctor, admin, staff)
- Session management
- Protected routes

### 7. Styling & Theme

The application uses:
- **Tailwind CSS v4** for utilities
- **shadcn/ui** components for UI elements
- **Custom theme** with medical-focused color scheme:
  - Primary: Teal (medical trust)
  - Secondary: Navy (professionalism)
  - Accent: Orange (attention)
  - Background: White/Off-white

### 8. TypeScript Configuration

All code is strictly typed with TypeScript. Key types are defined in `/lib/types.ts`:
- User, Patient, Appointment
- Examination, MyopiaPrediction
- ApiResponse wrapper

### 9. State Management

- **React Context API** for global state (Auth, Patients)
- Client-side caching with context providers
- Services layer for API calls in `/lib/`

### 10. Deployment

To deploy to Vercel:

\`\`\`bash
# Push code to GitHub
git push origin main

# Connect to Vercel and deploy
# Set environment variables in Vercel dashboard
# Automatic deployments on push
\`\`\`

### 11. Troubleshooting

**Common Issues:**

1. **API Connection Error**: Ensure backend is running and `NEXT_PUBLIC_API_URL` is correct
2. **Auth Token Not Persisting**: Check localStorage is enabled
3. **Styles Not Loading**: Clear `.next` folder and rebuild: `npm run dev`
4. **TypeScript Errors**: Run `npm run type-check` to validate types

### 12. Development Tips

- Use `console.log("[v0] ...")` for debugging
- All context hooks throw errors if used outside providers - check Providers wrapper
- Mock data is included in dashboard for demonstration
- Patient search is case-insensitive across multiple fields

---

For API backend setup, ensure your Node.js server implements the endpoints listed in section 5.
