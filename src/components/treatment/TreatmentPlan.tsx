import React, { useState } from "react";
import { Calendar, Clock, Layers, Sparkles, ChevronDown } from "lucide-react";
import { formatDate } from "../../services/timelineService";

interface TreatmentPlanProps {
  durationMonths: number;
  sittings: number;
  startDate: string;
  customDates?: string[];
  onChangeDuration: (months: number) => void;
  onChangeSittings: (sittings: number) => void;
  onChangeStartDate: (date: string) => void;
  onChangeCustomDates?: (dates: string[]) => void;
}

export const TreatmentPlan: React.FC<TreatmentPlanProps> = ({
  durationMonths,
  sittings,
  startDate,
  customDates = [],
  onChangeDuration,
  onChangeSittings,
  onChangeStartDate,
  onChangeCustomDates,
}) => {
  const [showCustomDates, setShowCustomDates] = useState(false);

  // Calculate expected completion date
  const parsedStart = new Date(startDate);
  const validStart = isNaN(parsedStart.getTime()) ? new Date() : parsedStart;
  const completionDate = new Date(validStart);
  completionDate.setMonth(completionDate.getMonth() + durationMonths);

  const stageIntervalWeeks = ((durationMonths * 4.33) / Math.max(1, sittings)).toFixed(1);

  const handleCustomDateChange = (index: number, val: string) => {
    if (!onChangeCustomDates) return;
    const updated = [...customDates];
    updated[index] = val;
    onChangeCustomDates(updated);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Treatment Duration */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Treatment Duration
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={48}
              value={durationMonths}
              onChange={(e) => onChangeDuration(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-24 px-3 py-2 text-xl font-bold text-slate-900 border border-slate-300 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            />
            <div className="flex-1 px-3 py-2 bg-slate-100 rounded-xl text-sm font-semibold text-slate-700 flex items-center justify-between">
              <span>Months</span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Prescribed total treatment schedule
          </p>
        </div>

        {/* Number of Sittings */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Number of Sittings
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={36}
              value={sittings}
              onChange={(e) => onChangeSittings(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-24 px-3 py-2 text-xl font-bold text-slate-900 border border-slate-300 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            />
            <div className="flex-1 px-3 py-2 bg-slate-100 rounded-xl text-sm font-semibold text-slate-700 flex items-center justify-between">
              <span>Visits</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            In-clinic monitoring appointments
          </p>
        </div>

        {/* Start Date */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Start Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => onChangeStartDate(e.target.value)}
              className="w-full px-3 py-2 text-sm font-bold text-slate-900 border border-slate-300 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Baseline records appointment
          </p>
        </div>
      </div>

      {/* Calculated Treatment Metrics */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-teal-50/50 to-slate-50 border border-sky-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-sky-800">
              Automatic Timeline Metrics
            </div>
            <div className="text-sm font-semibold text-slate-900">
              {sittings + 1} Treatment Stages (Initial + {sittings} Intervals)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-600">
          <div>
            <span className="text-slate-400 block">Visit Frequency</span>
            <span className="font-bold text-slate-800">~Every {stageIntervalWeeks} Weeks</span>
          </div>
          <div>
            <span className="text-slate-400 block">Est. Completion</span>
            <span className="font-bold text-slate-800">{formatDate(completionDate)}</span>
          </div>
        </div>

        {onChangeCustomDates && (
          <button
            type="button"
            onClick={() => setShowCustomDates(!showCustomDates)}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 underline"
          >
            {showCustomDates ? "Hide Custom Sitting Dates" : "Customize Specific Sitting Dates"}
          </button>
        )}
      </div>

      {/* Optional Custom Sitting Dates */}
      {showCustomDates && onChangeCustomDates && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 animate-in fade-in">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
            Custom Sitting Dates (Override Auto-Spacing)
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: sittings }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 w-16">Sitting {i + 1}:</span>
                <input
                  type="date"
                  value={customDates[i] || ""}
                  onChange={(e) => handleCustomDateChange(i, e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-medium border border-slate-300 rounded-lg flex-1"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
