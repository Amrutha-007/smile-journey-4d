# SmileProgress Backend

[![Python 3.13+](https://img.shields.io/badge/python-3.13+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%7C%20Auth%20%7C%20Storage-3ECF8E.svg)](https://supabase.com/)
[![Tests Passing](https://img.shields.io/badge/pytest-19%20passed-brightgreen.svg)]()

Production-grade, hackathon-optimized backend for **SmileProgress**—an intelligent Digital Smile Design and orthodontic tracking platform.

SmileProgress empowers dental specialists to:
1. Register and authenticate doctors securely using **Supabase Auth** / JWT with doctor data scoping.
2. Create and manage patient profiles with medical dental problem descriptions.
3. Prescribe customized treatments (Clear Aligners, Dental Veneers, Braces) with duration and sitting count.
4. **Automatically calculate treatment timelines** (Initial, Month X, ..., Final) with automatic distribution or custom sitting dates.
5. Upload baseline patient smile photographs with strict file type and size validation.
6. Generate **AI-powered potential smile visualizations** for each stage via a pluggable provider abstraction (**Gemini Image Generation / Edit API**, **Mock AI provider**, extensible for **FLUX Kontext**).
7. Log patient sittings and upload **actual clinical sitting photographs** (strictly separated from AI simulations).
8. Track stage-by-stage clinical progress and render full-journey before/after visual comparisons.
9. Generate consolidated treatment reports (structured JSON and downloadable, branded **PDF**).

---

## 🏗 System Architecture

```
                    REACT FRONTEND
                          │
                          ▼
                     FASTAPI (app/main.py)
                          │
        ┌─────────────────┼──────────────────┐
        │                 │                  │
        ▼                 ▼                  ▼
   Supabase DB      Storage Service      AI Service
  (PostgreSQL)    (patient-originals,  (Gemini / Mock / FLUX)
                  patient-sittings,
                  ai-simulations,
                  reports)
        │                 │                  │
        └─────────────────┼──────────────────┘
                          │
                          ▼
                 Timeline Service (app/services/timeline_service.py)
                          │
                          ▼
                 Stage-by-Stage Timeline & Progress
                          │
                          ▼
                 Report Service (PDF & JSON)
```

---

## 📂 Project Structure

```
backend/
│
├── app/
│   ├── main.py                     # FastAPI application entrypoint & middleware
│   ├── config.py                   # Centralized application settings & env loader
│   ├── database.py                 # Supabase PostgreSQL client & local fallback store
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py                 # Auth dependencies (get_current_doctor, JWT token extraction)
│   │   ├── auth.py                 # Doctor authentication (/api/auth/register, login, me)
│   │   ├── patients.py             # Patient CRUD, photo upload, progress, overview
│   │   ├── treatments.py           # Treatment creation & batch AI simulation (/generate-all)
│   │   ├── stages.py               # Treatment stage retrieval & notes update
│   │   ├── sittings.py             # Sitting visit records & actual photo upload
│   │   ├── simulations.py          # AI simulation polling and retry endpoints
│   │   └── reports.py              # Consolidated clinical report data & PDF export
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── doctor.py               # Doctor domain model
│   │   ├── patient.py              # Patient domain model
│   │   ├── treatment.py            # Treatment domain model
│   │   ├── stage.py                # TreatmentStage domain model
│   │   ├── sitting.py              # Sitting domain model
│   │   ├── simulation.py           # AISimulation domain model
│   │   └── report.py               # Report domain model
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── common.py               # Standard APIResponse, APIError, ErrorResponse wrappers
│   │   ├── auth.py                 # RegisterRequest, LoginRequest, DoctorResponse
│   │   ├── patient.py              # PatientCreate, PatientUpdate, Overview, Progress
│   │   ├── treatment.py            # TreatmentCreate, TreatmentWithStagesResponse
│   │   ├── stage.py                # StageUpdate, StageResponse
│   │   ├── sitting.py              # SittingCreate, SittingUpdate, SittingPhotoResponse
│   │   ├── simulation.py           # SimulationRequest, SimulationStatusResponse
│   │   └── report.py               # DetailedReportData, ReportResponse
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── timeline_service.py     # Automatic timeline calculation (even or custom dates)
│   │   ├── ai_service.py           # AIImageProvider interface, Gemini & Mock providers
│   │   ├── storage_service.py      # Supabase Storage & local private bucket manager
│   │   ├── patient_service.py      # Doctor-scoped patient repository & progress aggregator
│   │   ├── sitting_service.py      # Sitting logging, actual photo linking & stage updates
│   │   └── report_service.py       # Consolidated clinical report builder & ReportLab PDF generator
│   │
│   └── utils/
│       ├── __init__.py
│       ├── dates.py                # Date parsing, addition, formatting, and UTC helpers
│       ├── prompts.py              # Dynamic treatment prompt engineering (Aligners, Veneers, Braces)
│       └── security.py             # Password hashing (PBKDF2/SHA-256) and JWT tokens
│
├── sql/
│   └── schema.sql                  # Complete Supabase PostgreSQL DDL with RLS & indexes
│
├── tests/
│   ├── conftest.py                 # Pytest fixtures (TestClient, doctors, auth headers, images)
│   ├── test_auth_and_health.py     # Auth register, login, me, and health check tests
│   ├── test_timeline.py            # Timeline calculation tests (12m/6s, custom dates, edge cases)
│   ├── test_patients.py            # Patient CRUD and strict doctor data isolation tests
│   ├── test_treatments.py          # Treatment creation and automatic stage generation tests
│   ├── test_photos.py              # Patient photo upload validation (MIME types, size, ownership)
│   ├── test_ai_simulation.py       # AI batch generation, status polling, and retry tests
│   ├── test_sittings.py            # Clinical sitting creation and actual visit photo tests
│   └── test_reports.py             # Consolidated report JSON and downloadable PDF tests
│
├── seed.py                         # Realistic database seed script (Dr. Sarah Thomas + 3 patients)
├── requirements.txt                # Python dependencies
├── .env.example                    # Environment variables template
├── pytest.ini                      # Pytest configuration
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory based on `.env.example`:

```ini
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# AI Provider Configuration
# Options: 'mock' (default for hackathon/offline reliability) or 'gemini'
AI_PROVIDER=mock
GEMINI_API_KEY=

# Security & CORS
JWT_SECRET=smileprogress-dev-secret-key-32charsmin!
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173

# Server Settings
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
```

> [!NOTE]
> The backend features **Dual-Mode Persistence & Storage**. If `SUPABASE_URL` is configured, it interacts with Supabase PostgreSQL and Storage buckets. If running locally or offline without a Supabase project, it transparently uses an in-memory repository and local file storage, ensuring 100% development uptime.

---

## 🚀 Quick Start

### 1. Set Up Virtual Environment & Dependencies
```bash
cd backend
python -m venv .venv

# On Windows:
.\.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

### 2. Seed Demo Data
Populates Dr. Sarah Thomas, patients Ananya Menon, Rahul Kumar, Meera S, treatments, calculated timelines, AI simulations, and sittings:
```bash
python seed.py
```

### 3. Run Automated Tests
```bash
pytest -v
```

### 4. Start the FastAPI Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- API Health Check: `http://localhost:8000/health`
- Swagger Interactive Documentation: `http://localhost:8000/docs`
- ReDoc Documentation: `http://localhost:8000/redoc`

---

## 📑 API Reference & Workflows

All successful responses follow the standard envelope:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable message"
}
```

All error responses follow:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descriptive message"
  }
}
```

### 1. Doctor Authentication
- `POST /api/auth/register` — Register new doctor account.
- `POST /api/auth/login` — Log in and receive JWT token.
- `GET /api/auth/me` — Retrieve current authenticated doctor profile.

### 2. Patients
- `POST /api/patients` — Create patient (returns `id`, `patient_code` e.g. `PT-001`, `name`).
- `GET /api/patients` — List doctor's patients (strict doctor scoping).
- `GET /api/patients/{id}` — Get patient details.
- `PUT /api/patients/{id}` — Update patient profile.
- `DELETE /api/patients/{id}` — Delete patient and associated treatment records.
- `POST /api/patients/{id}/photo` — Upload baseline smile photo (`JPG`, `PNG`, `WEBP`, max 10MB).
- `GET /api/patients/{id}/progress` — Visual progress metrics with stage-by-stage comparisons.
- `GET /api/patients/{id}/overview` — Comprehensive data object powering the patient detail screen.

### 3. Treatment & Automatic Timeline
- `POST /api/patients/{id}/treatment` — Create treatment plan and **automatically calculate stages**.
  ```json
  {
    "treatment_type": "clear_aligners",
    "duration_months": 12,
    "number_of_sittings": 6,
    "start_date": "2026-09-18",
    "description": "Clear aligner treatment",
    "custom_dates": ["2026-11-18", "2027-01-18", "2027-03-18", "2027-05-18", "2027-07-18", "2027-09-18"]
  }
  ```
- `POST /api/treatments/{id}/generate-all` — Trigger batch AI smile simulations for all non-initial stages.

### 4. Sittings & Actual Clinical Photos
- `POST /api/patients/{id}/sittings` — Log a clinical sitting visit with progress percentage and clinical notes.
- `POST /api/sittings/{id}/photo` — Upload **actual clinical visit photograph**.
  > **Important Distinction:**
  > - `AI Simulation`: Potential visual projection (`simulation_type: potential_treatment_visualization`).
  > - `Actual Sitting Photo`: Real patient clinical photograph (`image_type: actual_sitting_photo`).
  > - The original patient photograph is never overwritten.

### 5. AI Simulations
- `POST /api/patients/{patient_id}/treatment/{treatment_id}/simulate` — Simulate specific stage IDs or all remaining stages.
- `GET /api/simulations/{id}` — Poll simulation job status (`queued`, `processing`, `completed`, `failed`).
- `POST /api/simulations/{id}/retry` — Retry an individual failed simulation stage without affecting the rest of the treatment.

### 6. Treatment Reports
- `POST /api/patients/{id}/report` — Generate consolidated report object.
- `GET /api/patients/{id}/report` — Retrieve structured clinical report data.
- `GET /api/patients/{id}/report/pdf` — Stream and download branded, high-resolution treatment plan and progress PDF.

---

## 🤖 AI Provider Configuration

### Mock Mode (`AI_PROVIDER=mock`)
Default mode for hackathons, testing, and offline presentations. Returns instant, high-fidelity SVG dental simulations with progressive alignment, crowding reduction, tooth whiteness enhancement, and bracket detailing based on treatment type and stage progress.

### Gemini Mode (`AI_PROVIDER=gemini`)
Uses the official `google-genai` SDK with `imagen-3.0-generate-002` or Gemini multimodal editing to generate photorealistic smile projections. Set your API key in `.env`:
```ini
AI_PROVIDER=gemini
GEMINI_API_KEY=AIzaSy...
```

---

## 🛡 Security & Compliance
- **Doctor Scoping:** Every single patient, treatment, and sitting query verifies doctor ownership (`doctor_id == current_doctor.id`). Cross-doctor access attempts strictly return `403 Forbidden` or `404 Not Found`.
- **Medical Disclaimer:** Every AI simulation and report includes the legal disclaimer stating that AI visualizations represent potential treatment projections and do not constitute guaranteed clinical outcomes.
- **Input & File Validation:** Uploaded images are checked against allowed MIME types and verified via Pillow byte inspection.
