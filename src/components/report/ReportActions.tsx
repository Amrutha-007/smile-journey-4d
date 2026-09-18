import React, { useState } from "react";
import { Download, Printer, Share2, Check, Sparkles } from "lucide-react";
import { Patient } from "../../types";
import { reportService } from "../../services/reportService";

interface ReportActionsProps {
  patient: Patient;
}

export const ReportActions: React.FC<ReportActionsProps> = ({ patient }) => {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    reportService.printReport();
  };

  const handleDownload = () => {
    // Triggers browser print to PDF / save
    window.print();
  };

  const handleShare = async () => {
    await reportService.shareReport(patient.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex items-center gap-2.5 no-print">
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-700">Link Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Share Report</span>
          </>
        )}
      </button>

      <button
        onClick={handlePrint}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
      >
        <Printer className="w-3.5 h-3.5 text-slate-500" />
        <span>Print Report</span>
      </button>

      <button
        onClick={handleDownload}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm shadow-sky-600/20 transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Download PDF</span>
      </button>
    </div>
  );
};
