import React from "react";
import { Info, Sparkles } from "lucide-react";

interface MedicalDisclaimerProps {
  compact?: boolean;
  className?: string;
}

export const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({
  compact = false,
  className = "",
}) => {
  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-200/80 text-sky-950 text-xs ${className}`}
      >
        <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
        <span className="font-medium">
          <strong>AI Simulation:</strong> Potential visual outcome for communication & education only. Not a guaranteed clinical result.
        </span>
      </div>
    );
  }

  return (
    <div
      className={`p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-slate-50 to-teal-50/40 border border-sky-200/90 text-slate-800 shadow-xs ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Potential Treatment Simulation</span>
              <span className="text-[11px] font-semibold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">
                Clinical Educational Aid
              </span>
            </h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong>AI Simulation Notice:</strong> This visualization represents a prospective treatment projection based on the prescribed orthodontic or cosmetic plan. It serves strictly as an educational and patient communication aid. Biological response, patient compliance, tissue biotype, and clinical variables may affect actual physical results. This simulation does not replace in-person dental diagnosis or guaranteed clinical outcomes.
          </p>
        </div>
      </div>
    </div>
  );
};
