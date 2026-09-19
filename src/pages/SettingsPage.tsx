import React, { useState } from "react";
import {
  Settings,
  Sparkles,
  ShieldCheck,
  Save,
  RotateCcw,
  CheckCircle2,
  Key,
  Building,
  User,
} from "lucide-react";
import { authService } from "../services/authService";
import { patientService } from "../services/patientService";

export const SettingsPage: React.FC = () => {
  const doctor = authService.getCurrentUser();

  // Profile state
  const [name, setName] = useState(doctor.name);
  const [email, setEmail] = useState(doctor.email);
  const [phone, setPhone] = useState(doctor.phone);
  const [clinicName, setClinicName] = useState(doctor.clinicName);
  const [specialization, setSpecialization] = useState(doctor.specialization);
  const [licenseNumber, setLicenseNumber] = useState(doctor.licenseNumber || "DDS-948210");

  // AI Service integration settings
  const [apiKey, setApiKey] = useState(
    localStorage.getItem("smileprogress_gemini_api_key") || ""
  );
  const [aiModel, setAiModel] = useState("built_in_calibrated");
  const [isSavedToast, setIsSavedToast] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    authService.updateProfile({
      name,
      email,
      phone,
      clinicName,
      specialization,
      licenseNumber,
    });
    localStorage.setItem("smileprogress_gemini_api_key", apiKey);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2500);
  };

  const handleResetData = () => {
    if (window.confirm("Reset all patient data to default demo cases (Ananya Menon, Rahul Kumar, Meera S)?")) {
      patientService.reset();
      alert("Database reset to pristine demo state!");
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full">
          Administration
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-2 mb-1">
          Clinic & AI Service Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Configure doctor credentials, practice letterhead branding, and AI simulation engine endpoints.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Doctor & Practice Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Clinic & Doctor Profile</h3>
              <p className="text-xs text-slate-500">Displayed on consolidated digital smile treatment reports</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Attending Doctor Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-sky-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Dental License / Registration #
              </label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-sky-500 font-medium font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Clinic / Practice Name
              </label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-sky-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Clinical Specialization
              </label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-sky-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-sky-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-sky-500 font-medium"
                required
              />
            </div>
          </div>
        </div>

        {/* AI Service & Model Abstraction */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">AI Simulation Service Pipeline</h3>
              <p className="text-xs text-slate-500">Configure pretrained image-editing model connection or use built-in simulator</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Active Simulation Engine
              </label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-sky-500 bg-white font-medium"
              >
                <option value="built_in_calibrated">
                  Built-in Calibrated Dental Simulator (Fast & Procedural SVG/Canvas)
                </option>
                <option value="gemini_imagen">
                  Google Gemini 2.0 / Imagen Multi-modal Image Editing (API Key Required)
                </option>
                <option value="flux_kontext">
                  FLUX Kontext Custom Diffusion Endpoint
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Gemini / AI Provider API Key (Optional)
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy... (Leave empty to use built-in dental simulation engine)"
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-sky-500 font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                The frontend operates seamlessly offline and online using calibrated procedural progressions when no external key is provided.
              </p>
            </div>
          </div>
        </div>

        {/* Save & Reset Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleResetData}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Data to Factory Defaults</span>
          </button>

          <div className="flex items-center gap-3">
            {isSavedToast && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Settings saved!</span>
              </span>
            )}

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-md shadow-sky-600/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Clinic Settings</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
