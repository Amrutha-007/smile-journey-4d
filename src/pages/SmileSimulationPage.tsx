import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Sparkles,
  Calendar,
  Layers,
  Save,
  CheckCircle2,
  FileText,
  Clock,
  ChevronRight,
  Info,
  Camera,
  PlusCircle,
} from "lucide-react";
import { patientService } from "../services/patientService";
import { Patient, TreatmentStage } from "../types";
import { BeforeAfterSlider } from "../components/ai/BeforeAfterSlider";
import { TimelineView } from "../components/treatment/TimelineView";
import { MedicalDisclaimer } from "../components/ai/MedicalDisclaimer";
import { SittingModal } from "../components/treatment/SittingModal";
import { PatientTabs } from "../components/patient/PatientTabs";

export const SmileSimulationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [selectedStage, setSelectedStage] = useState<TreatmentStage | null>(null);
  const [dentistNotes, setDentistNotes] = useState<string>("");
  const [isSavedToast, setIsSavedToast] = useState<boolean>(false);
  const [isSittingModalOpen, setIsSittingModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    const p = patientService.getById(id);
    if (p) {
      setPatient(p);
      // Select the current stage or 50% stage or first stage
      const cur =
        p.stages.find((s) => s.status === "current") ||
        p.stages[Math.min(3, p.stages.length - 1)];
      setSelectedStage(cur);
      setDentistNotes(cur?.dentistNotes || "");
    }
  }, [id]);

  if (!patient || !selectedStage) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Patient record not found</h3>
        <Link to="/patients" className="text-sm font-semibold text-sky-600 hover:underline">
          Return to Patients Roster
        </Link>
      </div>
    );
  }

  const treatmentLabels: Record<string, string> = {
    clear_aligners: "Clear Aligners",
    dental_veneers: "Dental Veneers",
    braces: "Fixed Braces",
  };

  const handleStageSelect = (stage: TreatmentStage) => {
    setSelectedStage(stage);
    setDentistNotes(stage.dentistNotes || "");
  };

  const handleSaveStage = () => {
    if (!selectedStage) return;
    const updated = patientService.updateStage(patient.id, selectedStage.id, {
      dentistNotes,
    });
    if (updated) {
      setPatient(updated);
      setIsSavedToast(true);
      setTimeout(() => setIsSavedToast(false), 2500);
    }
  };

  const currentSimulationImage =
    selectedStage.aiImageUrl || patient.originalPhotoUrl;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-0.5 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span>Digital Smile Design Visualization</span>
            </span>
            <span className="text-xs font-mono text-slate-400 font-semibold">{patient.id}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 m-0">
            {patient.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {treatmentLabels[patient.treatment]} • {patient.durationMonths} Month Treatment Plan • {patient.sittings} Sittings
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSittingModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-teal-400" />
            <span>Record Sitting Photo</span>
          </button>
          <Link
            to={`/patients/${patient.id}/report`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Consolidated Report</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <PatientTabs patientId={patient.id} />

      {/* Stage Navigation Pills */}
      <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-2xs overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Timeline Stages:</span>
          </span>
          {patient.stages.map((stage) => {
            const isSelected = selectedStage.id === stage.id;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => handleStageSelect(stage)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isSelected
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/25 scale-102"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <span>{stage.stageName}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isSelected ? "bg-sky-700 text-sky-100" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {stage.progress}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Showcase Split: Left = Interactive Comparison Viewer, Right = Stage Clinical Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Viewer (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <BeforeAfterSlider
            originalImage={patient.originalPhotoUrl}
            simulationImage={currentSimulationImage}
            originalLabel="Baseline Smile (Original)"
            simulationLabel="Potential Treatment Visualization"
            stageName={selectedStage.stageName}
          />

          <MedicalDisclaimer compact />
        </div>

        {/* Stage Details Panel (Right 1 col) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                  Stage Details
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {selectedStage.stageName}
                </h3>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  selectedStage.status === "completed"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-sky-100 text-sky-800"
                }`}
              >
                {selectedStage.status}
              </span>
            </div>

            {/* Metric List */}
            <div className="space-y-3 text-xs mb-6">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-semibold">Treatment Progress</span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  {selectedStage.progress}%
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-semibold">In-Clinic Sitting</span>
                <span className="font-bold text-slate-900">
                  Sitting {selectedStage.sittingNumber} of {patient.sittings}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-semibold">Scheduled Date</span>
                <span className="font-bold text-slate-900">{selectedStage.date}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-sky-50/60 border border-sky-100">
                <span className="text-sky-800 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  <span>AI Simulation</span>
                </span>
                <span className="font-bold text-sky-700">Generated ✓</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-slate-400" />
                  <span>Actual Visit Photo</span>
                </span>
                <span
                  className={`font-semibold ${
                    selectedStage.actualPhotoUrl ? "text-emerald-700" : "text-slate-400 italic"
                  }`}
                >
                  {selectedStage.actualPhotoUrl ? "Uploaded ✓" : "Not uploaded yet"}
                </span>
              </div>
            </div>

            {/* Dentist Notes Textarea */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Dentist Clinical Notes
              </label>
              <textarea
                rows={4}
                value={dentistNotes}
                onChange={(e) => setDentistNotes(e.target.value)}
                placeholder="Enter clinical observations, interproximal reduction (IPR), attachment status, or compliance notes..."
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-medium placeholder-slate-400"
              ></textarea>
            </div>
          </div>

          <div>
            {isSavedToast && (
              <div className="p-2 mb-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Stage clinical notes saved successfully!</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleSaveStage}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Save className="w-4 h-4 text-teal-400" />
              <span>Save Stage Notes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Treatment Timeline Strip */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Treatment Stage Progression Track
            </h3>
            <p className="text-xs text-slate-500">
              Prescribed {patient.durationMonths}-month timeline from Initial baseline to Final outcome
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-400">
            Click any stage to view visual simulation
          </span>
        </div>

        <TimelineView
          stages={patient.stages}
          currentStageId={selectedStage.id}
          onSelectStage={handleStageSelect}
          orientation="horizontal"
        />
      </div>

      {/* Record Sitting Modal */}
      <SittingModal
        isOpen={isSittingModalOpen}
        patient={patient}
        onClose={() => setIsSittingModalOpen(false)}
        onSubmit={(sitting) => {
          const updated = patientService.addSitting(patient.id, sitting);
          if (updated) {
            setPatient(updated);
            alert("Sitting recorded and actual clinical photo archived successfully!");
          }
        }}
      />
    </div>
  );
};
