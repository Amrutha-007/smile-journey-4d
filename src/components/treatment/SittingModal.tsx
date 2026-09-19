import React, { useState } from "react";
import { X, Camera, CheckCircle2, AlertCircle } from "lucide-react";
import { Patient, TreatmentStage, SittingRecord } from "../../types";
import { PhotoUploader } from "../patient/PhotoUploader";

interface SittingModalProps {
  isOpen: boolean;
  patient: Patient;
  onClose: () => void;
  onSubmit: (sitting: Omit<SittingRecord, "id" | "createdAt">) => void;
}

export const SittingModal: React.FC<SittingModalProps> = ({
  isOpen,
  patient,
  onClose,
  onSubmit,
}) => {
  const nextSittingNum = patient.sittingsHistory.length + 1;
  const initialStage =
    patient.stages.find((s) => s.sittingNumber === nextSittingNum) ||
    patient.stages[Math.min(patient.stages.length - 1, nextSittingNum)];

  const [sittingNumber, setSittingNumber] = useState<number>(nextSittingNum);
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [stageId, setStageId] = useState<string>(initialStage ? initialStage.id : "");
  const [progress, setProgress] = useState<number>(initialStage ? initialStage.progress : 50);
  const [dentistNotes, setDentistNotes] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string>("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedStage = patient.stages.find((s) => s.id === stageId);
    onSubmit({
      sittingNumber,
      date,
      stageId,
      stageName: selectedStage?.stageName || `Sitting ${sittingNumber}`,
      progress,
      dentistNotes,
      photoUrl: photoUrl || undefined,
    });
    onClose();
  };

  const handleStageSelect = (selectedId: string) => {
    setStageId(selectedId);
    const st = patient.stages.find((s) => s.id === selectedId);
    if (st) {
      setProgress(st.progress);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-full">
              Clinical Sitting Management
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">
              Record Patient Sitting #{sittingNumber}
            </h3>
            <p className="text-xs text-slate-500">
              Patient: {patient.name} ({patient.id})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Sitting Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Sitting Number
              </label>
              <input
                type="number"
                min={1}
                max={patient.sittings}
                value={sittingNumber}
                onChange={(e) => setSittingNumber(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-sm font-semibold border border-slate-300 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                required
              />
            </div>

            {/* Visit Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Appointment Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm font-semibold border border-slate-300 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                required
              />
            </div>

            {/* Associated Stage */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Treatment Stage
              </label>
              <select
                value={stageId}
                onChange={(e) => handleStageSelect(e.target.value)}
                className="w-full px-3 py-2 text-sm font-semibold border border-slate-300 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 bg-white"
                required
              >
                {patient.stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.stageName} ({s.progress}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Progress Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Patient Progress Assessment
              </label>
              <span className="text-sm font-bold text-sky-600 font-mono">{progress}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
          </div>

          {/* Dentist Clinical Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Dentist Clinical Notes
            </label>
            <textarea
              rows={3}
              value={dentistNotes}
              onChange={(e) => setDentistNotes(e.target.value)}
              placeholder="Record tray tracking, IPR performed, bondings, wire adjustments, or patient compliance notes..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 placeholder-slate-400"
              required
            ></textarea>
          </div>

          {/* Actual Visit Photo Upload */}
          <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/80">
            <div className="flex items-center gap-2 mb-2">
              <Camera className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Actual Sitting Photograph (Clinical Reality)
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Upload the actual photograph taken in the clinic chair today. This will be archived alongside the prospective AI simulation.
            </p>

            <PhotoUploader
              value={photoUrl}
              onChange={setPhotoUrl}
              title="Upload Today's Clinical Smile Photo"
              description="Records patient's real physical progress for this sitting."
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-md shadow-sky-600/20 transition-all"
            >
              Save Sitting Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
