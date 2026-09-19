import React from "react";
import { Camera, CheckCircle2 } from "lucide-react";
import { SittingRecord } from "../../types";

interface SittingHistoryTableProps {
  sittings: SittingRecord[];
}

export const SittingHistoryTable: React.FC<SittingHistoryTableProps> = ({
  sittings,
}) => {
  if (sittings.length === 0) {
    return (
      <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
        No in-clinic sittings recorded yet. Baseline appointment active.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-300 overflow-hidden text-xs">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-100 border-b border-slate-300 text-[10px] font-bold uppercase tracking-wider text-slate-700">
            <th className="py-2.5 px-3">Visit #</th>
            <th className="py-2.5 px-3">Date</th>
            <th className="py-2.5 px-3">Stage</th>
            <th className="py-2.5 px-3">Progress</th>
            <th className="py-2.5 px-4">Dentist Clinical Notes</th>
            <th className="py-2.5 px-3 text-right">Actual Photo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {sittings.map((sit) => (
            <tr key={sit.id} className="hover:bg-slate-50">
              <td className="py-3 px-3 font-bold text-slate-900">
                Sitting {sit.sittingNumber}
              </td>
              <td className="py-3 px-3 text-slate-600 font-medium">
                {sit.date}
              </td>
              <td className="py-3 px-3">
                <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                  {sit.stageName}
                </span>
              </td>
              <td className="py-3 px-3 font-bold text-slate-900 font-mono">
                {sit.progress}%
              </td>
              <td className="py-3 px-4 text-slate-700 max-w-xs leading-relaxed">
                {sit.dentistNotes}
              </td>
              <td className="py-3 px-3 text-right">
                {sit.photoUrl ? (
                  <div className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Archived</span>
                  </div>
                ) : (
                  <span className="text-slate-400 italic">Not Uploaded</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
