export type TreatmentType = "dental_veneers" | "clear_aligners" | "braces";

export type DentalProblem =
  | "crowding"
  | "spacing"
  | "misalignment"
  | "discoloration"
  | "overbite"
  | "underbite"
  | "missing_teeth"
  | "other";

export type StageStatus = "completed" | "current" | "upcoming" | "generating";

export interface TreatmentStage {
  id: string;
  stageName: string;
  month: number;
  date: string;
  sittingNumber: number;
  progress: number;
  aiImageUrl?: string;
  actualPhotoUrl?: string;
  status: StageStatus;
  dentistNotes?: string;
  aiPrompt?: string;
  clinicalObservations?: string;
  completedAt?: string;
}

export interface SittingRecord {
  id: string;
  sittingNumber: number;
  date: string;
  stageId: string;
  stageName: string;
  progress: number;
  dentistNotes: string;
  photoUrl?: string;
  createdAt: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Female" | "Male" | "Other";
  phone: string;
  email: string;
  additionalNotes?: string;
  dentalProblems: DentalProblem[];
  problemDescription: string;
  treatment: TreatmentType;
  durationMonths: number;
  sittings: number;
  startDate: string;
  customSittingDates?: string[];
  originalPhotoUrl: string;
  stages: TreatmentStage[];
  sittingsHistory: SittingRecord[];
  progress: number;
  status: "Active" | "Completed" | "Upcoming";
  nextSittingDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AISimulationInput {
  patientImage: string;
  treatmentType: TreatmentType;
  treatmentDuration: number;
  stage: string;
  stageMonth: number;
  stageProgress: number;
}

export interface AISimulationOutput {
  imageUrl: string;
  stage: string;
  month: number;
  status: "completed" | "failed";
  promptUsed: string;
}

export interface DoctorUser {
  name: string;
  email: string;
  phone: string;
  clinicName: string;
  specialization: string;
  licenseNumber?: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: DoctorUser | null;
  isAuthenticated: boolean;
}
