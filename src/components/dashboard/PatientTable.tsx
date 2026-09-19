import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ChevronRight, FileText, Trash2 } from "lucide-react";
import { Patient } from "../../types";

interface PatientTableProps {
  patients: Patient[];
  onDelete?: (id: string) => void;
}

export const PatientTable: React.FC<PatientTableProps> = ({ patients, onDelete }) => {
  const treatmentLabels: Record<string, string> = {
    clear_aligners: "Clear Aligners",
    dental_veneers: "Dental Veneers",
    braces: "Fixed Braces",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3.5 px-5">Patient</th>
              <th className="py-3.5 px-4">Treatment</th>
              <th className="py-3.5 px-4">Progress</th>
              <th className="py-3.5 px-4">Next Sitting</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {patients.map((patient) => (
              <tr
                key={patient.id}
                className="hover:bg-slate-50/70 transition-colors group"
              >
                {/* Patient */}
                <td className="py-4 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0">
                      <img
                        src={patient.originalPhotoUrl}
                        alt={patient.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <Link
                        to={`/patients/${patient.id}`}
                        className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors block"
                      >
                        {patient.name}
                      </Link>
                      <span className="text-xs text-slate-400 font-mono">
                        {patient.id} • {patient.age} yrs
                      </span>
                    </div>
                  </div>
                </td>

                {/* Treatment */}
                <td className="py-4 px-4">
                  <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                    {treatmentLabels[patient.treatment] || patient.treatment}
                  </span>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {patient.durationMonths}M ({patient.sittings} visits)
                  </div>
                </td>

                {/* Progress */}
                <td className="py-4 px-4 min-w-[140px]">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span className="font-mono">{patient.progress}%</span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      Sit {patient.sittingsHistory.length}/{patient.sittings}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full transition-all"
                      style={{ width: `${patient.progress}%` }}
                    ></div>
                  </div>
                </td>

                {/* Next Sitting */}
                <td className="py-4 px-4 text-xs font-medium text-slate-700">
                  {patient.nextSittingDate || (
                    <span className="text-slate-400 italic">Completed</span>
                  )}
                </td>

                {/* Status */}
                <td className="py-4 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      patient.status === "Completed"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-sky-100 text-sky-800"
                    }`}
                  >
                    {patient.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-4 px-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/patients/${patient.id}/simulation`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-semibold transition-colors"
                      title="View AI Smile Simulation"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Simulation</span>
                    </Link>
                    <Link
                      to={`/patients/${patient.id}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      title="View Patient Chart"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    {onDelete && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onDelete(patient.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Patient Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
