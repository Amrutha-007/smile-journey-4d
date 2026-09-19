import React from "react";
import { Sparkles, Award } from "lucide-react";
import { Patient } from "../../types";
import { authService } from "../../services/authService";

interface ReportHeaderProps {
  patient: Patient;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({ patient }) => {
  const doctor = authService.getCurrentUser();

  const treatmentLabels: Record<string, string> = {
    clear_aligners: "Clear Aligners",
    dental_veneers: "Dental Veneers",
    braces: "Fixed Braces",
  };

  return (
    <div className="border-b-2 border-slate-900 pb-6 mb-8">
      {/* Top Clinic Branding */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 m-0">
              {doctor.clinicName.toUpperCase()}
            </h1>
            <p className="text-xs font-semibold text-sky-700 tracking-wider uppercase">
              Digital Smile Design & Aesthetic Rehabilitation Division
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right text-xs text-slate-600">
          <p className="font-bold text-slate-900">{doctor.name}</p>
          <p>{doctor.specialization}</p>
          <p className="text-slate-500 font-mono">Lic: {doctor.licenseNumber || "DDS-948210"}</p>
          <p>{doctor.phone} • {doctor.email}</p>
        </div>
      </div>

      {/* Report Title */}
      <div className="bg-slate-900 text-white py-2.5 px-4 rounded-xl flex items-center justify-between mb-6">
        <span className="text-xs sm:text-sm font-bold tracking-widest uppercase">
          DIGITAL SMILE TREATMENT & PROGRESSION REPORT
        </span>
        <span className="text-xs text-slate-300 font-mono">
          DOC ID: SP-{patient.id}-{new Date().getFullYear()}
        </span>
      </div>

      {/* Patient & Prescription Details Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
        <div>
          <span className="text-slate-400 uppercase font-bold text-[10px] block">Patient Name</span>
          <span className="font-bold text-slate-900 text-sm">{patient.name}</span>
        </div>
        <div>
          <span className="text-slate-400 uppercase font-bold text-[10px] block">Patient ID & Age</span>
          <span className="font-bold text-slate-800">{patient.id} • {patient.age} yrs ({patient.gender})</span>
        </div>
        <div>
          <span className="text-slate-400 uppercase font-bold text-[10px] block">Prescribed Treatment</span>
          <span className="font-bold text-sky-700">{treatmentLabels[patient.treatment]}</span>
        </div>
        <div>
          <span className="text-slate-400 uppercase font-bold text-[10px] block">Prescribed Duration</span>
          <span className="font-bold text-slate-800">{patient.durationMonths} Months ({patient.sittings} Sittings)</span>
        </div>
      </div>
    </div>
  );
};
