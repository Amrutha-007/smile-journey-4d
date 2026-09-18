import React, { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { TreatmentStage, TreatmentType } from "../../types";
import { generateAllStages } from "../../services/aiService";
import confetti from "canvas-confetti";

interface AIProcessingModalProps {
  isOpen: boolean;
  stages: TreatmentStage[];
  patientImage: string;
  treatmentType: TreatmentType;
  durationMonths: number;
  onComplete: (generatedStages: TreatmentStage[]) => void;
  onClose?: () => void;
}

export const AIProcessingModal: React.FC<AIProcessingModalProps> = ({
  isOpen,
  stages,
  patientImage,
  treatmentType,
  durationMonths,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [currentStageText, setCurrentStageText] = useState<string>("Initializing pipeline...");
  const [isDone, setIsDone] = useState<boolean>(false);
  const [generatedStages, setGeneratedStages] = useState<TreatmentStage[]>([]);

  const steps = [
    { label: "Processing patient photograph & facial symmetry", key: "photo" },
    { label: "Reading dentist treatment plan & clinical targets", key: "plan" },
    { label: "Calculating independent treatment stages & arch geometry", key: "stages" },
    { label: "Generating potential smile visualizations", key: "ai" },
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setIsDone(false);
      return;
    }

    let isMounted = true;

    async function runGeneration() {
      // Step 1: photo
      setCurrentStep(0);
      await new Promise((r) => setTimeout(r, 450));
      if (!isMounted) return;

      // Step 2: plan
      setCurrentStep(1);
      await new Promise((r) => setTimeout(r, 450));
      if (!isMounted) return;

      // Step 3: stages
      setCurrentStep(2);
      await new Promise((r) => setTimeout(r, 450));
      if (!isMounted) return;

      // Step 4: AI stage generation
      setCurrentStep(3);

      const result = await generateAllStages(
        stages,
        patientImage,
        treatmentType,
        durationMonths,
        (completed, total, stage) => {
          if (!isMounted) return;
          if (completed >= total) {
            setCurrentStageText("Finalizing realistic treatment projections...");
          } else {
            setCurrentStageText(
              `Generating stage ${completed + 1} of ${total}: ${stage.stageName} (${stage.progress}%)`
            );
          }
        }
      );

      if (!isMounted) return;
      setGeneratedStages(result);
      setIsDone(true);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#38bdf8", "#0d9488", "#3b82f6"],
        });
      } catch {
        // ignore if not supported
      }
    }

    runGeneration();

    return () => {
      isMounted = false;
    };
  }, [isOpen, stages, patientImage, treatmentType, durationMonths]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-slate-200/90 text-center relative overflow-hidden">
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 via-teal-500 to-blue-600"></div>

        {/* Icon Animation */}
        <div className="mx-auto w-18 h-18 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 text-white flex items-center justify-center shadow-xl shadow-sky-500/25 mb-6 relative">
          {isDone ? (
            <CheckCircle2 className="w-10 h-10 animate-in zoom-in-75 duration-300" />
          ) : (
            <>
              <Sparkles className="w-9 h-9 animate-pulse" />
              <div className="absolute -inset-1 rounded-2xl bg-sky-400/30 animate-ping pointer-events-none -z-10"></div>
            </>
          )}
        </div>

        <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
          {isDone ? "Smile Visualization Ready" : "Creating Treatment Journey"}
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-8">
          {isDone
            ? "AI simulation generated across all prescribed treatment stages. Ready for clinical review and patient demonstration."
            : "Generating calibrated dental progressions based on the prescribed treatment plan."}
        </p>

        {/* Pipeline Checklist */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 text-left space-y-3.5 mb-8">
          {steps.map((step, idx) => {
            const isCompleted = currentStep > idx || isDone;
            const isCurrent = currentStep === idx && !isDone;

            return (
              <div key={step.key} className="flex items-center gap-3">
                <div className="shrink-0">
                  {isCompleted ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs font-semibold">
                      {idx + 1}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium leading-tight ${
                      isCompleted
                        ? "text-slate-900"
                        : isCurrent
                        ? "text-sky-700 font-semibold"
                        : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </p>
                  {isCurrent && idx === 3 && (
                    <p className="text-xs text-sky-600 mt-1 font-mono">{currentStageText}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        {isDone ? (
          <button
            onClick={() => onComplete(generatedStages)}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-semibold text-sm shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <span>Explore Smile Visualization</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
            <span>Processing stage simulations... Please wait</span>
          </div>
        )}
      </div>
    </div>
  );
};
