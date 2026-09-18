import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Calendar, ChevronRight } from "lucide-react";
import { Patient } from "../../types";

interface PatientCardProps {
  patient: Patient;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient }) => {
  const treatmentLabels: Record<string, string> = {
    clear_aligners: "Clear Aligners",
    dental_veneers: "Dental Veneers",
    braces: "Fixed Braces",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0">
              <img
                src={patient.originalPhotoUrl}
                alt={patient.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base leading-tight group-hover:text-sky-600 transition-colors">
                {patient.name}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {patient.id} • {patient.age} yrs
              </p>
            </div>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              patient.status === "Completed"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-sky-100 text-sky-800"
            }`}
          >
            {patient.status}
          </span>
        </div>

        {/* Treatment & Problem */}
        <div className="mb-4">
          <div className="inline-block text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 mb-2">
            {treatmentLabels[patient.treatment] || patient.treatment}
          </div>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {patient.problemDescription}
          </p>
        </div>

        {/* Treatment Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs py-2.5 border-y border-slate-100 mb-4 text-slate-600">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Schedule
            </span>
            <span className="font-medium text-slate-800">
              {patient.durationMonths}M ({patient.sittings} visits)
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Next Sitting
            </span>
            <span className="font-medium text-slate-800">
              {patient.nextSittingDate || "Completed"}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Treatment Progress</span>
            <span className="font-bold text-slate-900 font-mono">{patient.progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-500 rounded-full transition-all"
              style={{ width: `${patient.progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex items-center gap-2">
        <Link
          to={`/patients/${patient.id}/simulation`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-sky-50 text-sky-700 text-xs font-semibold hover:bg-sky-100 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Simulation</span>
        </Link>

        <Link
          to={`/patients/${patient.id}`}
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          title="View Patient Chart"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
