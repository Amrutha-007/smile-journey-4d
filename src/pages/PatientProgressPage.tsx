import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Sparkles,
  Camera,
  Layers,
  PlusCircle,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { patientService } from "../services/patientService";
import { Patient, TreatmentStage } from "../types";
import { PatientSummary } from "../components/patient/PatientSummary";
import { PatientTabs } from "../components/patient/PatientTabs";
import { SittingModal } from "../components/treatment/SittingModal";
import { MedicalDisclaimer } from "../components/ai/MedicalDisclaimer";

export const PatientProgressPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [viewFilter, setViewFilter] = useState<"all" | "ai" | "actual">("all");
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

  return (
    <div className="space-y-6">
      <PatientSummary
        patient={patient}
        onOpenSittingModal={() => setIsSittingModalOpen(true)}
      />

      <PatientTabs patientId={patient.id} />

      {/* Header & Filter Controls */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-full">
              Progression Matrix
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">
              AI Simulation vs. Actual Clinical Sitting Photographs
            </h3>
            <p className="text-xs text-slate-500">
              Direct comparison between prospective AI projections and verified in-clinic chairside photographs.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewFilter === "all" ? "bg-white text-sky-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Side-by-Side Matrix
            </button>
            <button
              onClick={() => setViewFilter("ai")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewFilter === "ai" ? "bg-white text-sky-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              AI Simulations Only
            </button>
            <button
              onClick={() => setViewFilter("actual")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewFilter === "actual" ? "bg-white text-emerald-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Actual Photos Only
            </button>
          </div>
        </div>

        <MedicalDisclaimer compact />

        {/* Stage Comparison Grid */}
        <div className="space-y-6">
          {patient.stages.map((stage) => {
            return (
              <div
                key={stage.id}
                className="rounded-2xl border border-slate-200 p-5 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                {/* Stage Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs">
                      {stage.sittingNumber}
                    </span>
                    <div>
                      <h4 className="font-bold text-base text-slate-900">{stage.stageName}</h4>
                      <p className="text-xs text-slate-400">
                        {stage.date} • Month {stage.month} of {patient.durationMonths}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
                      {stage.progress}% Progress
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        stage.status === "completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-sky-100 text-sky-800"
                      }`}
                    >
                      {stage.status}
                    </span>
                  </div>
                </div>

                {/* Images Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: AI Potential Simulation */}
                  {(viewFilter === "all" || viewFilter === "ai") && (
                    <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative group">
                      <div className="aspect-[4/3] w-full flex items-center justify-center">
                        <img
                          src={stage.aiImageUrl || patient.originalPhotoUrl}
                          alt={`AI Simulation - ${stage.stageName}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-sky-950/85 backdrop-blur-xs border border-sky-500/50 text-sky-300 text-[11px] font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                        <span>AI SIMULATION (Potential Outcome)</span>
                      </div>
                    </div>
                  )}

                  {/* Right: Actual Sitting Photo */}
                  {(viewFilter === "all" || viewFilter === "actual") && (
                    <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 relative flex flex-col justify-between">
                      {stage.actualPhotoUrl ? (
                        <>
                          <div className="aspect-[4/3] w-full flex items-center justify-center">
                            <img
                              src={stage.actualPhotoUrl}
                              alt={`Actual Photo - ${stage.stageName}`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-emerald-950/85 backdrop-blur-xs border border-emerald-500/50 text-emerald-300 text-[11px] font-bold flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5 text-emerald-400" />
                            <span>ACTUAL SITTING PHOTO (Clinical Record)</span>
                          </div>
                        </>
                      ) : (
                        <div className="aspect-[4/3] w-full flex flex-col items-center justify-center p-6 text-center bg-slate-100 border border-dashed border-slate-300 rounded-2xl">
                          <Camera className="w-8 h-8 text-slate-300 mb-2" />
                          <p className="text-xs font-semibold text-slate-700 mb-1">
                            Actual Visit Photo Not Uploaded
                          </p>
                          <p className="text-[11px] text-slate-400 max-w-xs mb-4">
                            Patient has not attended Sitting #{stage.sittingNumber} or photo has not been archived yet.
                          </p>
                          <button
                            onClick={() => setIsSittingModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                          >
                            <PlusCircle className="w-3.5 h-3.5 text-teal-400" />
                            <span>Record Sitting & Photo</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Dentist Notes For this stage */}
                {stage.dentistNotes && (
                  <div className="mt-3 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700">
                    <strong className="text-slate-900">Dentist Clinical Notes:</strong> {stage.dentistNotes}
                  </div>
                )}
              </div>
            );
          })}
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
