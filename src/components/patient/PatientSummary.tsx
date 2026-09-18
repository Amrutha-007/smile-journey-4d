import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Calendar,
  Clock,
  Layers,
  FileText,
  PlusCircle,
  CheckCircle2,
} from "lucide-react";
import { Patient } from "../../types";

interface PatientSummaryProps {
  patient: Patient;
  onOpenSittingModal?: () => void;
}

export const PatientSummary: React.FC<PatientSummaryProps> = ({
  patient,
  onOpenSittingModal,
}) => {
  const treatmentLabels: Record<string, string> = {
    clear_aligners: "Clear Aligners",
    dental_veneers: "Dental Veneers",
    braces: "Fixed Braces",
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs mb-6 no-print">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: Avatar & Patient Info */}
        <div className="flex items-center gap-4">
          <div className="w-18 h-18 rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-200 shadow-sm shrink-0">
            <img
              src={patient.originalPhotoUrl}
              alt={patient.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 m-0">
                {patient.name}
              </h2>
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                {patient.id}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  patient.status === "Completed"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-sky-100 text-sky-800"
                }`}
              >
                {patient.status}
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-1">
              {patient.age} yrs • {patient.gender} • {patient.phone} • {patient.email}
            </p>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {patient.dentalProblems.map((prob) => (
                <span
                  key={prob}
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 capitalize"
                >
                  {prob.replace("_", " ")}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Treatment Quick Metrics & Actions */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
            <div className="px-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Treatment
              </span>
              <span className="text-xs font-bold text-slate-800 truncate block">
                {treatmentLabels[patient.treatment] || patient.treatment}
              </span>
            </div>
            <div className="px-2 border-l border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Duration
              </span>
              <span className="text-xs font-bold text-slate-800 block">
                {patient.durationMonths} Months
              </span>
            </div>
            <div className="px-2 border-l border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Sittings
              </span>
              <span className="text-xs font-bold text-slate-800 block">
                {patient.sittingsHistory.length} of {patient.sittings}
              </span>
            </div>
            <div className="px-2 border-l border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Progress
              </span>
              <span className="text-xs font-bold text-sky-600 block font-mono">
                {patient.progress}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/patients/${patient.id}/simulation`}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 text-white text-xs font-semibold shadow-md shadow-sky-600/20 hover:from-sky-700 hover:to-teal-700 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Simulation</span>
            </Link>

            {onOpenSittingModal && (
              <button
                type="button"
                onClick={onOpenSittingModal}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Sitting</span>
              </button>
            )}

            <Link
              to={`/patients/${patient.id}/report`}
              className="inline-flex items-center justify-center p-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
              title="Consolidated Treatment Report"
            >
              <FileText className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Treatment Progress Bar */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span>Overall Clinical Treatment Progress</span>
          <span className="font-bold text-slate-900 font-mono">{patient.progress}% Complete</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${patient.progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
