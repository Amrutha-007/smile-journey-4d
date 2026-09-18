import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { authService } from "../services/authService";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("dr.wright@smileprogress.dental");
  const [password, setPassword] = useState("doctor123");
  const [rememberMe, setRememberMe] = useState(true);

  // Register state
  const [doctorName, setDoctorName] = useState("Dr. Elena Vance, DDS");
  const [phone, setPhone] = useState("+1 (555) 892-4411");
  const [clinicName, setClinicName] = useState("Vance Advanced Aesthetic Institute");
  const [specialization, setSpecialization] = useState("Digital Orthodontics & Smile Aesthetics");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    authService.login(email);
    navigate("/dashboard");
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    authService.register({
      name: doctorName,
      email,
      phone,
      clinicName,
      specialization,
    });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col lg:flex-row text-slate-100 font-sans">
      {/* Left Brand Panel */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 border-b lg:border-b-0 lg:border-r border-slate-800">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-sky-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white">SmileProgress</span>
              <span className="text-xs block text-sky-400 font-semibold tracking-wider uppercase">
                Digital Smile Design Studio
              </span>
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-lg mb-4">
            Visualize the journey to a better smile.
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-md leading-relaxed">
            Prescribe orthodontic and cosmetic treatment timelines with automated clinical stages, AI-generated prospective smile visual simulations, and consolidated treatment reports.
          </p>
        </div>

        {/* Feature Highlights Card */}
        <div className="relative z-10 my-10 lg:my-0 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-100">Doctor Prescribed Source of Truth</p>
                <p className="text-slate-400">Independent timeline engine based on clinical sittings and duration.</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-100">Potential AI Simulation Modeling</p>
                <p className="text-slate-400">Preserves patient identity and skin tone while simulating smile progression.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-teal-500" />
          <span>Dental SaaS Platform • Clinical Communication Prototype</span>
        </div>
      </div>

      {/* Right Login / Register Form */}
      <div className="lg:w-1/2 p-6 sm:p-12 lg:p-16 flex items-center justify-center bg-slate-900">
        <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-100">
          {!isRegistering ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-slate-900">
                  Welcome back
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Sign in to access your digital patient charts and simulations.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Doctor Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-hidden font-medium"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Password
                  </label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Demo password is preset: doctor123"); }} className="text-xs text-sky-600 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-hidden font-medium"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500 border-slate-300 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-xs text-slate-600 cursor-pointer select-none">
                  Remember my credentials
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-98"
              >
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-4 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsRegistering(true)}
                    className="font-bold text-sky-600 hover:underline"
                  >
                    Create account
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* Create Account Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-slate-900">
                  Create Doctor Account
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Join SmileProgress to manage aesthetic & orthodontic patient simulations.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Doctor Name
                  </label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Clinic Name
                </label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Specialization
                </label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    defaultValue="doctor123"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    defaultValue="doctor123"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all mt-2"
              >
                <span>Create Doctor Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="pt-3 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="text-xs text-sky-600 font-bold hover:underline"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
