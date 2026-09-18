import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Sparkles,
  Camera,
  Layers,
  PlusCircle,
  FileText,
  Clock,
  Calendar,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Activity,
  Edit,
} from "lucide-react";
import { patientService } from "../services/patientService";
import { Patient, TreatmentStage } from "../types";
import { PatientSummary } from "../components/patient/PatientSummary";
import { PatientTabs } from "../components/patient/PatientTabs";
import { SittingModal } from "../components/treatment/SittingModal";
import { SittingHistoryTable } from "../components/report/SittingHistoryTable";
import { MedicalDisclaimer } from "../components/ai/MedicalDisclaimer";

export const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isSittingModalOpen, setIsSittingModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const p = patientService.getById(id);
    if (p) setPatient(p);
  }, [id]);

  if (!patient) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Patient record not found</h3>
        <Link to="/patients" className="text-sm font-semibold text-sky-600 hover:underline">
          Return to Patients Roster
        </Link>
      </div>
    );
  }

  const treatmentLabels: Record<string, string> = {
    clear_aligners: "Clear Aligners",
    dental_veneers: "Dental Veneers",
    braces: "Fixed Braces",
  };

  const finalStage = patient.stages[patient.stages.length - 1];

  return (
    <div className="space-y-6">
      <PatientSummary
        patient={patient}
        onOpenSittingModal={() => setIsSittingModalOpen(true)}
      />

      <PatientTabs patientId={patient.id} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Initial Assessment + Simulation Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Diagnostic Assessment Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                  Clinical Intake
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Baseline Diagnostic Assessment
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-xs">
                <img
                  src={patient.originalPhotoUrl}
                  alt="Original Smile Baseline"
                  className="w-full h-44 object-cover"
                />
                <div className="p-2 bg-slate-900 text-center text-[10px] font-semibold text-slate-300">
                  Baseline Clinical Smile
                </div>
              </div>

              <div className="sm:col-span-2 space-y-3 text-xs">
                <div>
                  <span className="font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Identified Problems
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {patient.dentalProblems.map((prob) => (
                      <span
                        key={prob}
                        className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 font-bold capitalize border border-sky-100"
                      >
                        {prob.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Dentist Clinical Description
                  </span>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                    {patient.problemDescription}
                  </p>
                </div>

                {patient.additionalNotes && (
                  <div>
                    <span className="font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Patient Notes & Preferences
                    </span>
                    <p className="text-slate-600 italic leading-relaxed">
                      "{patient.additionalNotes}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Smile Simulation Hero Spotlight Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 w-max">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>AI Simulation Spotlight</span>
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Prospective Treatment Outcome
                </h3>
              </div>
              <Link
                to={`/patients/${patient.id}/simulation`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shadow-lg shadow-sky-500/25 transition-all"
              >
                <span>Interactive Before/After Slider</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative">
                <img
                  src={patient.originalPhotoUrl}
                  alt="Baseline"
                  className="w-full aspect-[4/3] object-contain"
                />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-[10px] font-bold text-slate-300">
                  Baseline (Original)
                </div>
              </div>

              <div className="rounded-xl overflow-hidden bg-slate-950 border border-sky-500/40 relative">
                <img
                  src={finalStage?.aiImageUrl || patient.originalPhotoUrl}
                  alt="Final AI Simulation"
                  className="w-full aspect-[4/3] object-contain"
                />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-sky-950/85 text-[10px] font-bold text-sky-300 flex items-center gap-1 border border-sky-500/50">
                  <Sparkles className="w-3 h-3 text-sky-400" />
                  <span>Final AI Simulation</span>
                </div>
              </div>
            </div>

            <MedicalDisclaimer compact />
          </div>

          {/* Sittings History Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Clinical Sitting History ({patient.sittingsHistory.length} of {patient.sittings})
                </h4>
                <p className="text-xs text-slate-500">
                  Archived doctor visit notes and verified chairside photos
                </p>
              </div>
              <button
                onClick={() => setIsSittingModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5 text-teal-400" />
                <span>Add Sitting</span>
              </button>
            </div>

            <SittingHistoryTable sittings={patient.sittingsHistory} />
          </div>
        </div>

        {/* Right 1 col: Prescription & Quick Stage Timeline */}
        <div className="space-y-6">
          {/* Prescription Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm">Treatment Prescription</h4>
              <Link
                to={`/patients/${patient.id}/treatment`}
                className="text-xs font-semibold text-sky-600 hover:underline"
              >
                Configure
              </Link>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Modality</span>
                <span className="font-bold text-slate-800">{treatmentLabels[patient.treatment]}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Duration</span>
                <span className="font-bold text-slate-800">{patient.durationMonths} Months</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Total Sittings</span>
                <span className="font-bold text-slate-800">{patient.sittings} Planned</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Start Date</span>
                <span className="font-bold text-slate-800">{patient.startDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Next Sitting</span>
                <span className="font-bold text-sky-600">{patient.nextSittingDate || "Completed"}</span>
              </div>
            </div>
          </div>

          {/* Quick Stages List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">
              Treatment Stages ({patient.stages.length})
            </h4>

            <div className="space-y-2.5">
              {patient.stages.map((stage) => (
                <Link
                  key={stage.id}
                  to={`/patients/${patient.id}/simulation`}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50/30 transition-all text-xs group"
                >
                  <div>
                    <span className="font-bold text-slate-900 group-hover:text-sky-600">
                      {stage.stageName}
                    </span>
                    <span className="text-slate-400 block text-[11px]">{stage.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700">{stage.progress}%</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SittingModal
        isOpen={isSittingModalOpen}
        patient={patient}
        onClose={() => setIsSittingModalOpen(false)}
        onSubmit={(sitting) => {
          const updated = patientService.addSitting(patient.id, sitting);
          if (updated) setPatient(updated);
        }}
      />
    </div>
  );
};
