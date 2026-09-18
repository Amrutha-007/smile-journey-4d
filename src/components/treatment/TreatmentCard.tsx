import React from "react";
import { Sparkles, Check, Layers, ShieldCheck, Activity } from "lucide-react";
import { TreatmentType } from "../../types";

interface TreatmentOption {
  id: TreatmentType;
  title: string;
  badge: string;
  description: string;
  changes: string[];
  recommendedDuration: number;
  recommendedSittings: number;
}

export const TREATMENTS: TreatmentOption[] = [
  {
    id: "clear_aligners",
    title: "Clear Aligners",
    badge: "Orthodontic",
    description: "Custom clear thermoformed aligners for discreet, continuous biological tooth movement.",
    changes: [
      "Gradual arch realignment",
      "Reduced anterior crowding",
      "Closing unwanted spacing",
      "Incisal edge leveling",
    ],
    recommendedDuration: 12,
    recommendedSittings: 6,
  },
  {
    id: "dental_veneers",
    title: "Dental Veneers",
    badge: "Cosmetic",
    description: "Ultra-thin custom porcelain laminates bonded to facial tooth surfaces for comprehensive smile aesthetics.",
    changes: [
      "Golden proportion tooth shape",
      "Symmetrical zenith line balance",
      "High-aesthetic shade & translucency",
      "Incisal micro-fracture repair",
    ],
    recommendedDuration: 3,
    recommendedSittings: 3,
  },
  {
    id: "braces",
    title: "Fixed Braces",
    badge: "Orthodontic",
    description: "Aesthetic ceramic or low-profile metal brackets with progressive nickel-titanium archwires.",
    changes: [
      "Heavy de-crowding correction",
      "Torque & root angle control",
      "Deep bite & overjet reduction",
      "Comprehensive occlusion finishing",
    ],
    recommendedDuration: 18,
    recommendedSittings: 9,
  },
];

interface TreatmentCardProps {
  selected: TreatmentType;
  onSelect: (treatment: TreatmentType) => void;
}

export const TreatmentCard: React.FC<TreatmentCardProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {TREATMENTS.map((item) => {
        const isSelected = selected === item.id;
        return (
          <div
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`rounded-2xl p-5 cursor-pointer transition-all border-2 flex flex-col justify-between relative ${
              isSelected
                ? "border-sky-500 bg-sky-50/40 shadow-lg shadow-sky-500/10 scale-[1.01]"
                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
            }`}
          >
            {isSelected && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-xs">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  {item.badge}
                </span>
              </div>

              <h4 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">{item.description}</p>

              <div className="space-y-1.5 mb-5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  Potential Visual Changes:
                </div>
                {item.changes.map((change, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0"></div>
                    <span>{change}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Typical: {item.recommendedDuration}M • {item.recommendedSittings} visits
              </span>
              <button
                type="button"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isSelected
                    ? "bg-sky-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {isSelected ? "Selected" : "Select"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
