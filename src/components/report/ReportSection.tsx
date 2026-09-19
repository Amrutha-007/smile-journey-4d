import React from "react";
import { LucideIcon } from "lucide-react";

interface ReportSectionProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export const ReportSection: React.FC<ReportSectionProps> = ({
  title,
  icon: Icon,
  children,
  className = "",
}) => {
  return (
    <section className={`mb-8 print-break-inside-avoid ${className}`}>
      <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-300 mb-4">
        {Icon && <Icon className="w-4 h-4 text-sky-700 shrink-0" />}
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 m-0">
          {title}
        </h3>
      </div>
      <div>{children}</div>
    </section>
  );
};
