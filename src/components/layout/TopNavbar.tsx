import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  UserPlus,
  Sparkles,
  CheckCircle2,
  Clock,
  Menu,
} from "lucide-react";
import { authService } from "../../services/authService";
import { patientService } from "../../services/patientService";

interface TopNavbarProps {
  onToggleSidebar?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const doctor = authService.getCurrentUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const allPatients = patientService.getAll();
  const filteredPatients = searchQuery.trim()
    ? allPatients.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.treatment.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const notifications = [
    {
      id: 1,
      title: "Upcoming Sitting Today",
      desc: "Ananya Menon • Sitting 3 (Month 6 Check)",
      time: "10:30 AM",
      icon: Clock,
      color: "text-amber-500 bg-amber-50",
      link: "/patients/PT-001/simulation",
    },
    {
      id: 2,
      title: "AI Simulation Complete",
      desc: "All 7 stages rendered for Ananya Menon",
      time: "1 hour ago",
      icon: Sparkles,
      color: "text-sky-500 bg-sky-50",
      link: "/patients/PT-001/simulation",
    },
    {
      id: 3,
      title: "Treatment Milestone",
      desc: "Rahul Kumar finished 3-month veneer schedule",
      time: "Yesterday",
      icon: CheckCircle2,
      color: "text-emerald-500 bg-emerald-50",
      link: "/patients/PT-002/report",
    },
  ];

  return (
    <header className="h-18 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs no-print">
      {/* Left: Mobile Menu & Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <div className="flex items-center bg-slate-100/80 border border-slate-200/70 rounded-xl px-3.5 py-2 text-sm focus-within:border-sky-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-500/20 transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
            <input
              type="text"
              placeholder="Search patients by name, ID (e.g. PT-001), or treatment..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              className="bg-transparent border-none outline-hidden w-full text-slate-800 placeholder-slate-400 text-sm"
            />
          </div>

          {/* Quick Search Dropdown */}
          {showSearchDropdown && searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 py-1">
                Patients ({filteredPatients.length})
              </div>
              {filteredPatients.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  No matching patients found.
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {filteredPatients.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setShowSearchDropdown(false);
                        setSearchQuery("");
                        navigate(`/patients/${p.id}`);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <div className="text-sm font-medium text-slate-900 group-hover:text-sky-600">
                          {p.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {p.id} • {p.treatment.replace("_", " ")} • {p.durationMonths} Months
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {p.progress}%
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions, Notifications, Profile */}
      <div className="flex items-center gap-3 ml-4">
        <Link
          to="/patients/new"
          className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-xs shadow-sky-600/20 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Patient</span>
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-sky-500 rounded-full ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100">
                <span className="font-semibold text-sm text-slate-900">Notifications</span>
                <span className="text-[11px] text-sky-600 font-medium">3 unread</span>
              </div>
              <div className="py-1 divide-y divide-slate-100">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <Link
                      key={n.id}
                      to={n.link}
                      onClick={() => setShowNotifications(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${n.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                        <p className="text-xs text-slate-500 truncate">{n.desc}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Doctor Quick Badge */}
        <Link
          to="/settings"
          className="flex items-center gap-2.5 pl-2 py-1 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <img
            src={doctor.avatarUrl || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150"}
            alt={doctor.name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200"
          />
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">{doctor.name.split(",")[0]}</p>
            <p className="text-[11px] text-slate-500 leading-tight">Clinic Lead</p>
          </div>
        </Link>
      </div>
    </header>
  );
};
