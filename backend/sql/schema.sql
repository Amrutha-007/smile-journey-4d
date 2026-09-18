-- ==============================================================================
-- SmileProgress Database Schema (Supabase PostgreSQL)
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DOCTORS TABLE
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    clinic_name VARCHAR(255),
    specialization VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doctors_auth_user ON doctors(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_email ON doctors(email);

-- 2. PATIENTS TABLE
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    age INTEGER CHECK (age >= 0 AND age <= 120),
    gender VARCHAR(50),
    phone VARCHAR(50),
    email VARCHAR(255),
    problem VARCHAR(255),
    problem_description TEXT,
    original_photo_url TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'upcoming')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_doctor ON patients(doctor_id);
CREATE INDEX IF NOT EXISTS idx_patients_code ON patients(doctor_id, patient_code);

-- 3. TREATMENTS TABLE
CREATE TABLE IF NOT EXISTS treatments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    treatment_type VARCHAR(50) NOT NULL CHECK (treatment_type IN ('veneers', 'clear_aligners', 'braces')),
    duration_months INTEGER NOT NULL CHECK (duration_months > 0),
    number_of_sittings INTEGER NOT NULL CHECK (number_of_sittings > 0),
    start_date DATE NOT NULL,
    expected_end_date DATE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_treatments_patient ON treatments(patient_id);

-- 4. TREATMENT STAGES TABLE
CREATE TABLE IF NOT EXISTS treatment_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    treatment_id UUID NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
    stage_number INTEGER NOT NULL,
    stage_name VARCHAR(100) NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 0),
    scheduled_date DATE,
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'generating', 'completed')),
    ai_image_url TEXT,
    actual_photo_url TEXT,
    dentist_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stages_treatment ON treatment_stages(treatment_id);

-- 5. SITTINGS TABLE
CREATE TABLE IF NOT EXISTS sittings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    treatment_id UUID NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES treatment_stages(id) ON DELETE SET NULL,
    sitting_number INTEGER NOT NULL,
    date DATE NOT NULL,
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    actual_photo_url TEXT,
    dentist_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sittings_patient ON sittings(patient_id);
CREATE INDEX IF NOT EXISTS idx_sittings_treatment ON sittings(treatment_id);
CREATE INDEX IF NOT EXISTS idx_sittings_stage ON sittings(stage_id);

-- 6. AI SIMULATIONS TABLE
CREATE TABLE IF NOT EXISTS ai_simulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    treatment_id UUID NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES treatment_stages(id) ON DELETE SET NULL,
    input_image_url TEXT NOT NULL,
    output_image_url TEXT,
    treatment_type VARCHAR(50) NOT NULL,
    stage_month INTEGER NOT NULL,
    stage_progress INTEGER NOT NULL,
    ai_provider VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_simulations_patient ON ai_simulations(patient_id);
CREATE INDEX IF NOT EXISTS idx_simulations_treatment ON ai_simulations(treatment_id);
CREATE INDEX IF NOT EXISTS idx_simulations_stage ON ai_simulations(stage_id);

-- 7. REPORTS TABLE
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    treatment_id UUID NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
    report_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_patient ON reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_reports_treatment ON reports(treatment_id);

-- Storage buckets creation instructions (Run in Supabase Storage UI or via Storage API):
-- 1. 'patient-originals' (private)
-- 2. 'patient-sittings' (private)
-- 3. 'ai-simulations' (private)
-- 4. 'reports' (private)
