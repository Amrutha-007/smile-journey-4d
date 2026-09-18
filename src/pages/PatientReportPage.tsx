import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Sparkles,
  Camera,
  Calendar,
  Layers,
  Award,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Printer,
  Download,
  Share2,
} from "lucide-react";
import { patientService } from "../services/patientService";
import { Patient } from "../types";
import { ReportHeader } from "../components/report/ReportHeader";
import { ReportSection } from "../components/report/ReportSection";
import { SittingHistoryTable } from "../components/report/SittingHistoryTable";
import { ReportActions } from "../components/report/ReportActions";
import { MedicalDisclaimer } from "../components/ai/MedicalDisclaimer";
import { PatientTabs } from "../components/patient/PatientTabs";

export const PatientReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);

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

  const parsedStart = new Date(patient.startDate);
  const validStart = isNaN(parsedStart.getTime()) ? new Date() : parsedStart;
  const completionDate = new Date(validStart);
  completionDate.setMonth(completionDate.getMonth() + patient.durationMonths);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Navbar Actions (Hidden on Print) */}
      <div className="flex items-center justify-between no-print">
        <Link
          to={`/patients/${patient.id}`}
          className="text-xs font-semibold text-sky-600 hover:underline flex items-center gap-1"
        >
          <span>← Return to Patient Chart</span>
        </Link>
        <ReportActions patient={patient} />
      </div>

      <div className="no-print">
        <PatientTabs patientId={patient.id} />
      </div>

      {/* Main Printable Document Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-300 shadow-xl print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <ReportHeader patient={patient} />

        {/* 1. INITIAL ASSESSMENT */}
        <ReportSection title="1. Initial Diagnostic Assessment" icon={FileText}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="md:col-span-1 rounded-xl overflow-hidden bg-slate-900 border border-slate-300 shadow-2xs">
              <img
                src={patient.originalPhotoUrl}
                alt="Baseline Smile"
                className="w-full h-44 object-cover"
              />
              <div className="py-1 px-2 bg-slate-900 text-center text-[10px] font-bold text-slate-300 uppercase">
                Baseline Smile Photograph
              </div>
            </div>

            <div className="md:col-span-2 space-y-3 text-xs">
              <div>
                <span className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Identified Dental Problems:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {patient.dentalProblems.map((prob) => (
                    <span
                      key={prob}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-300 text-slate-800 font-bold capitalize"
                    >
                      {prob.replace("_", " ")}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Doctor Clinical Assessment:
                </span>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {patient.problemDescription}
                </p>
              </div>

              {patient.additionalNotes && (
                <div>
                  <span className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Special Instructions / Notes:
                  </span>
                  <p className="text-slate-600 italic">
                    {patient.additionalNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </ReportSection>

        {/* 2. TREATMENT PLAN SPECIFICATION */}
        <ReportSection title="2. Prescribed Treatment Plan & Timeline" icon={Calendar}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Selected Modality</span>
              <span className="font-bold text-slate-900 text-sm">{treatmentLabels[patient.treatment]}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Prescribed Duration</span>
              <span className="font-bold text-slate-900 text-sm">{patient.durationMonths} Months</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Planned Sittings</span>
              <span className="font-bold text-slate-900 text-sm">{patient.sittings} Clinical Visits</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Target Completion</span>
              <span className="font-bold text-slate-900 text-sm">
                {completionDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
            <span className="font-bold uppercase text-[11px] text-slate-600">Calculated Progression:</span>
            <span className="font-mono font-bold text-sky-800">
              Initial → {patient.stages.slice(1, -1).map((s) => s.stageName).join(" → ")} → {patient.stages[patient.stages.length - 1]?.stageName}
            </span>
          </div>
        </ReportSection>

        {/* 3. SMILE VISUALIZATION (AI SIMULATIONS) */}
        <ReportSection title="3. Potential Smile Visualizations (AI Simulation)" icon={Sparkles}>
          <p className="text-xs text-slate-500 mb-4">
            Prospective aesthetic stages generated for educational communication and visual alignment tracking.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {patient.stages.map((stage) => (
              <div
                key={stage.id}
                className="rounded-xl border border-slate-300 overflow-hidden bg-slate-900 text-white"
              >
                <div className="aspect-[4/3] w-full flex items-center justify-center bg-slate-950">
                  <img
                    src={stage.aiImageUrl || patient.originalPhotoUrl}
                    alt={stage.stageName}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-2 text-center bg-slate-900 border-t border-slate-800">
                  <span className="text-[11px] font-bold block text-white">{stage.stageName}</span>
                  <span className="text-[9px] font-semibold text-sky-400 font-mono">
                    AI SIMULATION • {stage.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ReportSection>

        {/* 4. ACTUAL PROGRESS & SITTING PHOTOS */}
        <ReportSection title="4. Verified Clinical Sitting Record" icon={Camera}>
          <div className="space-y-4">
            <SittingHistoryTable sittings={patient.sittingsHistory} />
          </div>
        </ReportSection>

        {/* 5. CHRONOLOGICAL CLINICAL OBSERVATIONS */}
        <ReportSection title="5. Chronological Dentist Notes & Observations" icon={Clock}>
          <div className="space-y-2 text-xs">
            {patient.stages
              .filter((s) => s.dentistNotes)
              .map((st) => (
                <div key={st.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">
                      {st.stageName} ({st.date})
                    </span>
                    <span className="text-slate-400 font-mono">{st.progress}% Complete</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium">{st.dentistNotes}</p>
                </div>
              ))}
          </div>
        </ReportSection>

        {/* 6. MANDATORY CLINICAL DISCLAIMER */}
        <div className="mt-8 pt-6 border-t-2 border-slate-300">
          <MedicalDisclaimer />
        </div>

        {/* Signatures for Print */}
        <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
          <div>
            <div className="h-10 border-b border-slate-400 w-48 mb-1"></div>
            <p className="font-bold text-slate-900">Attending Dental Surgeon</p>
            <p className="text-slate-500">Date & Clinical Stamp</p>
          </div>
          <div className="text-right">
            <div className="h-10 border-b border-slate-400 w-48 ml-auto mb-1"></div>
            <p className="font-bold text-slate-900">Patient Acknowledgement</p>
            <p className="text-slate-500">Digital Consent on File</p>
          </div>
        </div>
      </div>
    </div>
  );
};
