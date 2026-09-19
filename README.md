# SmileProgress

### **DSOLVE 2026 · DRISHTI · College of Engineering Trivandrum (CET)**

**BUILD. SOLVE. DEMONSTRATE.**

> **AI-Powered Digital Smile Treatment Visualization**

|                   |                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------- |
| **Problem:**      | Problem 5 — Digital Smile Design                                                      |
| **Team Name:**    | NodeX                                                                                 |
| **Team Members:** | Amrutha O S · Agna Mariya Jeff · Ananthitha A S · Anagha K B                          |
| **Institution:**  | Christ College of Engineering                                                         |
| **Live Demo:**    | [Demo Link](https://drive.google.com/drive/folders/1brCJ5qWHfTxpZD1wPzWzio_g3OVdY0ui) |
| **Pitch Video:**  | [Pitch Video](https://lnkd.in/p/g2p5sMxU)                                             |
| **Repository:**   | [GitHub Repository](https://github.com/Amrutha-007/smile-journey-4d)                  |

---

## Table of Contents

* [Problem Statement](#problem-statement)
* [Our Solution](#our-solution)
* [Key Features](#key-features)
* [End-to-End Workflow](#end-to-end-workflow)
* [Demo](#demo)
* [Tech Stack](#tech-stack)
* [System Architecture](#system-architecture)
* [Getting Started](#getting-started)
* [Usage / Demo Script](#usage--demo-script)
* [Business Reach](#business-reach)
* [Limitations & Future Scope](#limitations--future-scope)
* [Conclusion](#conclusion)
* [Team](#team)
* [Submission Checklist](#submission-checklist)

---

## Problem Statement

### Problem 5: Digital Smile Design

Dental treatment plans can be difficult for patients to understand because the treatment process, expected stages, duration, and possible visual changes are usually explained verbally or through static clinical information.

Patients may understand the proposed treatment but still struggle to visualize how their smile could change throughout the treatment journey.

### Why This Matters

The dentist may have a clear clinical plan, but the patient often cannot visualize the journey from the initial condition to the proposed treatment outcome.

SmileProgress addresses this communication gap by transforming a dental treatment plan into a visual and structured journey that patients can understand more easily.

---

## Our Solution

**SmileProgress** is an AI-assisted digital smile treatment visualization and progress-tracking platform designed to improve communication between dentists and patients.

Instead of presenting treatment as only a clinical explanation, SmileProgress creates a visual journey consisting of:

**Patient Photo → Treatment Plan → Timeline → AI Potential Visualizations → Actual Sitting Photos → Progress Tracking → Treatment Report**

The platform supports dental treatments such as:

* Dental Veneers
* Clear Aligners
* Braces

Dentists can create patient profiles, define treatment plans and durations, generate treatment stages, visualize potential smile changes, record actual clinical sittings, compare progress, and generate treatment reports.

A key design principle is the separation between **AI-generated potential outcomes** and **actual clinical photographs**. AI visualizations are used for communication and expectation-setting, while actual photographs represent real treatment progress.

> **Important:** AI-generated smile visualizations represent potential treatment projections and are not guaranteed clinical outcomes.

---

## Key Features

### 1. Patient Management

* Create and manage patient profiles
* Store dental problem descriptions
* Upload baseline smile photographs
* Maintain patient-specific treatment information

### 2. Treatment Planning

* Select treatment type
* Define treatment duration
* Define number of sittings
* Configure treatment start date
* Generate treatment stages automatically
* Support custom sitting dates

### 3. Smart Treatment Timeline

The treatment plan is converted into a visual timeline containing:

* Initial stage
* Intermediate treatment stages
* Progress percentages
* Treatment dates
* Final stage

The dentist-prescribed treatment plan remains the source of truth.

### 4. AI Smile Visualization

The platform can generate potential smile visualizations based on:

* Patient image
* Treatment type
* Treatment stage
* Progress percentage

The AI workflow is designed to preserve the patient's identity and modify the visible smile/teeth region rather than replacing the entire person.

### 5. Simulation vs Reality

SmileProgress clearly separates:

**AI Simulation**

* Potential treatment outcome
* AI-generated visualization
* Used for communication

**Actual Sitting Photo**

* Real clinical photograph
* Dentist-uploaded
* Used for progress tracking

### 6. Progress Tracking

* Record treatment sittings
* Upload actual clinical photographs
* Track stage-by-stage progress
* Compare initial, potential, and actual results
* Add clinical notes

### 7. Treatment Reports

Generate consolidated treatment/progress reports containing relevant patient, treatment, timeline, and progress information.

The backend supports structured report data and downloadable PDF reports.

---

## End-to-End Workflow

```text
Doctor Login
     ↓
Create Patient
     ↓
Record Dental Problem
     ↓
Select Treatment
     ↓
Set Duration & Sittings
     ↓
Upload Patient Photo
     ↓
Generate Treatment Timeline
     ↓
Generate AI Potential Visualizations
     ↓
Review Treatment Journey
     ↓
Record Actual Clinical Sittings
     ↓
Upload Actual Photos
     ↓
Track Progress
     ↓
Generate Treatment Report
```

---

### Demo

[View the SmileProgress Demo](https://drive.google.com/drive/folders/1brCJ5qWHfTxpZD1wPzWzio_g3OVdY0ui)

### Pitch Video

[Watch the NodeX Pitch Video](https://lnkd.in/p/g2p5sMxU)

---

## Tech Stack

| Layer           | Technology                       | Purpose                                |
| --------------- | -------------------------------- | -------------------------------------- |
| Frontend        | React + TypeScript               | Interactive web interface              |
| Build Tool      | Vite                             | Fast development and production builds |
| Styling         | Tailwind CSS                     | Responsive UI development              |
| Backend         | Python + FastAPI                 | REST API and application logic         |
| Validation      | Pydantic                         | API request/response validation        |
| Database        | Supabase PostgreSQL              | Structured application data            |
| Storage         | Supabase Storage                 | Patient and treatment images           |
| Authentication  | Supabase Auth / JWT architecture | Doctor authentication                  |
| AI              | Gemini API                       | AI-assisted smile visualization        |
| AI Architecture | Provider abstraction             | Supports different AI providers        |
| Reports         | ReportLab / PDF generation       | Treatment and progress reports         |
| Testing         | Pytest                           | Backend testing                        |

The current repository uses React, TypeScript and Vite for the frontend and contains a dedicated FastAPI backend.

---

## System Architecture

```text
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │ TypeScript + Vite   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    FastAPI Backend  │
                    │     Python API      │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
      ┌────────────┐    ┌────────────┐    ┌────────────┐
      │  Supabase  │    │  Storage   │    │ AI Service │
      │ PostgreSQL │    │   Images   │    │ Gemini/API │
      └────────────┘    └────────────┘    └────────────┘
             │                 │                 │
             └─────────────────┼─────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │ Timeline & Progress │
                    │      Services       │
                    └──────────┬──────────┘
                               ▼
                    ┌─────────────────────┐
                    │   Report Service    │
                    │ JSON + PDF Reports  │
                    └─────────────────────┘
```

The repository's backend documentation describes this modular architecture, including Supabase PostgreSQL, storage, an AI service, timeline service, and report service.

---

## Getting Started

### Prerequisites

Install the following:

* Node.js
* npm
* Python 3.13+
* Git
* A Supabase project
* Gemini API key for Gemini-powered visualization

The backend repository specifies Python 3.13+ and provides a `requirements.txt` file.

---

### Clone the Repository

```bash
git clone https://github.com/Amrutha-007/smile-journey-4d.git
cd smile-journey-4d
```

---

### Frontend Setup

Install the frontend dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend uses Vite and is configured to run as a React + TypeScript application.

---

### Backend Setup

Open another terminal:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv .venv
```

#### Windows

```bash
.\.venv\Scripts\activate
```

#### macOS / Linux

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend API:

```text
http://localhost:8000
```

Swagger documentation:

```text
http://localhost:8000/docs
```

The repository provides these backend startup instructions directly in its documentation.

---

## Environment Variables

Create a `.env` file inside the `backend/` directory.

Example:

```env
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key

JWT_SECRET=your-secure-jwt-secret

CORS_ORIGINS=http://localhost:5173,http://localhost:3000

HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
```

Never commit real API keys, passwords, JWT secrets, or Supabase service-role credentials to the repository.

The backend provides an `.env.example` file and supports switching between a mock AI provider and Gemini through `AI_PROVIDER`.

---

## Usage / Demo Script

This section can be used as the team's **3–5 minute live demonstration runbook**.

### 1. Introduction

Start by explaining the problem:

> Patients can hear a dental treatment plan, but they often cannot visualize the journey.

Introduce **SmileProgress** as the solution.

### 2. Doctor Dashboard

Show the doctor interface and explain how a dentist can manage patient treatment journeys.

### 3. Create Patient

Create/select a patient and enter the relevant dental problem information.

### 4. Create Treatment Plan

Select:

* Treatment type
* Duration
* Number of sittings
* Start date

### 5. Show the Timeline

Demonstrate how the treatment plan becomes a structured timeline with different stages and progress percentages.

### 6. AI Visualization

Upload/select the patient's photograph and demonstrate the potential smile visualization.

Explain that the AI visualization is a **potential outcome used for communication**, not a guaranteed clinical result.

### 7. Simulation vs Reality

Show the distinction between:

**Potential AI Visualization → Actual Clinical Sitting Photo**

This is one of the core communication features of SmileProgress.

### 8. Progress Tracking

Show how actual sitting photographs and treatment progress can be recorded over time.

### 9. Generate Report

Generate the consolidated treatment/progress report.

### 10. Closing

Finish by highlighting:

> **SmileProgress turns a complex dental treatment plan into a visual journey that both dentists and patients can understand.**

---

## Business Reach

### A B2B SaaS Layer for the Dental Care Journey

SmileProgress can be positioned as a digital communication and treatment-tracking platform for dental professionals.

### Target Users

* **Dental Clinics**
* **Cosmetic Dentistry Practices**
* **Orthodontic Clinics**
* **Dental Hospitals**
* **Individual Dental Practitioners**

### Value Proposition

SmileProgress provides:

* Better dentist–patient communication
* Visual treatment explanations
* Structured treatment tracking
* Professional treatment reports
* Centralized patient journey management
* AI-assisted potential outcome visualization

### Potential Business Expansion

The platform can evolve through:

* Clinic-based subscription plans
* Premium AI visualization
* Patient sharing
* Secure patient access
* Dental practice integrations
* Support for additional treatments
* Mobile applications
* Advanced image analysis

The project's presentation positions this as a B2B SaaS opportunity spanning clinics, dentists, and patients.

---

## Limitations & Future Scope

### Known Limitations

* The current implementation is a **prototype/demo** rather than a production clinical system.
* Gemini-powered visualization is currently **partially integrated**.
* Doctor authentication in the current demonstration is presented as a **mock/demo experience**.
* AI-generated visualizations should not be interpreted as guaranteed clinical outcomes.
* The current system requires further validation before real-world clinical deployment.
* The current application is primarily demonstrated through a local development environment.

### Future Scope

#### Advanced AI Visualization

Improve photorealistic smile transformation while maintaining stronger identity and image consistency.

#### More Treatment Types

Expand support beyond:

* Veneers
* Clear Aligners
* Braces

to additional dental procedures.

#### Patient Application

Develop a dedicated patient-facing mobile/web application where patients can securely view:

* Treatment timeline
* Progress
* AI visualizations
* Actual clinical photographs
* Reports

#### Clinic Integration

Integrate SmileProgress with existing dental clinic management and electronic record systems.

#### Secure Sharing

Enable controlled sharing of treatment progress between dentists and patients.

#### Advanced Image Analysis

Introduce enhanced dental image analysis and treatment-progress measurements.

#### Cloud Deployment

Deploy the system as a scalable cloud platform for use by multiple clinics and practitioners.

The project's roadmap includes advanced AI visualization, more treatments, a patient app, clinic integration, secure sharing, and enhanced image analysis.

---

## Conclusion

SmileProgress addresses a simple but important communication problem in dental care:

**Patients can understand a treatment plan better when they can see the journey.**

By combining treatment planning, automated timelines, AI-assisted visualization, actual clinical photographs, progress tracking, and professional reports, SmileProgress creates a centralized visual journey for dental treatment.

The current prototype demonstrates the foundation of a platform that can evolve from a hackathon solution into a broader digital communication and treatment-tracking system for dental professionals.

### Vision

> **Visualize the journey to a better smile.**

Our vision is to make dental treatment communication more visual, understandable, and engaging while keeping professional dental evaluation at the center.

---

## Team

| Name                 | Role        | GitHub                                               | Email                                                                 |
| -------------------- | ----------- | ---------------------------------------------------- | --------------------------------------------------------------------- |
| **Amrutha O S**      | Team Member | [@Amrutha-007](https://github.com/Amrutha-007)       | [amruthaos154@gmail.com](mailto:amruthaos154@gmail.com)               |
| **Agna Mariya Jeff** | Team Member | [@AgnaMariyaJeff](https://github.com/AgnaMariyaJeff) | [agnamariyajeff@gmail.com](mailto:agnamariyajeff@gmail.com)           |
| **Ananthitha A S**   | Team Member | [@AnanthithaAS](https://github.com/AnanthithaAS)     | [ananthitha.official@gmail.com](mailto:ananthitha.official@gmail.com) |
| **Anagha K B**       | Team Member | [@AnaghaKBabu](https://github.com/AnaghaKBabu)       | [anaghakb633@gmail.com](mailto:anaghakb633@gmail.com)                 |

---

## Project Status

**Current Status:** Prototype / Demo

SmileProgress currently demonstrates the core concept and workflow, including treatment planning, timeline generation, Supabase integration, report generation, and AI-assisted visualization capabilities. Gemini integration is currently partial, while the doctor login experience used for the demonstration is mock/demo based.

---

## Repository

**NodeX — SmileProgress**

[View the GitHub Repository](https://github.com/Amrutha-007/smile-journey-4d)

**DSOLVE 2026 · DRISHTI · College of Engineering Trivandrum**

**BUILD. SOLVE. DEMONSTRATE.**
