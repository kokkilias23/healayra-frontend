# Healayra Frontend

**Trust the Process.**

Healayra is a healthcare and therapy appointment management platform developed as the final project for the Coding Factory program.

This repository contains the **React + TypeScript frontend** of the application.

The backend is maintained in a separate repository:

`healayra-backend`

---

## Overview

The frontend provides two different user experiences:

### Client

Clients can:

- Register a new account
- Log in
- View doctor availability
- Select an available date
- Select an available time slot
- Book appointments
- View their appointments
- See whether an appointment is pending or confirmed

### Doctor

Doctors can:

- Log in
- View their dashboard
- View new appointment requests
- Confirm appointments
- Manage weekly availability
- View clients
- Search clients
- Open client profiles
- View previous visits
- Create new visits
- Add notes to visits

---

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- React Datepicker
- Fetch API
- CSS
- Oxlint

---

## Project Structure

The main frontend structure is:

```text
src/
├── api/
├── components/
├── pages/
├── services/
├── styles/
└── types/
```

### api

Contains the shared API request functionality.

Example:

```text
Api.ts
```

It is responsible for:

- Sending HTTP requests
- Adding the JWT token to protected requests
- Handling backend errors
- Reading the backend base URL

---

### components

Contains reusable React components.

Examples include:

```text
ProtectedRoute
```

`ProtectedRoute` is responsible for protecting pages based on authentication and user role.

---

### pages

Contains the main application pages.

Examples:

```text
Home
Login
Register
Booking
MyAppointments
DoctorDashboard
Clients
ClientDetails
Availability
```

---

### services

Contains functions that communicate with the backend REST API.

Examples:

```text
AuthService
DoctorService
ClientService
AppointmentService
AvailabilityService
VisitService
NoteService
```

This keeps API communication separate from the React UI components.

---

### types

Contains TypeScript types and interfaces.

Examples:

```text
Auth
Doctor
Client
Appointment
Availability
Visit
Note
```

---

## Application Routes

### Public Routes

```text
/
```

Home page.

```text
/login
```

User login.

```text
/register
```

Client registration.

---

## Client Routes

The following routes are protected and require the `CLIENT` role.

```text
/booking
```

Book a new appointment.

```text
/my-appointments
```

View the client's appointments.

---

## Doctor Routes

The following routes are protected and require the `DOCTOR` role.

```text
/doctor/dashboard
```

Doctor dashboard and appointment requests.

```text
/doctor/clients
```

Client list and search.

```text
/doctor/clients/:id
```

Client details, visits and notes.

```text
/doctor/availability
```

Doctor weekly availability management.

---

## Authentication

Authentication is based on JWT tokens returned by the Spring Boot backend.

After login or registration, the frontend currently stores:

```text
token
userId
email
role
```

in `localStorage`.

The token is automatically included in protected API requests as:

```http
Authorization: Bearer <JWT_TOKEN>
```

Available roles are:

```text
DOCTOR
CLIENT
```

---

## Role-Based Routing

The frontend uses protected routes.

Example flow:

```text
User opens protected page
        ↓
ProtectedRoute checks authentication
        ↓
Checks user role
        ↓
Allowed → page loads
Not allowed → redirect
```

A client cannot directly access doctor pages.

A doctor cannot directly access client-only pages.

---

## Client Registration Flow

A new client can create an account from:

```text
/register
```

The registration form sends:

```text
firstName
lastName
email
phone
password
```

to the backend.

After successful registration:

```text
POST /api/auth/register
        ↓
Backend creates User
        ↓
Backend creates Client
        ↓
JWT returned
        ↓
Frontend stores authentication
        ↓
Redirect to /booking
```

---

## Appointment Booking

The booking page retrieves real doctor availability from the backend.

The client:

1. Selects a service
2. Selects an available date
3. Selects an available time slot
4. Confirms the booking

The appointment is then created through the backend API.

Initial appointment status:

```text
PENDING
```

In the client interface this is displayed as:

```text
Αναμένει επιβεβαίωση
```

---

## Doctor Availability

The doctor can manage weekly availability from:

```text
/doctor/availability
```

For each day the doctor can configure:

- Enabled / disabled
- Start time
- End time
- Session duration

Example:

```text
Monday
09:00 - 14:00
50 minute sessions
```

The booking page uses these settings dynamically.

If the doctor enables another day, the client booking calendar automatically allows appointments on that day.

---

## Appointment Confirmation

New bookings appear on the doctor dashboard as appointment requests.

Example workflow:

```text
CLIENT
books appointment
      ↓
PENDING
      ↓
DOCTOR
sees new request
      ↓
Doctor clicks confirmation
      ↓
CONFIRMED
      ↓
CLIENT
sees confirmed appointment
```

---

## Client Management

Doctors can view their clients from:

```text
/doctor/clients
```

The page retrieves real client data from the backend.

Client search is also connected to the backend.

Example:

```text
Search: Post
        ↓
GET /api/clients/search?query=Post
        ↓
Matching clients
```

---

## Client Details

Doctors can open a specific client profile:

```text
/doctor/clients/:id
```

The page displays:

- Client information
- Visit history
- Session information
- Notes

Doctors can create a new visit and attach notes to individual visits.

---

## API Communication

The frontend communicates with the Spring Boot REST API.

The API base URL is configured using:

```env
VITE_API_URL=http://localhost:8080
```

During local development the backend should be running at:

```text
http://localhost:8080
```

---

## Environment Configuration

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:8080
```

The API URL is not a secret.

Production secrets must never be placed in Vite environment variables because variables beginning with `VITE_` are exposed to the frontend application.

---

## Installation

Requirements:

- Node.js
- npm

Install dependencies:

```bash
npm install
```

---

## Run Development Server

Start the frontend:

```bash
npm run dev
```

The development server will normally be available at:

```text
http://localhost:5173
```

---

## Build

Create a production build:

```bash
npm run build
```

The build command performs:

```text
TypeScript compilation
        ↓
Vite production build
```

The generated production files are placed inside:

```text
dist/
```

The final project build has been tested successfully.

---

## Preview Production Build

After building:

```bash
npm run preview
```

This allows the generated production build to be tested locally.

---

## Lint

Run:

```bash
npm run lint
```

The project uses Oxlint.

---

## Backend Requirement

The frontend requires the Healayra Spring Boot backend.

For local development:

```text
Frontend
http://localhost:5173

        ↓ REST API

Backend
http://localhost:8080

        ↓

PostgreSQL
```

---

## Current MVP Flow

The main end-to-end application flow is:

```text
Client Registration
        ↓
JWT Authentication
        ↓
Doctor Availability
        ↓
Appointment Booking
        ↓
PENDING Appointment
        ↓
Doctor Dashboard
        ↓
Doctor Confirmation
        ↓
CONFIRMED Appointment
        ↓
Client sees confirmed appointment
```

The doctor can additionally use:

```text
Client Management
        ↓
Visit History
        ↓
Notes
```

---

## Current MVP Features

Implemented frontend features include:

- Home page
- Client registration
- Login
- JWT authentication integration
- Role-based protected routes
- Doctor dashboard
- Client management
- Client search
- Client details
- Visit history
- Visit creation
- Visit notes
- Doctor availability management
- Real availability-based booking
- Appointment creation
- Client appointment history
- Doctor appointment confirmation
- Responsive styling

---

## Security Notes

The MVP currently stores the JWT token in:

```text
localStorage
```

This is acceptable for the current educational MVP.

For a production healthcare environment, authentication should be hardened further, for example with:

- HttpOnly cookies
- Secure cookies
- CSRF protection where appropriate
- Stronger session controls
- Additional privacy and security measures

---

## Future Improvements

Possible future improvements include:

- Multiple doctors
- Doctor search
- Full multi-tenant support
- Custom doctor domains
- Client appointment cancellation
- Email notifications
- Appointment reminders
- Improved responsive design
- Enhanced form validation
- Better loading states
- Better error handling
- Available-slot endpoint
- Hide already booked slots before submission
- Production authentication hardening
- Accessibility improvements
- Automated frontend tests
- Cloud deployment

---

## Project Status

The current version represents the MVP developed as the final project for Coding Factory.

The frontend production build has been tested successfully using:

```bash
npm run build
```

---

## Author

Developed by **kokkilias23** as a Coding Factory final project.

## Healayra

**Trust the Process.**