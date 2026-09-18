import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Sparkles, Save, RotateCcw, CheckCircle2, ArrowRight } from "lucide-react";
import { patientService } from "../services/patientService";
import { generateTreatmentTimeline } from "../services/timelineService";
import { Patient, TreatmentType } from "../types";
import { PatientSummary } from "../components/patient/PatientSummary";
import { PatientTabs } from "../components/patient/PatientTabs";
import { TreatmentCard } from "../components/treatment/TreatmentCard";
import { TreatmentPlan } from "../components/treatment/TreatmentPlan";
import { TimelineView } from "../components/treatment/TimelineView";

export const PatientTreatmentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);

  const [treatment, setTreatment] = useState<TreatmentType>("clear_aligners");
  const [durationMonths, setDurationMonths] = useState<number>(12);
  const [sittings, setSittings] = useState<number>(6);
  const [startDate, setStartDate] = useState<string>("2026-09-18");
  const [customDates, setCustomDates] = useState<string[]>([]);
  const [isSavedToast, setIsSavedToast] = useState(false);

  useEffect(() => {
    if (!id) return;
    const p = patientService.getById(id);
    if (p) {
      setPatient(p);
      setTreatment(p.treatment);
      setDurationMonths(p.durationMonths);
      setSittings(p.sittings);
      setStartDate(p.startDate);
      setCustomDates(p.customSittingDates || []);
    }
  }, [id]);

  if (!patient) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Patient record not found</h3>
        <Link to="/patients" className="text-sm font-semibold text-sky-600 hover:underline">
          Return to Patients Roster
        </Link>
      </div>
    );
  }

  const recalculatedStages = generateTreatmentTimeline({
    startDate,
    durationMonths,
    numberOfSittings: sittings,
    customSittingDates: customDates.length > 0 ? customDates : undefined,
  });

  const handleSaveTreatmentPlan = () => {
    // Preserve existing stage photos if matching
    const updatedStages = recalculatedStages.map((newStage, idx) => {
      const existing = patient.stages[idx];
      return {
        ...newStage,
        aiImageUrl: existing?.aiImageUrl || patient.stages[0]?.aiImageUrl,
        actualPhotoUrl: existing?.actualPhotoUrl,
        dentistNotes: existing?.dentistNotes,
      };
    });

    const updated = patientService.update(patient.id, {
      treatment,
      durationMonths,
      sittings,
      startDate,
      customSittingDates: customDates.length > 0 ? customDates : undefined,
      stages: updatedStages,
    });

    if (updated) {
      setPatient(updated);
      setIsSavedToast(true);
      setTimeout(() => setIsSavedToast(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      <PatientSummary patient={patient} />
      <PatientTabs patientId={patient.id} />

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-full">
              Prescription Engine
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">
              Treatment Modality & Schedule Parameters
            </h3>
            <p className="text-xs text-slate-500">
              The doctor's treatment plan is the source of truth. Timeline stages are calculated independently from AI simulation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isSavedToast && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved!</span>
              </span>
            )}
            <button
              type="button"
              onClick={handleSaveTreatmentPlan}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Update Treatment Plan</span>
            </button>
          </div>
        </div>

        {/* Treatment Modality Selection */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
            Selected Treatment Modality
          </h4>
          <TreatmentCard selected={treatment} onSelect={setTreatment} />
        </div>

        {/* Schedule & Duration Parameters */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
            Schedule & Sitting Duration
          </h4>
          <TreatmentPlan
            durationMonths={durationMonths}
            sittings={sittings}
            startDate={startDate}
            customDates={customDates}
            onChangeDuration={setDurationMonths}
            onChangeSittings={setSittings}
            onChangeStartDate={setStartDate}
            onChangeCustomDates={setCustomDates}
          />
        </div>

        {/* Recalculated Timeline Engine Preview */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Calculated Timeline Stages ({recalculatedStages.length})
              </h4>
              <p className="text-xs text-slate-500">
                Live preview of recalculated stage milestones based on duration and sittings
              </p>
            </div>
            <Link
              to={`/patients/${patient.id}/simulation`}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <span>View Smile Simulation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <TimelineView stages={recalculatedStages} orientation="horizontal" />
        </div>
      </div>
    </div>
  );
};
