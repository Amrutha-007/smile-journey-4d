import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Activity,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { authService } from "../services/authService";
import { patientService } from "../services/patientService";
import { StatCard } from "../components/dashboard/StatCard";
import { PatientTable } from "../components/dashboard/PatientTable";
import { QuickActions } from "../components/dashboard/QuickActions";
import { MedicalDisclaimer } from "../components/ai/MedicalDisclaimer";

export const DashboardPage: React.FC = () => {
  const doctor = authService.getCurrentUser();
  const patients = patientService.getAll();

  const totalPatients = patients.length + 21; // Combined mock count
  const activeTreatments = patients.filter((p) => p.status === "Active").length + 14;
  const completedTreatments = patients.filter((p) => p.status === "Completed").length + 7;
  const upcomingSittings = 5;

  const ananya = patients.find((p) => p.name.includes("Ananya")) || patients[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full">
            Clinical Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-2 mb-1">
            Good morning, {doctor.name.split(",")[0]}
          </h1>
          <p className="text-sm text-slate-500">
            Here is your treatment progression overview at {doctor.clinicName}.
          </p>
        </div>

        <Link
          to="/patients/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-md shadow-sky-600/20 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>New Patient Smile Design</span>
        </Link>
      </div>

      {/* Featured Patient Journey Showcase Banner (Ananya Menon Case) */}
      {ananya && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border-2 border-sky-400/40 shrink-0">
                <img
                  src={ananya.originalPhotoUrl}
                  alt={ananya.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-400 text-xs font-bold uppercase">
                    Featured Case
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{ananya.id}</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">{ananya.name}</h3>
                <p className="text-xs text-slate-300">
                  Clear Aligners • 12 Months • Stage 3 (Month 6 Check) • 50% Progress
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right text-xs pr-4 border-r border-slate-800 text-slate-300">
                <p className="font-semibold text-white">Interactive Slider Ready</p>
                <p className="text-slate-400">Compare baseline with 7 AI stages</p>
              </div>

              <Link
                to={`/patients/${ananya.id}/simulation`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/25 transition-all transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Smile Simulation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Patients"
          value={totalPatients}
          subtitle="Registered clinical charts"
          icon={Users}
          trend="+12% this month"
          color="sky"
        />
        <StatCard
          label="Active Treatments"
          value={activeTreatments}
          subtitle="Ongoing aligners & veneers"
          icon={Activity}
          trend="16 active tracking"
          color="teal"
        />
        <StatCard
          label="Completed Treatments"
          value={completedTreatments}
          subtitle="Full aesthetic outcomes"
          icon={CheckCircle2}
          trend="100% satisfaction"
          color="emerald"
        />
        <StatCard
          label="Upcoming Sittings"
          value={upcomingSittings}
          subtitle="Visits scheduled this week"
          icon={Calendar}
          color="amber"
        />
      </div>

      {/* Main Grid: Patients Table + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Recent Patient Cases
              </h3>
              <p className="text-xs text-slate-500">
                Latest smile simulations and ongoing sitting schedules
              </p>
            </div>
            <Link
              to="/patients"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <span>View All Patients</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <PatientTable patients={patients} />
        </div>

        <div className="space-y-6">
          <QuickActions />
          <MedicalDisclaimer compact />
        </div>
      </div>
    </div>
  );
};
