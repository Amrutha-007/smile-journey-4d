import React from "react";
import { CheckCircle2, Clock, Sparkles, Camera, AlertCircle } from "lucide-react";
import { TreatmentStage } from "../../types";

interface TimelineViewProps {
  stages: TreatmentStage[];
  currentStageId?: string;
  onSelectStage?: (stage: TreatmentStage) => void;
  orientation?: "horizontal" | "vertical";
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  stages,
  currentStageId,
  onSelectStage,
  orientation = "horizontal",
}) => {
  if (orientation === "horizontal") {
    return (
      <div className="w-full overflow-x-auto pb-4 pt-2">
        <div className="flex items-center min-w-max gap-3 px-1">
          {stages.map((stage, idx) => {
            const isSelected = currentStageId === stage.id;
            const isInitial = idx === 0;
            const isFinal = idx === stages.length - 1;

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => onSelectStage && onSelectStage(stage)}
                className={`relative px-4 py-3 rounded-2xl border-2 transition-all text-left flex flex-col justify-between min-w-[150px] ${
                  isSelected
                    ? "border-sky-500 bg-sky-50/50 shadow-md shadow-sky-500/10 scale-102"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs"
                }`}
              >
                {/* Top Status & Progress */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      stage.status === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : stage.status === "current"
                        ? "bg-sky-100 text-sky-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {stage.status}
                  </span>
                  <span className="text-xs font-bold text-slate-700 font-mono">
                    {stage.progress}%
                  </span>
                </div>

                {/* Stage Title */}
                <div>
                  <h5 className="text-sm font-bold text-slate-900 leading-tight">
                    {stage.stageName}
                  </h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">{stage.date}</p>
                </div>

                {/* Badges for AI vs Actual */}
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span
                    className={`flex items-center gap-1 font-medium ${
                      stage.aiImageUrl ? "text-sky-600" : "text-slate-400"
                    }`}
                    title={stage.aiImageUrl ? "AI simulation ready" : "No AI simulation"}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>AI Sim</span>
                  </span>

                  <span
                    className={`flex items-center gap-1 font-medium ${
                      stage.actualPhotoUrl ? "text-emerald-600" : "text-slate-300"
                    }`}
                    title={stage.actualPhotoUrl ? "Actual visit photo uploaded" : "No visit photo"}
                  >
                    <Camera className="w-3 h-3" />
                    <span>{stage.actualPhotoUrl ? "Photo" : "Pending"}</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Vertical Timeline
  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
      {stages.map((stage) => {
        const isSelected = currentStageId === stage.id;
        const isCompleted = stage.status === "completed";

        return (
          <div
            key={stage.id}
            onClick={() => onSelectStage && onSelectStage(stage)}
            className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer ${
              isSelected
                ? "border-sky-500 bg-sky-50/40 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            {/* Timeline Dot Indicator */}
            <div
              className={`absolute -left-[27px] top-5 w-4 h-4 rounded-full border-2 ring-4 ring-white ${
                isCompleted
                  ? "bg-emerald-500 border-emerald-600"
                  : stage.status === "current"
                  ? "bg-sky-500 border-sky-600 animate-pulse"
                  : "bg-slate-300 border-slate-400"
              }`}
            ></div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-sky-600 uppercase tracking-wide">
                  Sitting {stage.sittingNumber} • Month {stage.month}
                </span>
                <h4 className="text-base font-bold text-slate-900">{stage.stageName}</h4>
                <p className="text-xs text-slate-400">{stage.date}</p>
              </div>

              <div className="text-right">
                <span className="text-sm font-bold text-slate-900 font-mono">{stage.progress}%</span>
                <div className="mt-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      isCompleted
                        ? "bg-emerald-100 text-emerald-700"
                        : stage.status === "current"
                        ? "bg-sky-100 text-sky-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {stage.status}
                  </span>
                </div>
              </div>
            </div>

            {stage.dentistNotes && (
              <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <strong>Doctor Notes:</strong> {stage.dentistNotes}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
