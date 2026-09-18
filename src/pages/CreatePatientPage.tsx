import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Activity,
  Calendar,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { TreatmentType, DentalProblem, TreatmentStage } from "../types";
import { generateTreatmentTimeline } from "../services/timelineService";
import { patientService } from "../services/patientService";
import { TreatmentCard } from "../components/treatment/TreatmentCard";
import { TreatmentPlan } from "../components/treatment/TreatmentPlan";
import { TimelineView } from "../components/treatment/TimelineView";
import { PhotoUploader } from "../components/patient/PhotoUploader";
import { AIProcessingModal } from "../components/ai/AIProcessingModal";
import { SAMPLE_PATIENT_IMAGES } from "../services/sampleImages";

export const CreatePatientPage: React.FC = () => {
  const navigate = useNavigate();

  // Wizard Step: 1 = Info, 2 = Dental Problem, 3 = Treatment & Timeline, 4 = Photo & Simulation
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Patient Info
  const [name, setName] = useState("Ananya Menon");
  const [age, setAge] = useState(26);
  const [gender, setGender] = useState<"Female" | "Male" | "Other">("Female");
  const [phone, setPhone] = useState("+1 (555) 349-8821");
  const [email, setEmail] = useState("ananya.menon@example.com");
  const [additionalNotes, setAdditionalNotes] = useState(
    "Patient interested in discreet orthodontic improvement for upcoming wedding."
  );

  // Step 2: Dental Problem
  const dentalProblemOptions: { id: DentalProblem; label: string }[] = [
    { id: "crowding", label: "Crowding" },
    { id: "spacing", label: "Spacing" },
    { id: "misalignment", label: "Misalignment" },
    { id: "discoloration", label: "Discoloration" },
    { id: "overbite", label: "Overbite" },
    { id: "underbite", label: "Underbite" },
    { id: "missing_teeth", label: "Missing Teeth" },
    { id: "other", label: "Other" },
  ];
  const [selectedProblems, setSelectedProblems] = useState<DentalProblem[]>([
    "crowding",
    "misalignment",
  ]);
  const [problemDescription, setProblemDescription] = useState(
    "Maxillary anterior crowding with mesial rotation of central incisor and mild spacing on lateral incisors."
  );

  // Step 3: Treatment & Plan
  const [treatment, setTreatment] = useState<TreatmentType>("clear_aligners");
  const [durationMonths, setDurationMonths] = useState<number>(12);
  const [sittings, setSittings] = useState<number>(6);
  const [startDate, setStartDate] = useState<string>("2026-09-18");
  const [customSittingDates, setCustomSittingDates] = useState<string[]>([]);

  // Step 4: Photo
  const [photoUrl, setPhotoUrl] = useState<string>(SAMPLE_PATIENT_IMAGES.ananya.original);

  // AI Modal
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // Calculate timeline
  const calculatedStages = generateTreatmentTimeline({
    startDate,
    durationMonths,
    numberOfSittings: sittings,
    customSittingDates: customSittingDates.length > 0 ? customSittingDates : undefined,
  });

  const toggleProblem = (id: DentalProblem) => {
    if (selectedProblems.includes(id)) {
      setSelectedProblems(selectedProblems.filter((p) => p !== id));
    } else {
      setSelectedProblems([...selectedProblems, id]);
    }
  };

  const handleStartAISimulation = () => {
    if (!photoUrl) {
      alert("Please upload or select a smile photograph first.");
      return;
    }
    setIsAIModalOpen(true);
  };

  const savePatientRecord = (stagesToSave: TreatmentStage[], destination: "simulation" | "detail" = "simulation") => {
    if (!name.trim()) {
      alert("Please enter the patient's full name in Step 1.");
      setCurrentStep(1);
      return;
    }

    if (!photoUrl) {
      alert("Please upload or select a smile photograph first.");
      return;
    }

    // Ensure baseline stage has photo and stages are properly initialized
    const finalizedStages = stagesToSave.map((stage, idx) => ({
      ...stage,
      aiImageUrl: stage.aiImageUrl || (idx === 0 ? photoUrl : undefined),
      actualPhotoUrl: idx === 0 ? photoUrl : stage.actualPhotoUrl,
      status: stage.status || (idx === 0 ? "completed" : idx === 1 ? "current" : "upcoming"),
    }));

    const newPatient = patientService.create({
      name: name.trim(),
      age: Number(age) || 25,
      gender,
      phone: phone.trim() || "+1 (555) 000-0000",
      email: email.trim() || "patient@example.com",
      additionalNotes: additionalNotes.trim(),
      dentalProblems: selectedProblems,
      problemDescription: problemDescription.trim() || "Clinical consultation and assessment.",
      treatment,
      durationMonths: Number(durationMonths) || 12,
      sittings: Number(sittings) || 6,
      startDate: startDate || new Date().toISOString().split("T")[0],
      customSittingDates: customSittingDates.length > 0 ? customSittingDates : undefined,
      originalPhotoUrl: photoUrl,
      stages: finalizedStages,
      sittingsHistory: [],
      progress: 0,
      status: "Active",
      nextSittingDate: calculatedStages[1] ? calculatedStages[1].date : "Upcoming",
    });

    if (destination === "detail") {
      navigate(`/patients/${newPatient.id}`);
    } else {
      navigate(`/patients/${newPatient.id}/simulation`);
    }
  };

  const handleCompleteAIStages = (generatedStages: TreatmentStage[]) => {
    setIsAIModalOpen(false);
    savePatientRecord(generatedStages, "simulation");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Wizard Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full">
          New Patient Protocol
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-2 mb-1">
          Create Patient & Treatment Plan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Enter clinical records to automatically generate treatment stages and AI potential smile visualizations.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {[
            { step: 1, label: "Patient Info", icon: User },
            { step: 2, label: "Dental Problem", icon: Activity },
            { step: 3, label: "Treatment Plan", icon: Calendar },
            { step: 4, label: "Photo & AI Sim", icon: Sparkles },
          ].map((item) => {
            const isCompleted = currentStep > item.step;
            const isCurrent = currentStep === item.step;
            const Icon = item.icon;

            return (
              <button
                key={item.step}
                type="button"
                onClick={() => setCurrentStep(item.step)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-2 rounded-xl transition-all ${
                  isCurrent
                    ? "bg-sky-50 text-sky-700 font-bold border border-sky-200"
                    : isCompleted
                    ? "text-emerald-700 font-semibold"
                    : "text-slate-400 font-medium"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    isCompleted
                      ? "bg-emerald-100 text-emerald-700"
                      : isCurrent
                      ? "bg-sky-600 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : item.step}
                </div>
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: PATIENT INFORMATION */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Step 1 — Patient Information</h3>
            <p className="text-xs text-slate-500">Enter personal and contact details for the patient chart.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Patient Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ananya Menon"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Age *
                </label>
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 18)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Gender *
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-sky-500 bg-white font-medium"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Phone Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@example.com"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Additional Clinical / Patient Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Record any personal aesthetic preferences, wedding deadlines, previous orthodontic history..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-medium"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-md shadow-sky-600/20 transition-all"
            >
              <span>Continue to Dental Problem</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DENTAL PROBLEM */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Step 2 — Dental Problem & Clinical Concern</h3>
            <p className="text-xs text-slate-500">Select identified dental issues and provide clinical observations.</p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
              Identified Conditions (Select all that apply)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {dentalProblemOptions.map((opt) => {
                const isSelected = selectedProblems.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleProblem(opt.id)}
                    className={`p-3 rounded-xl border-2 text-xs font-bold transition-all text-left flex items-center justify-between ${
                      isSelected
                        ? "border-sky-500 bg-sky-50 text-sky-800 shadow-xs"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Describe the Patient's Dental Concern
            </label>
            <textarea
              rows={4}
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder="Describe the patient's chief complaint, anterior crowding level, tooth shade, arch shape, or occlusal relationships..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-medium"
              required
            />
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-md shadow-sky-600/20 transition-all"
            >
              <span>Continue to Treatment Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: TREATMENT SELECTION & TIMELINE PLAN */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-8 animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Step 3 — Proposed Treatment & Schedule</h3>
            <p className="text-xs text-slate-500">
              Select the treatment modality. The timeline engine will automatically calculate treatment stages.
            </p>
          </div>

          {/* Treatment Cards */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
              Select Treatment Modality
            </label>
            <TreatmentCard selected={treatment} onSelect={setTreatment} />
          </div>

          {/* Prescribed Plan Parameters */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
              Dentist-Prescribed Schedule
            </label>
            <TreatmentPlan
              durationMonths={durationMonths}
              sittings={sittings}
              startDate={startDate}
              customDates={customSittingDates}
              onChangeDuration={setDurationMonths}
              onChangeSittings={setSittings}
              onChangeStartDate={setStartDate}
              onChangeCustomDates={setCustomSittingDates}
            />
          </div>

          {/* Automatic Treatment Timeline Calculation Preview */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Automatically Calculated Treatment Stages
                </h4>
                <p className="text-xs text-slate-500">
                  Independent timeline computed from duration ({durationMonths}M) and sitting count ({sittings})
                </p>
              </div>
              <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-md">
                {calculatedStages.length} Stages Ready
              </span>
            </div>

            <TimelineView stages={calculatedStages} orientation="horizontal" />
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-md shadow-sky-600/20 transition-all"
            >
              <span>Continue to Photo Upload</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: PHOTO UPLOAD & AI SIMULATION TRIGGER */}
      {currentStep === 4 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-8 animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Step 4 — Patient Smile Photo & AI Visualization</h3>
            <p className="text-xs text-slate-500">
              Upload patient's actual smile photo to generate potential treatment-stage visualizations.
            </p>
          </div>

          <PhotoUploader value={photoUrl} onChange={setPhotoUrl} />

          {/* AI Simulation Launch Box */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white border border-slate-800 shadow-xl text-center relative overflow-hidden">
            <div className="relative z-10 max-w-xl mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="w-7 h-7" />
              </div>

              <h4 className="text-xl font-bold text-white tracking-tight">
                Ready to Generate Potential Smile Visualizations
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                The AI simulation pipeline will analyze the smile line and compute {calculatedStages.length} progressive stage visualizations matching your prescribed {durationMonths}-month plan.
              </p>

              <button
                type="button"
                onClick={handleStartAISimulation}
                disabled={!photoUrl}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-xl shadow-sky-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Smile Treatment Visualization</span>
              </button>

              <p className="text-[11px] text-slate-400">
                AI Simulation: Potential visual simulation for communication and educational purposes only.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="w-full sm:w-auto flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => savePatientRecord(calculatedStages, "detail")}
                disabled={!photoUrl}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold shadow-2xs transition-all disabled:opacity-50"
              >
                <span>Save Patient Record</span>
              </button>

              <button
                type="button"
                onClick={() => savePatientRecord(calculatedStages, "simulation")}
                disabled={!photoUrl}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-md shadow-sky-600/20 transition-all disabled:opacity-50"
              >
                <span>Save & View Simulation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Multi-Stage Generation Modal */}
      <AIProcessingModal
        isOpen={isAIModalOpen}
        stages={calculatedStages}
        patientImage={photoUrl}
        treatmentType={treatment}
        durationMonths={durationMonths}
        onComplete={handleCompleteAIStages}
      />
    </div>
  );
};
