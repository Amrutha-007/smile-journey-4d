import { AISimulationInput, AISimulationOutput, TreatmentStage, TreatmentType } from "../types";
import { SAMPLE_PATIENT_IMAGES, createDentalSmileSvg } from "./sampleImages";

/**
 * Builds treatment-specific AI generation prompt instructions
 * adhering strictly to the clinical specification.
 */
export function buildTreatmentPrompt(
  treatment: TreatmentType,
  stageName: string,
  stageMonth: number,
  stageProgress: number
): string {
  const commonHeader = `Use the provided patient's photograph as the source image.
Preserve the patient's identity, facial structure, skin tone, lips, hair, lighting and background.
Modify primarily the visible teeth/smile region.
Do not modify unrelated facial features.
This is a visual simulation for communication and educational purposes, not a guaranteed clinical outcome.`;

  if (treatment === "clear_aligners") {
    return `${commonHeader}

TREATMENT: Clear Aligners
STAGE: ${stageName} (Month ${stageMonth}, Progress: ${stageProgress}%)
SIMULATION OBJECTIVES:
- Simulate progressive orthodontic clear aligner tooth movement.
- Alignment degree: ${stageProgress}% of total correction.
- Gradual de-crowding of rotated maxillary central and lateral incisors.
- Harmonious dental arch widening and leveling of the incisal edges.
- Teeth should appear naturally integrated without artificial plastic sheen.`;
  }

  if (treatment === "dental_veneers") {
    return `${commonHeader}

TREATMENT: Dental Veneers
STAGE: ${stageName} (Month ${stageMonth}, Progress: ${stageProgress}%)
SIMULATION OBJECTIVES:
- Simulate porcelain veneer cosmetic smile rehabilitation.
- Stage progress: ${stageProgress}%.
- Correct incisal wear, micro-fractures, and deep discoloration.
- Target shade: Natural Vita Bleach 3 / B1 with lifelike translucency in incisal third.
- Golden proportion aesthetic symmetry across teeth #6 through #11.
- Gingival margin zenith balance.`;
  }

  // braces
  return `${commonHeader}

TREATMENT: Comprehensive Fixed Orthodontic Braces
STAGE: ${stageName} (Month ${stageMonth}, Progress: ${stageProgress}%)
SIMULATION OBJECTIVES:
- Simulate orthodontic archwire progression and bracket engagement.
- Progressive leveling and alignment of crowded anterior teeth.
- Reduction of anterior rotation and overjet proportional to ${stageProgress}%.
- ${stageProgress >= 90 ? "Bracket debonding simulation with final polished enamel." : "Low-profile aesthetic ceramic/metallic brackets."}`;
}

/**
 * Core AI generation service function
 */
export async function generateSmileSimulation(
  input: AISimulationInput
): Promise<AISimulationOutput> {
  const promptUsed = buildTreatmentPrompt(
    input.treatmentType,
    input.stage,
    input.stageMonth,
    input.stageProgress
  );

  // Artificial realistic AI inference latency (120ms - 400ms)
  await new Promise((resolve) => setTimeout(resolve, 250 + Math.random() * 200));

  let imageUrl = input.patientImage;

  // Check if image is an SVG or pre-seeded
  if (input.patientImage.includes("Ananya Menon")) {
    const key = `month${input.stageMonth}` as keyof typeof SAMPLE_PATIENT_IMAGES.ananya.stages;
    if (input.stageProgress === 0) {
      imageUrl = SAMPLE_PATIENT_IMAGES.ananya.stages.initial;
    } else if (input.stageProgress >= 100) {
      imageUrl = SAMPLE_PATIENT_IMAGES.ananya.stages.final;
    } else if (SAMPLE_PATIENT_IMAGES.ananya.stages[key]) {
      imageUrl = SAMPLE_PATIENT_IMAGES.ananya.stages[key];
    } else {
      imageUrl = createDentalSmileSvg({
        patientName: "Ananya Menon",
        stageLabel: `${input.stage} (${input.stageProgress}%)`,
        crowdingLevel: Math.round(90 * (1 - input.stageProgress / 100)),
        alignment: Math.round(15 + (85 * input.stageProgress) / 100),
        whiteness: Math.round(20 + (78 * input.stageProgress) / 100),
        skinTone: "#d99773",
        lipColor: "#bd5366",
        treatment: "Clear Aligners",
      });
    }
  } else if (input.patientImage.includes("Rahul Kumar")) {
    if (input.stageProgress === 0) {
      imageUrl = SAMPLE_PATIENT_IMAGES.rahul.stages.initial;
    } else if (input.stageProgress >= 100) {
      imageUrl = SAMPLE_PATIENT_IMAGES.rahul.stages.final;
    } else {
      imageUrl = createDentalSmileSvg({
        patientName: "Rahul Kumar",
        stageLabel: `${input.stage} (${input.stageProgress}%)`,
        crowdingLevel: Math.round(20 * (1 - input.stageProgress / 100)),
        alignment: Math.round(60 + (40 * input.stageProgress) / 100),
        whiteness: Math.round(5 + (95 * input.stageProgress) / 100),
        skinTone: "#bf8360",
        lipColor: "#a34552",
        treatment: "Dental Veneers",
      });
    }
  } else if (input.patientImage.includes("Meera S")) {
    if (input.stageProgress === 0) {
      imageUrl = SAMPLE_PATIENT_IMAGES.meera.stages.initial;
    } else if (input.stageProgress >= 100) {
      imageUrl = SAMPLE_PATIENT_IMAGES.meera.stages.final;
    } else {
      imageUrl = createDentalSmileSvg({
        patientName: "Meera S",
        stageLabel: `${input.stage} (${input.stageProgress}%)`,
        crowdingLevel: Math.round(80 * (1 - input.stageProgress / 100)),
        alignment: Math.round(20 + (80 * input.stageProgress) / 100),
        whiteness: Math.round(35 + (55 * input.stageProgress) / 100),
        hasBraces: input.stageProgress < 90,
        skinTone: "#e6b095",
        lipColor: "#c96574",
        treatment: "Braces",
      });
    }
  } else {
    // For custom uploaded photos: Procedural simulation overlay or SVG generation
    imageUrl = createDentalSmileSvg({
      patientName: "Patient Simulation",
      stageLabel: `${input.stage} (${input.stageProgress}%)`,
      crowdingLevel: Math.round(80 * (1 - input.stageProgress / 100)),
      alignment: Math.round(25 + (75 * input.stageProgress) / 100),
      whiteness: Math.round(25 + (70 * input.stageProgress) / 100),
      hasBraces: input.treatmentType === "braces" && input.stageProgress < 90,
      treatment:
        input.treatmentType === "clear_aligners"
          ? "Clear Aligners"
          : input.treatmentType === "dental_veneers"
          ? "Dental Veneers"
          : "Braces",
    });
  }

  return {
    imageUrl,
    stage: input.stage,
    month: input.stageMonth,
    status: "completed",
    promptUsed,
  };
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
