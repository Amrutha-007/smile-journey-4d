import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Sparkles,
  Save,
  CheckCircle2,
  FileText,
  Clock,
  Camera,
  PlusCircle,
  RotateCcw,
  Sliders,
  AlertTriangle,
  Info,
} from "lucide-react";
import { patientService } from "../services/patientService";
import { Patient, TreatmentStage } from "../types";
import { BeforeAfterSlider } from "../components/ai/BeforeAfterSlider";
import { TimelineView } from "../components/treatment/TimelineView";
import { MedicalDisclaimer } from "../components/ai/MedicalDisclaimer";
import { SittingModal } from "../components/treatment/SittingModal";
import { PatientTabs } from "../components/patient/PatientTabs";
import {
  TreatmentParameters,
  PresetName,
  TREATMENT_PRESETS,
  simulatePhotographicSmile,
  DentalSimulationResult,
} from "../services/cvDentalService";
import { deriveParametersFromStage } from "../services/aiService";

export const SmileSimulationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [selectedStage, setSelectedStage] = useState<TreatmentStage | null>(null);
  const [dentistNotes, setDentistNotes] = useState<string>("");
  const [isSavedToast, setIsSavedToast] = useState<boolean>(false);
  const [isSittingModalOpen, setIsSittingModalOpen] = useState<boolean>(false);

  // Simulation Controls State
  const [selectedPreset, setSelectedPreset] = useState<PresetName>("whitening_alignment");
  const [treatmentParams, setTreatmentParams] = useState<TreatmentParameters>({
    alignment: 0.5,
    spacing: 0.25,
    whitening: 0.6,
    toothLength: 0.05,
    toothWidth: 0,
    smileSymmetry: 0.5,
  });

  const [activeSimulationImage, setActiveSimulationImage] = useState<string>("");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationStep, setSimulationStep] = useState<string>("");
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const [simulationWarnings, setSimulationWarnings] = useState<string[]>([]);
  const [simulationMetrics, setSimulationMetrics] = useState<DentalSimulationResult["metrics"] | null>(null);

  // Initialize patient & stage
  useEffect(() => {
    if (!id) return;
    const p = patientService.getById(id);
    if (p) {
      setPatient(p);
      const cur =
        p.stages.find((s) => s.status === "current") ||
        (p.stages.length > 1 ? p.stages[1] : p.stages[0]) ||
        p.stages[0];
      setSelectedStage(cur || null);
      setDentistNotes(cur?.dentistNotes || "");

      const derived = deriveParametersFromStage(p.treatment, cur?.progress || 0);
      setTreatmentParams(derived);

      // Set initial simulation image
      if (cur?.aiImageUrl && cur.aiImageUrl !== p.originalPhotoUrl) {
        setActiveSimulationImage(cur.aiImageUrl);
      } else {
        setActiveSimulationImage(p.originalPhotoUrl);
      }
    } else {
      setPatient(null);
      setSelectedStage(null);
    }
  }, [id]);

  // Handle stage selection
  const handleStageSelect = (stage: TreatmentStage) => {
    setSelectedStage(stage);
    setDentistNotes(stage.dentistNotes || "");
    setSimulationError(null);
    setSimulationWarnings([]);

    if (patient) {
      const derived = deriveParametersFromStage(patient.treatment, stage.progress);
      setTreatmentParams(derived);
      setSelectedPreset("whitening_alignment");

      if (stage.aiImageUrl && stage.aiImageUrl !== patient.originalPhotoUrl) {
        setActiveSimulationImage(stage.aiImageUrl);
      } else {
        // Trigger initial simulation for this stage
        runSimulation(patient.originalPhotoUrl, derived, stage);
      }
    }
  };

  // Run simulation core function
  const runSimulation = useCallback(
    async (
      sourceUrl: string,
      params: TreatmentParameters,
      targetStage: TreatmentStage
    ) => {
      if (!patient) return;
      setIsSimulating(true);
      setSimulationError(null);
      setSimulationWarnings([]);

      try {
        const result = await simulatePhotographicSmile(
          sourceUrl,
          params,
          (step) => setSimulationStep(step)
        );

        setActiveSimulationImage(result.imageUrl);
        setSimulationMetrics(result.metrics);
        if (result.warnings && result.warnings.length > 0) {
          setSimulationWarnings(result.warnings);
        }

        // Persist to local patient store
        patientService.updateStage(patient.id, targetStage.id, {
          aiImageUrl: result.imageUrl,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setSimulationError(msg);
      } finally {
        setIsSimulating(false);
        setSimulationStep("");
      }
    },
    [patient]
  );

  // Preset selection handler
  const handlePresetChange = (presetId: PresetName) => {
    setSelectedPreset(presetId);
    if (presetId !== "custom") {
      const presetParams = { ...TREATMENT_PRESETS[presetId].params };
      setTreatmentParams(presetParams);
    }
  };

  // Individual slider change handler
  const handleParamChange = (key: keyof TreatmentParameters, val: number) => {
    setSelectedPreset("custom");
    setTreatmentParams((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  // Generate button click
  const handleGenerateSimulation = () => {
    if (!patient || !selectedStage) return;
    runSimulation(patient.originalPhotoUrl, treatmentParams, selectedStage);
  };

  // Reset button click
  const handleResetSimulation = () => {
    if (!patient || !selectedStage) return;
    const defaultParams = deriveParametersFromStage(patient.treatment, selectedStage.progress);
    setTreatmentParams(defaultParams);
    setSelectedPreset("whitening_alignment");
    runSimulation(patient.originalPhotoUrl, defaultParams, selectedStage);
  };

  const handleSaveStage = () => {
    if (!selectedStage || !patient) return;
    const updated = patientService.updateStage(patient.id, selectedStage.id, {
      dentistNotes,
      aiImageUrl: activeSimulationImage || selectedStage.aiImageUrl,
    });
    if (updated) {
      setPatient(updated);
      setIsSavedToast(true);
      setTimeout(() => setIsSavedToast(false), 2500);
    }
  };

  if (!patient) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Patient record not found</h3>
        <p className="text-xs text-slate-500 mb-4">No patient found matching ID "{id}".</p>
        <Link to="/patients" className="text-sm font-semibold text-sky-600 hover:underline">
          Return to Patients Roster
        </Link>
      </div>
    );
  }

  if (!selectedStage) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-sm text-slate-500">Loading treatment stages...</p>
      </div>
    );
  }

  const treatmentLabels: Record<string, string> = {
    clear_aligners: "Clear Aligners",
    dental_veneers: "Dental Veneers",
    braces: "Fixed Braces",
  };

  const currentSimulationImage = activeSimulationImage || selectedStage.aiImageUrl || patient.originalPhotoUrl;

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

      {/* Showcase Split: Left = Interactive Comparison Viewer, Right = Stage Clinical Detail & Treatment Simulation Panel */}
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

        {/* Stage Details & Treatment Simulation Panel (Right 1 col) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* Stage Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
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
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-semibold">Treatment Progress</span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  {selectedStage.progress}%
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-semibold">In-Clinic Setting</span>
                <span className="font-bold text-slate-900">
                  Sitting {selectedStage.sittingNumber} of {patient.sittings}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-semibold">Scheduled Date</span>
                <span className="font-bold text-slate-900">{selectedStage.date}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-sky-50/60 border border-sky-100">
                <span className="text-sky-800 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  <span>AI Simulation</span>
                </span>
                <span className="font-bold text-sky-700">Generated ✓</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
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

            {/* ---------------------------------------------------------------- */}
            {/* DENTIST TREATMENT SIMULATION CONTROL PANEL */}
            {/* ---------------------------------------------------------------- */}
            <div className="pt-4 border-t border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-sky-500" />
                  <span>Treatment Simulation</span>
                </span>
                {simulationMetrics && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active outcome
                  </span>
                )}
              </div>

              {/* Preset Dropdown */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Preset
                </label>
                <select
                  value={selectedPreset}
                  onChange={(e) => handlePresetChange(e.target.value as PresetName)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                >
                  <option value="natural_whitening">Natural Whitening</option>
                  <option value="mild_alignment">Mild Alignment</option>
                  <option value="whitening_alignment">Whitening + Alignment</option>
                  <option value="smile_enhancement">Smile Enhancement</option>
                  <option value="custom">Custom Treatment</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1 italic leading-tight">
                  {TREATMENT_PRESETS[selectedPreset]?.description}
                </p>
              </div>

              {/* Sliders */}
              <div className="space-y-3 pt-1">
                {/* Alignment */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Alignment</span>
                    <span className="font-mono text-sky-600 font-bold">
                      {Math.round(treatmentParams.alignment * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(treatmentParams.alignment * 100)}
                    onChange={(e) => handleParamChange("alignment", Number(e.target.value) / 100)}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                </div>

                {/* Spacing */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Spacing</span>
                    <span className="font-mono text-sky-600 font-bold">
                      {Math.round(treatmentParams.spacing * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(treatmentParams.spacing * 100)}
                    onChange={(e) => handleParamChange("spacing", Number(e.target.value) / 100)}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                </div>

                {/* Whitening */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Whitening</span>
                    <span className="font-mono text-sky-600 font-bold">
                      {Math.round(treatmentParams.whitening * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(treatmentParams.whitening * 100)}
                    onChange={(e) => handleParamChange("whitening", Number(e.target.value) / 100)}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                </div>

                {/* Tooth Length */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Tooth Length</span>
                    <span className="font-mono text-sky-600 font-bold">
                      {treatmentParams.toothLength > 0
                        ? `+${Math.round(treatmentParams.toothLength * 100)}%`
                        : `${Math.round(treatmentParams.toothLength * 100)}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-20"
                    max="20"
                    value={Math.round(treatmentParams.toothLength * 100)}
                    onChange={(e) => handleParamChange("toothLength", Number(e.target.value) / 100)}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                </div>

                {/* Tooth Width */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Tooth Width</span>
                    <span className="font-mono text-sky-600 font-bold">
                      {treatmentParams.toothWidth > 0
                        ? `+${Math.round(treatmentParams.toothWidth * 100)}%`
                        : `${Math.round(treatmentParams.toothWidth * 100)}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-20"
                    max="20"
                    value={Math.round(treatmentParams.toothWidth * 100)}
                    onChange={(e) => handleParamChange("toothWidth", Number(e.target.value) / 100)}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                </div>

                {/* Smile Symmetry */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Smile Symmetry</span>
                    <span className="font-mono text-sky-600 font-bold">
                      {Math.round(treatmentParams.smileSymmetry * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(treatmentParams.smileSymmetry * 100)}
                    onChange={(e) => handleParamChange("smileSymmetry", Number(e.target.value) / 100)}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                </div>
              </div>

              {/* Status / Step indicator */}
              {isSimulating && (
                <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-500 animate-spin" />
                  <span>{simulationStep || "Analyzing smile..."}</span>
                </div>
              )}

              {/* Error Notification */}
              {simulationError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{simulationError}</span>
                </div>
              )}

              {/* Warning Notifications */}
              {simulationWarnings.map((warn, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium flex items-center gap-2"
                >
                  <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{warn}</span>
                </div>
              ))}

              {/* Simulation Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleGenerateSimulation}
                  disabled={isSimulating}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-98"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-100" />
                  <span>{isSimulating ? "Processing..." : "Generate Simulation"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetSimulation}
                  disabled={isSimulating}
                  className="py-2.5 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1"
                  title="Reset Simulation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Dentist Notes Textarea */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Dentist Clinical Notes
              </label>
              <textarea
                rows={3}
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
                <span>Stage clinical notes and outcome saved!</span>
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
