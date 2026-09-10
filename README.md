# Healayra Frontend

> **Trust the Process.**

Healayra is a healthcare and therapy appointment management platform developed as a final project for the **Coding Factory** program.

This repository contains the **React + TypeScript frontend** of the Healayra application.

The application provides separate experiences for healthcare professionals and their clients, including appointment booking, availability management, client management, visit history and session notes.

The backend is implemented separately with **Java, Spring Boot and PostgreSQL**.

---

## Table of Contents

- [Overview](#overview)
- [Main Features](#main-features)
- [User Roles](#user-roles)
- [Tech Stack](#tech-stack)
- [Frontend Architecture](#frontend-architecture)
- [Project Structure](#project-structure)
- [Application Routes](#application-routes)
- [Authentication and Authorization](#authentication-and-authorization)
- [API Communication](#api-communication)
- [Appointment Booking Flow](#appointment-booking-flow)
- [Doctor Availability](#doctor-availability)
- [Appointment Management](#appointment-management)
- [Client Management](#client-management)
- [Visit History and Notes](#visit-history-and-notes)
- [Environment Configuration](#environment-configuration)
- [Installation](#installation)
- [Development](#development)
- [Build](#build)
- [Lint](#lint)
- [Security Notes](#security-notes)
- [Current MVP Status](#current-mvp-status)
- [Future Improvements](#future-improvements)
- [Author](#author)

---

## Overview

Healayra connects healthcare professionals with their clients through a simple appointment and therapy-management workflow.

The frontend communicates with the Healayra Spring Boot REST API and provides role-based interfaces for:

- Clients
- Doctors / healthcare professionals

The application currently focuses on the core MVP workflow:

```text
Client Registration
        ↓
Authentication
        ↓
Doctor Availability
        ↓
Appointment Booking
        ↓
PENDING Appointment
        ↓
Doctor Dashboard
        ↓
Appointment Confirmation
        ↓
CONFIRMED Appointment
```

Healthcare professionals can additionally manage:

```text
Clients
   ↓
Client Profile
   ↓
Visit History
   ↓
Session Notes
```

---

## Main Features

### Client Features

Clients can:

- Create an account
- Log in
- View doctor availability
- Select an appointment service
- Select an available date
- Select an available time slot
- Book an appointment
- View upcoming appointments
- View appointment history
- View appointment status

### Doctor Features

Doctors can:

- Log in
- Access a dedicated dashboard
- View appointment requests
- Confirm appointment requests
- Manage weekly availability
- Configure session duration
- View clients
- Search clients
- Open individual client profiles
- View visit history
- Create visits
- Add notes to visits

---

## User Roles

Healayra currently supports two application roles:

```text
CLIENT
DOCTOR
```

Each role has access to a different set of protected routes and functionality.

### CLIENT

A client primarily interacts with:

```text
/booking
/my-appointments
```

### DOCTOR

A doctor primarily interacts with:

```text
/doctor/dashboard
/doctor/clients
/doctor/clients/:id
/doctor/availability
```

---

## Tech Stack

The frontend is built with:

- **React 19**
- **TypeScript 6**
- **Vite 8**
- **React Router**
- **React Datepicker**
- **Fetch API**
- **CSS**
- **Oxlint**

The project uses a modern React application structure with reusable components, typed API communication and role-based routing.

---

## Frontend Architecture

The frontend follows a simple layered structure:

```text
React Pages
     ↓
Reusable Components
     ↓
Frontend Services
     ↓
Shared API Client
     ↓
Spring Boot REST API
```

Responsibilities are separated between different parts of the application.

### Pages

Pages are responsible mainly for:

- Application state
- API orchestration
- Page-level event handlers
- Navigation
- Connecting reusable components together

### Components

Components are responsible mainly for:

- Presentation
- Reusable UI
- Feature-specific sections
- Forms
- Appointment displays
- Doctor navigation
- Availability editors

### Services

Services isolate communication with backend resources such as:

```text
Authentication
Doctors
Clients
Appointments
Availability
Visits
Notes
```

### API Layer

The shared API layer handles:

- Backend base URL
- HTTP requests
- JSON communication
- JWT Authorization headers
- Backend errors
- Empty HTTP 204 responses

---

## Project Structure

The frontend is organized by responsibility and feature:

```text
src/
│
├── api/
│   └── Api.ts
│
├── assets/
│
├── components/
│   │
│   ├── appointments/
│   │   └── AppointmentsContent.tsx
│   │
│   ├── availability/
│   │   ├── AvailabilityContent.tsx
│   │   └── AvailabilityEditor.tsx
│   │
│   ├── booking/
│   │   ├── BookingSidebar.tsx
│   │   └── BookingSteps.tsx
│   │
│   ├── client-details/
│   │   ├── ClientsContent.tsx
│   │   ├── DoctorSidebar.tsx
│   │   ├── NewVisitForm.tsx
│   │   └── VisitHistory.tsx
│   │
│   ├── dashboard/
│   │   └── DashboardContent.tsx
│   │
│   └── shared/
│       ├── Hero.tsx
│       ├── Navbar.tsx
│       ├── ProtectedRoute.tsx
│       └── ServicesPreview.tsx
│
├── pages/
│   ├── Availability.tsx
│   ├── Booking.tsx
│   ├── ClientDetails.tsx
│   ├── Clients.tsx
│   ├── DoctorDashboard.tsx
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── MyAppointments.tsx
│   └── Register.tsx
│
├── services/
│   ├── AppointmentService.ts
│   ├── AuthService.ts
│   ├── AvailabilityService.ts
│   ├── ClientService.ts
│   ├── DoctorService.ts
│   ├── NoteService.ts
│   └── VisitService.ts
│
├── styles/
│
├── types/
│
├── App.tsx
└── main.tsx
```

### Component Organization

Feature-specific components are grouped inside dedicated directories.

For example:

```text
booking/
availability/
appointments/
dashboard/
client-details/
```

Components shared across multiple application areas are kept inside:

```text
components/shared/
```

This structure keeps the page components smaller and reduces duplicated UI logic.

---

## Application Routes

Routing is handled with React Router.

### Public Routes

#### Home

```text
/
```

Public landing page.

#### Login

```text
/login
```

Authentication page for existing users.

#### Registration

```text
/register
```

Account registration for clients.

---

## Client Routes

The following routes require the:

```text
CLIENT
```

role.

### Book Appointment

```text
/booking
```

Allows the client to select a service, date and available appointment slot.

### My Appointments

```text
/my-appointments
```

Displays upcoming appointments and appointment history.

---

## Doctor Routes

The following routes require the:

```text
DOCTOR
```

role.

### Dashboard

```text
/doctor/dashboard
```

Displays doctor information, appointment activity and appointment requests.

### Client Management

```text
/doctor/clients
```

Displays the doctor's clients and provides client search functionality.

### Client Details

```text
/doctor/clients/:id
```

Displays an individual client profile, visit history and notes.

### Availability

```text
/doctor/availability
```

Allows the doctor to configure weekly working hours and session duration.

---

## Authentication and Authorization

Authentication is handled by the Spring Boot backend using JWT.

The frontend communicates with:

```text
POST /api/auth/login
POST /api/auth/register
```

After successful authentication, the frontend stores:

```text
token
userId
email
role
```

in browser `localStorage`.

The JWT is automatically added to protected requests:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

## Role-Based Routing

Protected frontend routes use:

```text
ProtectedRoute
```

The route flow is:

```text
User requests protected route
            ↓
Check authentication
            ↓
Check required role
            ↓
Correct role?
     ↓             ↓
    Yes            No
     ↓             ↓
Render page      Redirect
```

Frontend route protection improves the user experience and prevents users from navigating to pages intended for another role.

Actual security enforcement remains the responsibility of the backend API.

---

## API Communication

All backend requests ultimately use the shared API client:

```text
src/api/Api.ts
```

The API base URL is read from:

```env
VITE_API_URL
```

with local development falling back to:

```text
http://localhost:8080
```

The API client automatically:

1. Creates the request headers
2. Reads the JWT from local storage
3. Adds the Bearer token when available
4. Sends the HTTP request
5. Handles unsuccessful backend responses
6. Returns the parsed JSON response

Example architecture:

```text
React Page
    ↓
AppointmentService
    ↓
apiRequest()
    ↓
Spring Boot API
```

---

## Frontend Services

Backend communication is separated into domain-specific services.

### AuthService

Responsible for:

- Login
- Registration
- Authentication storage
- Logout
- Authentication checks

### AppointmentService

Responsible for:

- Loading doctor appointments
- Loading client appointments
- Creating appointments
- Updating appointment status

Example endpoints include:

```text
GET   /api/appointments/doctor/{doctorId}
GET   /api/appointments/me
POST  /api/appointments
PATCH /api/appointments/{appointmentId}/status
```

### DoctorService

Handles doctor-related API requests.

### ClientService

Handles:

- Loading clients
- Client search
- Client details

### AvailabilityService

Handles:

- Loading doctor availability
- Creating availability records
- Updating availability records

### VisitService

Handles client visit/session history.

### NoteService

Handles notes connected to visits.

---

## Appointment Booking Flow

The booking interface uses the doctor's actual availability.

The client completes four main steps:

```text
1. Select Service
        ↓
2. Select Date
        ↓
3. Select Time
        ↓
4. Confirm Booking
```

The selected appointment is then sent to the backend.

A newly created appointment begins with status:

```text
PENDING
```

The client UI displays the corresponding status as:

```text
Αναμένει επιβεβαίωση
```

---

## Appointment Statuses

The frontend supports the following backend appointment statuses:

```text
PENDING
CONFIRMED
COMPLETED
CANCELLED
```

These statuses are converted into user-friendly labels and visual indicators in the appointment interface.

The client appointment screen separates records into:

```text
Upcoming Appointments
        +
Appointment History
```

---

## Doctor Availability

Doctors can manage weekly availability from:

```text
/doctor/availability
```

Each weekday can contain:

- Enabled / disabled state
- Start time
- End time
- Session duration

Example:

```text
Monday

09:00 → 17:00

Session duration: 50 minutes
```

The availability page synchronizes the doctor's saved schedule with all seven weekdays.

The booking interface then uses that schedule to determine which dates and time slots can be selected.

---

## Appointment Management

When a client creates an appointment:

```text
CLIENT
   ↓
Creates Appointment
   ↓
PENDING
   ↓
Doctor Dashboard
   ↓
Doctor Confirms
   ↓
CONFIRMED
```

Appointment status changes are sent through the backend REST API.

The doctor dashboard provides the main workspace for appointment management.

---

## Client Management

Doctors can access their client workspace from:

```text
/doctor/clients
```

The page supports:

- Loading clients from the backend
- Searching clients
- Displaying client information
- Opening client history

The client management UI has been separated into reusable components to keep API orchestration independent from presentation logic.

---

## Visit History and Notes

A doctor can open:

```text
/doctor/clients/:id
```

to access an individual client profile.

The client details area supports:

- Client information
- Visit history
- New visit creation
- Notes connected to individual visits

The UI separates visit-related responsibilities into dedicated components such as:

```text
NewVisitForm
VisitHistory
DoctorSidebar
```

---

## Environment Configuration

Create a `.env` file in the frontend project root.

Example:

```env
VITE_API_URL=http://localhost:8080
```

An example environment file is included as:

```text
.env.example
```

### Important

`VITE_API_URL` is a public frontend configuration value.

Secrets must **never** be stored in variables prefixed with:

```text
VITE_
```

because Vite exposes these values to the client-side application.

---

## Installation

### Requirements

You need:

- Node.js
- npm
- Running Healayra backend
- PostgreSQL configured through the backend

Clone the repository and install the dependencies:

```bash
npm install
```

---

## Development

Start the Vite development server:

```bash
npm run dev
```

The frontend is normally available at:

```text
http://localhost:5173
```

For the complete application, the backend should also be running.

Typical local architecture:

```text
Browser
   ↓
React + Vite
http://localhost:5173
   ↓
REST / JSON / JWT
   ↓
Spring Boot
http://localhost:8080
   ↓
PostgreSQL
```

---

## Build

Create a production build with:

```bash
npm run build
```

The build process performs:

```text
TypeScript compilation
        ↓
Vite production build
```

Production files are generated inside:

```text
dist/
```

---

## Preview Production Build

After building the project:

```bash
npm run preview
```

This starts a local server using the generated production build.

---

## Lint

Static code analysis is performed with **Oxlint**.

Run:

```bash
npm run lint
```

The current frontend refactoring pass has been completed with:

```text
0 errors
0 warnings
```

---

## Maintainability

The frontend was refactored from several large page components into smaller feature-oriented components.

Examples include:

```text
Booking
├── BookingSteps
└── BookingSidebar

Availability
├── AvailabilityContent
└── AvailabilityEditor

Client Management
├── ClientsContent
└── DoctorSidebar

Client Details
├── NewVisitForm
└── VisitHistory

Appointments
└── AppointmentsContent

Doctor Dashboard
└── DashboardContent
```

The goal of the refactoring was to:

- Reduce duplicated JSX
- Separate API orchestration from presentation
- Reuse common doctor UI
- Keep page components easier to understand
- Improve maintainability
- Preserve existing functionality

---

## Security Notes

This repository represents an educational MVP.

The frontend currently stores JWT authentication data in:

```text
localStorage
```

This simplifies authentication for the current project.

For a real production healthcare platform, authentication and privacy controls would require additional hardening.

Possible improvements include:

- HttpOnly authentication cookies
- Secure cookies
- Stronger session management
- CSRF protection where applicable
- Content Security Policy
- More advanced authorization handling
- Audit logging
- Data privacy controls
- Production monitoring
- GDPR-focused security review

Sensitive healthcare data should not be used in a production environment without the appropriate security, legal and privacy safeguards.

---

## Current MVP Status

The current frontend includes the main functional flow required by the Healayra MVP.

Implemented functionality includes:

- Public landing page
- Login
- Client registration
- JWT authentication integration
- Role-based protected routes
- Client appointment booking
- Dynamic doctor availability
- Appointment time-slot selection
- Client appointment overview
- Appointment history
- Doctor dashboard
- Appointment requests
- Appointment confirmation
- Weekly doctor availability management
- Client management
- Client search
- Client profiles
- Visit creation
- Visit history
- Visit notes
- Responsive UI
- Feature-oriented component structure
- Shared API layer
- TypeScript domain models
- Frontend linting
- Production build support

The frontend has been validated locally using:

```bash
npm run build
npm run lint
```

---

## Future Improvements

Possible future extensions include:

- Multiple doctors
- Doctor discovery and search
- Full multi-tenant architecture
- Custom doctor profiles
- Custom domains or subdomains
- Appointment cancellation by clients
- Appointment rescheduling
- Email notifications
- SMS notifications
- Appointment reminders
- Dedicated available-slot backend endpoint
- Additional form validation
- Accessibility improvements
- Automated frontend tests
- End-to-end tests
- Improved production authentication
- GDPR-oriented privacy controls
- Cloud deployment

---

## Backend

The Healayra frontend is designed to work together with the separate:

```text
healayra-backend
```

Spring Boot application.

Backend technologies include:

```text
Java
Spring Boot
Spring Security
JWT
JPA / Hibernate
PostgreSQL
Flyway
Swagger / OpenAPI
```

---

## Project Purpose

Healayra was developed to demonstrate a complete full-stack application involving:

```text
Frontend
    +
REST API
    +
Authentication
    +
Authorization
    +
Business Logic
    +
Relational Database
```

It serves both as a **Coding Factory final project** and as a portfolio project demonstrating the integration of a modern React frontend with a Spring Boot backend.

---

## Author

Developed by **ILIAS KOKKALIDIS**

Coding Factory Final Project

---

# Healayra

### Trust the Process.