import { Patient, SittingRecord, TreatmentStage } from "../types";
import { SAMPLE_PATIENT_IMAGES } from "./sampleImages";
import { generateTreatmentTimeline } from "./timelineService";

const STORAGE_KEY = "smileprogress_patients_v1";

const INITIAL_MOCK_PATIENTS: Patient[] = [
  {
    id: "PT-001",
    name: "Ananya Menon",
    age: 26,
    gender: "Female",
    phone: "+1 (555) 349-8821",
    email: "ananya.menon@example.com",
    additionalNotes: "Patient interested in discreet orthodontic improvement for upcoming wedding.",
    dentalProblems: ["crowding", "misalignment"],
    problemDescription: "Severe maxillary anterior crowding with mesial rotation of tooth #8 and lingual displacement of tooth #10. Mild deep bite.",
    treatment: "clear_aligners",
    durationMonths: 12,
    sittings: 6,
    startDate: "2026-09-18",
    originalPhotoUrl: SAMPLE_PATIENT_IMAGES.ananya.original,
    progress: 45,
    status: "Active",
    nextSittingDate: "15 Oct 2026",
    createdAt: "2026-09-18T10:00:00.000Z",
    updatedAt: "2026-09-18T14:30:00.000Z",
    stages: [
      {
        id: "stage-0",
        stageName: "Initial",
        month: 0,
        date: "18 Sep 2026",
        sittingNumber: 0,
        progress: 0,
        aiImageUrl: SAMPLE_PATIENT_IMAGES.ananya.stages.initial,
        actualPhotoUrl: SAMPLE_PATIENT_IMAGES.ananya.original,
        status: "completed",
        dentistNotes: "Baseline clinical photos, intraoral 3D scans, and PVS impressions obtained. Clear aligner prescription approved.",
      },
      {
        id: "stage-1",
        stageName: "Month 2",
        month: 2,
        date: "18 Nov 2026",
        sittingNumber: 1,
        progress: 17,
        aiImageUrl: SAMPLE_PATIENT_IMAGES.ananya.stages.month2,
        actualPhotoUrl: SAMPLE_PATIENT_IMAGES.ananya.stages.month2,
        status: "completed",
        dentistNotes: "Aligners 1-4 completed. Attachments placed on teeth #4, #6, #11, and #13. Tracking well, patient reports 22 hrs/day wear.",
      },
      {
        id: "stage-2",
        stageName: "Month 4",
        month: 4,
        date: "18 Jan 2027",
        sittingNumber: 2,
        progress: 33,
        aiImageUrl: SAMPLE_PATIENT_IMAGES.ananya.stages.month4,
        actualPhotoUrl: SAMPLE_PATIENT_IMAGES.ananya.stages.month4,
        status: "completed",
        dentistNotes: "Aligners 5-8 verified. Mild anterior de-crowding visible. IPR 0.2mm performed between #8 and #9.",
      },
      {
        id: "stage-3",
        stageName: "Month 6",
        month: 6,
        date: "18 Mar 2027",
        sittingNumber: 3,
        progress: 50,
        aiImageUrl: SAMPLE_PATIENT_IMAGES.ananya.stages.month6,
        status: "current",
        dentistNotes: "Mid-treatment review stage. Midline alignment has improved by 2mm. Patient very satisfied with aesthetic progress.",
      },
      {
        id: "stage-4",
        stageName: "Month 8",
        month: 8,
        date: "18 May 2027",
        sittingNumber: 4,
        progress: 67,
        aiImageUrl: SAMPLE_PATIENT_IMAGES.ananya.stages.month8,
        status: "upcoming",
        dentistNotes: "Scheduled alignment progression check.",
      },
      {
        id: "stage-5",
        stageName: "Month 10",
        month: 10,
        date: "18 Jul 2027",
        sittingNumber: 5,
        progress: 83,
        aiImageUrl: SAMPLE_PATIENT_IMAGES.ananya.stages.month10,
        status: "upcoming",
        dentistNotes: "Scheduled detailing and finishing stage.",
      },
      {
        id: "stage-6",
        stageName: "Final — Month 12",
        month: 12,
        date: "18 Sep 2027",
        sittingNumber: 6,
        progress: 100,
        aiImageUrl: SAMPLE_PATIENT_IMAGES.ananya.stages.final,
        status: "upcoming",
        dentistNotes: "Scheduled debonding of attachments, final polish, and delivery of Vivera retention trays.",
      },
    ],
    sittingsHistory: [
      {
        id: "sit-1",
        sittingNumber: 1,
        date: "18 Nov 2026",
        stageId: "stage-1",
        stageName: "Month 2",
        progress: 17,
        dentistNotes: "Tray fit verified with chewies. Composite resin attachments bonded to prescribed teeth. Minor interdental cleaning completed.",
        photoUrl: SAMPLE_PATIENT_IMAGES.ananya.stages.month2,
        createdAt: "2026-11-18T11:00:00.000Z",
      },
      {
        id: "sit-2",
        sittingNumber: 2,
        date: "18 Jan 2027",
        stageId: "stage-2",
        stageName: "Month 4",
        progress: 33,
        dentistNotes: "IPR 0.2mm executed smoothly. Progress tracking right on schedule. No aligner tracking lag noted.",
        photoUrl: SAMPLE_PATIENT_IMAGES.ananya.stages.month4,
        createdAt: "2027-01-18T10:30:00.000Z",
      },
    ],
  },
  {
    id: "PT-002",
    name: "Rahul Kumar",
    age: 34,
    gender: "Male",
    phone: "+1 (555) 782-9014",
    email: "rahul.kumar@example.com",
    additionalNotes: "Executive patient seeking bright, symmetrical smile for public speaking.",
    dentalProblems: ["discoloration", "other"],
    problemDescription: "Tetracycline staining on maxillary anterior teeth (#6-#11), uneven incisal wear, chipped distal edge of #9.",
    treatment: "dental_veneers",
    durationMonths: 3,
    sittings: 3,
    startDate: "2026-06-10",
    originalPhotoUrl: SAMPLE_PATIENT_IMAGES.rahul.original,
    progress: 100,
    status: "Completed",
    createdAt: "2026-06-10T09:00:00.000Z",
    updatedAt: "2026-09-10T12:00:00.000Z",
    stages: [
      {
        id: "stage-0",
        stageName: "Initial",
        month: 0,
        date: "10 Jun 2026",
        sittingNumber: 0,
        progress: 0,
        aiImageUrl: SAMPLE_PATIENT_IMAGES.rahul.stages.initial,
        actualPhotoUrl: SAMPLE_PATIENT_IMAGES.rahul.original,
        status: "completed",
        dentistNotes: "Diagnostic wax-up and aesthetic smile design consultation completed.",
      },
      {
        id: "stage-1",
        stageName: "Month 1",
        month: 1,
        date: "10 Jul 2026",
        sittingNumber: 1,
        progress: 33,
        aiImageUrl: SAMPLE_PATIENT_IMAGES.rahul.stages.month1,
        actualPhotoUrl: SAMPLE_PATIENT_IMAGES.rahul.stages.month1,
        status: "completed",
        dentistNotes: "Minimal preparation of #6-#11 completed under local anesthesia. High-aesthetic provisional veneers placed.",
      },
      {
        id: "stage-2",
        stageName: "Month 2",
        month: 2,
        date: "10 Aug 2026",
        sittingNumber: 2,
        progress: 67,
        aiImageUrl: SAMPLE_PATIENT_IMAGES.rahul.stages.month2,
        actualPhotoUrl: SAMPLE_PATIENT_IMAGES.rahul.stages.month2,
        status: "completed",
        dentistNotes: "Bis-acryl mock-up evaluated. Shade selection confirmed as Vita BL2. Lab fabrication of feldspathic porcelain underway.",
      },
      {
        id: "stage-3",
        stageName: "Final — Month 3",
        month: 3,
        date: "10 Sep 2026",
        sittingNumber: 3,
        progress: 100,
        aiImageUrl: SAMPLE_PATIENT_IMAGES.rahul.stages.final,
        actualPhotoUrl: SAMPLE_PATIENT_IMAGES.rahul.stages.final,
        status: "completed",
        dentistNotes: "Final porcelain veneers bonded with light-cure resin cement. Occlusion adjusted and balanced.",
      },
    ],
    sittingsHistory: [
      {
        id: "sit-rk-1",
        sittingNumber: 1,
        date: "10 Jul 2026",
        stageId: "stage-1",
        stageName: "Month 1",
        progress: 33,
        dentistNotes: "Preparation and temporary veneers placed.",
        photoUrl: SAMPLE_PATIENT_IMAGES.rahul.stages.month1,
        createdAt: "2026-07-10T10:00:00.000Z",
      },
      {
        id: "sit-rk-2",
        sittingNumber: 2,
        date: "10 Aug 2026",
        stageId: "stage-2",
        stageName: "Month 2",
        progress: 67,
        dentistNotes: "Try-in paste evaluation and margin confirmation.",
        photoUrl: SAMPLE_PATIENT_IMAGES.rahul.stages.month2,
        createdAt: "2026-08-10T10:00:00.000Z",
      },
      {
        id: "sit-rk-3",
        sittingNumber: 3,
        date: "10 Sep 2026",
        stageId: "stage-3",
        stageName: "Final — Month 3",
        progress: 100,
        dentistNotes: "Final bonding and post-op polish completed.",
        photoUrl: SAMPLE_PATIENT_IMAGES.rahul.stages.final,
        createdAt: "2026-09-10T11:00:00.000Z",
      },
    ],
  },
  {
    id: "PT-003",
    name: "Meera S",
    age: 19,
    gender: "Female",
    phone: "+1 (555) 902-1244",
    email: "meera.s@example.com",
    dentalProblems: ["misalignment", "overbite", "crowding"],
    problemDescription: "Class II Division 1 malocclusion with 5mm overjet, maxillary anterior crowding, and high-placed ectopic canine (#6).",
    treatment: "braces",
    durationMonths: 18,
    sittings: 9,
    startDate: "2026-03-01",
    originalPhotoUrl: SAMPLE_PATIENT_IMAGES.meera.original,
    progress: 30,
    status: "Active",
    nextSittingDate: "20 Oct 2026",
    createdAt: "2026-03-01T08:30:00.000Z",
    updatedAt: "2026-09-01T15:00:00.000Z",
    stages: [
      {
        id: "stage-0",
        stageName: "Initial",
        month: 0,
        date: "1 Mar 2026",
        sittingNumber: 0,
        progress: 0,
        aiImageUrl: SAMPLE_PATIENT_IMAGES.meera.stages.initial,
        actualPhotoUrl: SAMPLE_PATIENT_IMAGES.meera.original,
        status: "completed",
        dentistNotes: "Full mouth bonding with ceramic twin brackets. 0.014 NiTi upper and lower wires tied.",
      },
      {
        id: "stage-1",
        stageName: "Month 2",
        month: 2,
        date: "1 May 2026",
        sittingNumber: 1,
        progress: 11,
        aiImageUrl: SAMPLE_PATIENT_IMAGES.meera.stages.initial,
        status: "completed",
        dentistNotes: "Wire activation. Good oral hygiene maintained.",
      },
      {
        id: "stage-2",
        stageName: "Month 4",
        month: 4,
        date: "1 Jul 2026",
        sittingNumber: 2,
        progress: 22,
        aiImageUrl: SAMPLE_PATIENT_IMAGES.meera.stages.initial,
        status: "completed",
        dentistNotes: "Step up to 0.016 NiTi archwire.",
      },
      {
        id: "stage-3",
        stageName: "Month 6",
        month: 6,
        date: "1 Sep 2026",
        sittingNumber: 3,
        progress: 33,
        aiImageUrl: SAMPLE_PATIENT_IMAGES.meera.stages.month6,
        actualPhotoUrl: SAMPLE_PATIENT_IMAGES.meera.stages.month6,
        status: "current",
        dentistNotes: "0.016x0.022 stainless steel wire placed. Canine retraction initiated.",
      },
      {
        id: "stage-4",
        stageName: "Month 8",
        month: 8,
        date: "1 Nov 2026",
        sittingNumber: 4,
        progress: 44,
        aiImageUrl: SAMPLE_PATIENT_IMAGES.meera.stages.month6,
        status: "upcoming",
      },
      {
        id: "stage-5",
        stageName: "Month 10",
        month: 10,
        date: "1 Jan 2027",
        sittingNumber: 5,
        progress: 56,
        aiImageUrl: SAMPLE_PATIENT_IMAGES.meera.stages.month6,
        status: "upcoming",
      },
      {
        id: "stage-6",
        stageName: "Month 12",
        month: 12,
        date: "1 Mar 2027",
        sittingNumber: 6,
        progress: 67,
        aiImageUrl: SAMPLE_PATIENT_IMAGES.meera.stages.month12,
        status: "upcoming",
      },
      {
        id: "stage-7",
        stageName: "Month 14",
        month: 14,
        date: "1 May 2027",
        sittingNumber: 7,
        progress: 78,
        aiImageUrl: SAMPLE_PATIENT_IMAGES.meera.stages.month12,
        status: "upcoming",
      },
      {
        id: "stage-8",
        stageName: "Month 16",
        month: 16,
        date: "1 Jul 2027",
        sittingNumber: 8,
        progress: 89,
        aiImageUrl: SAMPLE_PATIENT_IMAGES.meera.stages.final,
        status: "upcoming",
      },
      {
        id: "stage-9",
        stageName: "Final — Month 18",
        month: 18,
        date: "1 Sep 2027",
        sittingNumber: 9,
        progress: 100,
        aiImageUrl: SAMPLE_PATIENT_IMAGES.meera.stages.final,
        status: "upcoming",
      },
    ],
    sittingsHistory: [
      {
        id: "sit-m-1",
        sittingNumber: 1,
        date: "1 May 2026",
        stageId: "stage-1",
        stageName: "Month 2",
        progress: 11,
        dentistNotes: "Initial wire change. Patient adjusted well to bracket sensation.",
        createdAt: "2026-05-01T10:00:00.000Z",
      },
      {
        id: "sit-m-2",
        sittingNumber: 2,
        date: "1 Jul 2026",
        stageId: "stage-2",
        stageName: "Month 4",
        progress: 22,
        dentistNotes: "Progression to rectangular wire. Ectopic canine moving into arch.",
        createdAt: "2026-07-01T10:00:00.000Z",
      },
      {
        id: "sit-m-3",
        sittingNumber: 3,
        date: "1 Sep 2026",
        stageId: "stage-3",
        stageName: "Month 6",
        progress: 33,
        dentistNotes: "Canine retraction active with power chain. Alignment noticeably improved.",
        photoUrl: SAMPLE_PATIENT_IMAGES.meera.stages.month6,
        createdAt: "2026-09-01T10:00:00.000Z",
      },
    ],
  },
];

export class PatientService {
  private _memoryPatients: Patient[] | null = null;

  private getStorage(): Patient[] {
    if (this._memoryPatients && this._memoryPatients.length > 0) {
      return this._memoryPatients;
    }

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this._memoryPatients = parsed;
          return parsed;
        }
      }
    } catch {
      // Fallback
    }

    this._memoryPatients = [...INITIAL_MOCK_PATIENTS];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._memoryPatients));
    } catch {
      // ignore
    }
    return this._memoryPatients;
  }

  private setStorage(patients: Patient[]): void {
    // 1. Always update memory cache so current SPA session is 100% reliable
    this._memoryPatients = patients;

    // 2. Attempt localStorage persistence with quota overflow protection
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
    } catch (e) {
      console.warn("Primary localStorage setItem failed (quota exceeded), applying storage compression...", e);
      try {
        const optimized = patients.map((p) => ({
          ...p,
          stages: p.stages.map((st, idx) => ({
            ...st,
            aiImageUrl:
              st.aiImageUrl && st.aiImageUrl.length > 80000 && idx > 0 && idx < p.stages.length - 1
                ? undefined
                : st.aiImageUrl,
          })),
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(optimized));
      } catch (e2) {
        console.warn("Storage fallback hit quota, keeping state in memory", e2);
      }
    }
  }

  getAll(): Patient[] {
    return this.getStorage();
  }

  getById(id: string): Patient | undefined {
    if (!id) return undefined;
    const cleanId = id.trim().toLowerCase();
    return this.getStorage().find((p) => p.id && p.id.trim().toLowerCase() === cleanId);
  }

  create(patientData: Omit<Patient, "id" | "createdAt" | "updatedAt">): Patient {
    const list = [...this.getStorage()];

    // Generate unique ID based on highest existing number
    const maxNum = list.reduce((max, p) => {
      const match = p.id.match(/^PT-(\d+)$/i);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);
    const newId = `PT-${String(maxNum + 1).padStart(3, "0")}`;

    const newPatient: Patient = {
      ...patientData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    list.unshift(newPatient);
    this.setStorage(list);
    return newPatient;
  }

  update(id: string, updates: Partial<Patient>): Patient | undefined {
    const list = this.getStorage();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) return undefined;

    const updated = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    this.setStorage(list);
    return updated;
  }

  updateStage(patientId: string, stageId: string, updates: Partial<TreatmentStage>): Patient | undefined {
    const patient = this.getById(patientId);
    if (!patient) return undefined;

    const stageIdx = patient.stages.findIndex((s) => s.id === stageId);
    if (stageIdx === -1) return undefined;

    patient.stages[stageIdx] = {
      ...patient.stages[stageIdx],
      ...updates,
    };

    return this.update(patientId, { stages: patient.stages });
  }

  addSitting(patientId: string, sitting: Omit<SittingRecord, "id" | "createdAt">): Patient | undefined {
    const patient = this.getById(patientId);
    if (!patient) return undefined;

    const newSitting: SittingRecord = {
      ...sitting,
      id: `sit-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const sittingsHistory = [...patient.sittingsHistory, newSitting];

    // Also update corresponding stage with actual photo and notes
    const stageIdx = patient.stages.findIndex((s) => s.id === sitting.stageId || s.stageName === sitting.stageName);
    if (stageIdx !== -1) {
      patient.stages[stageIdx].actualPhotoUrl = sitting.photoUrl || patient.stages[stageIdx].actualPhotoUrl;
      patient.stages[stageIdx].dentistNotes = sitting.dentistNotes || patient.stages[stageIdx].dentistNotes;
      patient.stages[stageIdx].status = "completed";
      patient.stages[stageIdx].completedAt = sitting.date;
    }

    // Recalculate patient progress based on highest sitting progress
    const progress = Math.max(patient.progress, sitting.progress);
    const status = progress >= 100 ? "Completed" : "Active";

    return this.update(patientId, {
      sittingsHistory,
      stages: patient.stages,
      progress,
      status,
    });
  }

  delete(id: string): boolean {
    const list = this.getStorage();
    const filtered = list.filter((p) => p.id !== id);
    if (filtered.length === list.length) return false;
    this.setStorage(filtered);
    return true;
  }

  reset(): void {
    this.setStorage(INITIAL_MOCK_PATIENTS);
  }
}

export const patientService = new PatientService();
