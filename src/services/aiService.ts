import { AISimulationInput, AISimulationOutput, TreatmentStage, TreatmentType } from "../types";
import {
  simulatePhotographicSmile,
  TreatmentParameters,
  DentalSimulationResult,
} from "./cvDentalService";

/**
 * Builds treatment-specific AI generation prompt instructions
 * adhering strictly to clinical non-generative principles.
 */
export function buildTreatmentPrompt(
  treatment: TreatmentType,
  stageName: string,
  stageMonth: number,
  stageProgress: number,
  params?: TreatmentParameters
): string {
  const commonHeader = `SOURCE IMAGE: Original Patient Photograph.
PRINCIPLE: Preserve the patient's identity, facial structure, skin tone, lips, gums, lighting, and background.
TARGET REGION: Modify exclusively the visible teeth using localized computer-vision dental alignment and shade lifting.
Do not generate a synthetic mouth, face, or cartoon illustration.
This is a visual potential treatment simulation for clinical communication and education only.`;

  const alignPct = params ? Math.round(params.alignment * 100) : stageProgress;
  const whitenPct = params ? Math.round(params.whitening * 100) : Math.round(stageProgress * 0.7);

  if (treatment === "clear_aligners") {
    return `${commonHeader}
TREATMENT: Clear Aligners
STAGE: ${stageName} (Month ${stageMonth}, Progress: ${stageProgress}%)
SIMULATION PARAMETERS:
- Progressive arch alignment: ${alignPct}%
- Spacing correction: ${params ? Math.round(params.spacing * 100) : 30}%
- Enamel shade lift: ${whitenPct}%
- Incisal edge leveling and anterior arch de-crowding.`;
  }

  if (treatment === "dental_veneers") {
    return `${commonHeader}
TREATMENT: Dental Veneers
STAGE: ${stageName} (Month ${stageMonth}, Progress: ${stageProgress}%)
SIMULATION PARAMETERS:
- Aesthetic veneer harmonization: ${alignPct}%
- Enamel shade lift (Vita BL2/B1): ${whitenPct}%
- Golden proportion crown symmetry and incisal contour balance.`;
  }

  // Braces
  return `${commonHeader}
TREATMENT: Comprehensive Fixed Orthodontic Braces
STAGE: ${stageName} (Month ${stageMonth}, Progress: ${stageProgress}%)
SIMULATION PARAMETERS:
- Archwire leveling and torque correction: ${alignPct}%
- Anterior rotation reduction: ${alignPct}%
- Enamel polishing: ${whitenPct}%.`;
}

/**
 * Calculates realistic clinical parameters from treatment type and stage progress.
 */
export function deriveParametersFromStage(
  treatmentType: TreatmentType,
  stageProgress: number
): TreatmentParameters {
  const progressRatio = Math.max(0, Math.min(100, stageProgress)) / 100;

  if (treatmentType === "dental_veneers") {
    return {
      alignment: 0.35 + 0.65 * progressRatio,
      spacing: 0.2 + 0.5 * progressRatio,
      whitening: 0.25 + 0.65 * progressRatio,
      toothLength: 0.04 * progressRatio,
      toothWidth: 0.02 * progressRatio,
      smileSymmetry: 0.3 + 0.6 * progressRatio,
    };
  }

  if (treatmentType === "braces") {
    return {
      alignment: 0.15 + 0.85 * progressRatio,
      spacing: 0.15 + 0.55 * progressRatio,
      whitening: 0.1 + 0.35 * progressRatio,
      toothLength: 0.02 * progressRatio,
      toothWidth: 0,
      smileSymmetry: 0.2 + 0.75 * progressRatio,
    };
  }

  // Clear aligners default
  return {
    alignment: 0.12 + 0.88 * progressRatio,
    spacing: 0.1 + 0.5 * progressRatio,
    whitening: 0.15 + 0.55 * progressRatio,
    toothLength: 0.03 * progressRatio,
    toothWidth: 0,
    smileSymmetry: 0.25 + 0.7 * progressRatio,
  };
}

/**
 * Core photographic dental simulation service function.
 * Uses client-side computer vision on the original patient photograph.
 */
export async function generateSmileSimulation(
  input: AISimulationInput,
  customParams?: TreatmentParameters,
  onStepProgress?: (step: string) => void
): Promise<AISimulationOutput & { simulationResult?: DentalSimulationResult }> {
  const params = customParams || deriveParametersFromStage(input.treatmentType, input.stageProgress);

  const promptUsed = buildTreatmentPrompt(
    input.treatmentType,
    input.stage,
    input.stageMonth,
    input.stageProgress,
    params
  );

  try {
    const simulationResult = await simulatePhotographicSmile(
      input.patientImage,
      params,
      onStepProgress
    );

    return {
      imageUrl: simulationResult.imageUrl,
      stage: input.stage,
      month: input.stageMonth,
      status: "completed",
      promptUsed,
      simulationResult,
    };
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    // If teeth cannot be detected, return source image and structured message
    return {
      imageUrl: input.patientImage,
      stage: input.stage,
      month: input.stageMonth,
      status: "failed",
      promptUsed,
      error: errMsg,
    } as AISimulationOutput;
  }
}

/**
 * Executes a custom photographic simulation with direct dentist parameters.
 */
export async function generateCustomSmileSimulation(
  patientImage: string,
  params: TreatmentParameters,
  onStepProgress?: (step: string) => void
): Promise<DentalSimulationResult> {
  return await simulatePhotographicSmile(patientImage, params, onStepProgress);
}

/**
 * Iterates through all stages of a patient's timeline to generate
 * simulations sequentially with rich step notifications.
 */
export async function generateAllStages(
  stages: TreatmentStage[],
  patientImage: string,
  treatmentType: TreatmentType,
  durationMonths: number,
  onProgress?: (completed: number, total: number, currentStage: TreatmentStage) => void
): Promise<TreatmentStage[]> {
  const updatedStages = [...stages];
  const total = stages.length;

  for (let i = 0; i < stages.length; i++) {
    const stage = updatedStages[i];
    stage.status = "generating";
    if (onProgress) onProgress(i, total, stage);

    const simulation = await generateSmileSimulation({
      patientImage,
      treatmentType,
      treatmentDuration: durationMonths,
      stage: stage.stageName,
      stageMonth: stage.month,
      stageProgress: stage.progress,
    });

    stage.aiImageUrl = simulation.imageUrl;
    stage.aiPrompt = simulation.promptUsed;
    stage.status = "completed";

    if (onProgress) onProgress(i + 1, total, stage);
  }

  return updatedStages;
}
