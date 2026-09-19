import React from "react";
import { Link } from "react-router-dom";
import { UserPlus, Camera, FileText, Sparkles, ArrowRight } from "lucide-react";

export const QuickActions: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl border border-slate-700/80 relative overflow-hidden">
      {/* Subtle Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Clinical Quick Actions</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight mb-1 text-white">
          Digital Smile Studio
        </h3>
        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
          Create new patient treatment plans, trigger AI simulations, or generate clinical PDF reports.
        </p>

        <div className="space-y-2.5">
          <Link
            to="/patients/new"
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm transition-all shadow-md shadow-sky-600/30 group"
          >
            <div className="flex items-center gap-3">
              <UserPlus className="w-4 h-4" />
              <span>Create New Patient</span>
            </div>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            to="/patients/new?step=upload"
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm transition-all border border-slate-700/70"
          >
            <div className="flex items-center gap-3">
              <Camera className="w-4 h-4 text-teal-400" />
              <span>Upload Patient Smile Photo</span>
            </div>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/patients/PT-001/report"
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm transition-all border border-slate-700/70"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-sky-400" />
              <span>View Consolidated Reports</span>
            </div>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
