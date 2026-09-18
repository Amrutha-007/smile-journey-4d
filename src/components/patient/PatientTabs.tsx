import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  User,
  Activity,
  Sparkles,
  GitCommit,
  CalendarCheck,
  FileText,
} from "lucide-react";

interface PatientTabsProps {
  patientId: string;
}

export const PatientTabs: React.FC<PatientTabsProps> = ({ patientId }) => {
  const location = useLocation();

  const tabs = [
    { label: "Overview", icon: User, path: `/patients/${patientId}` },
    { label: "Treatment Plan", icon: Activity, path: `/patients/${patientId}/treatment` },
    { label: "Smile Simulation", icon: Sparkles, path: `/patients/${patientId}/simulation` },
    { label: "Stage Progress", icon: GitCommit, path: `/patients/${patientId}/progress` },
    { label: "Consolidated Report", icon: FileText, path: `/patients/${patientId}/report` },
  ];

  return (
    <div className="flex items-center gap-1 border-b border-slate-200 mb-6 overflow-x-auto no-print">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        const Icon = tab.icon;

        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
              isActive
                ? "border-sky-600 text-sky-700 bg-sky-50/40 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? "text-sky-600" : "text-slate-400"}`} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
};
