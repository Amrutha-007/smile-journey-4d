import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Settings,
  Sparkles,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { authService } from "../../services/authService";

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const location = useLocation();
  const doctor = authService.getCurrentUser();

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Patients", icon: Users, path: "/patients" },
    { label: "New Patient", icon: UserPlus, path: "/patients/new" },
    { label: "Clinic Settings", icon: Settings, path: "/settings" },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard" && location.pathname === "/dashboard") return true;
    if (path !== "/dashboard" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <aside
      className={`bg-slate-900 text-slate-100 flex flex-col justify-between transition-all duration-300 border-r border-slate-800 ${
        collapsed ? "w-20" : "w-64"
      } min-h-screen shrink-0 no-print`}
    >
      <div>
        {/* Brand Logo */}
        <div className="h-18 flex items-center px-5 border-b border-slate-800/80 gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white">SmileProgress</span>
                <span className="text-[10px] font-semibold bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded">PRO</span>
              </div>
              <p className="text-xs text-slate-400">Digital Smile Design</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all group ${
                  active
                    ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    active ? "text-sky-400" : "text-slate-400"
                  }`}
                />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && active && <ChevronRight className="w-4 h-4 ml-auto text-sky-400" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Clinical Verification & Doctor Profile */}
      <div className="p-3 border-t border-slate-800/80 space-y-3">
        {!collapsed && (
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Clinical Mode</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              AI smile simulation engine calibrated for orthodontic and veneer visualization.
            </p>
          </div>
        )}

        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/60 border border-slate-800">
          <img
            src={doctor.avatarUrl || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150"}
            alt={doctor.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-sky-500/30 shrink-0"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-100 truncate">{doctor.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{doctor.clinicName}</p>
            </div>
          )}
          {!collapsed && (
            <Link
              to="/login"
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-700/40 transition-colors"
              title="Logout / Switch Account"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
};
