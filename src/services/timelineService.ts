import { TreatmentStage } from "../types";

export interface GenerateTimelineParams {
  startDate: string; // YYYY-MM-DD or readable string
  durationMonths: number;
  numberOfSittings: number;
  customSittingDates?: string[];
}

/**
 * Automatically calculates the treatment timeline according to doctor prescriptions.
 * Supports automatic spacing or custom sitting dates.
 */
export function generateTreatmentTimeline({
  startDate,
  durationMonths,
  numberOfSittings,
  customSittingDates,
}: GenerateTimelineParams): TreatmentStage[] {
  const parsedStartDate = new Date(startDate);
  const validStartDate = isNaN(parsedStartDate.getTime()) ? new Date() : parsedStartDate;

  const count = Math.max(1, numberOfSittings);
  const stages: TreatmentStage[] = [];

  // Stage 0: Initial
  stages.push({
    id: "stage-0",
    stageName: "Initial",
    month: 0,
    date: formatDate(validStartDate),
    sittingNumber: 0,
    progress: 0,
    status: "completed",
    clinicalObservations: "Baseline diagnostic records, facial & smile photography, 3D intraoral scan.",
  });

  // Intermediate and Final stages
  const monthStep = durationMonths / count;

  for (let i = 1; i <= count; i++) {
    const isFinal = i === count;
    const rawMonth = Math.round(i * monthStep);
    const month = Math.min(durationMonths, rawMonth);
    const progress = Math.min(100, Math.round((i / count) * 100));

    let stageDateStr: string;
    if (customSittingDates && customSittingDates[i - 1]) {
      stageDateStr = formatDate(new Date(customSittingDates[i - 1]));
    } else {
      const stageDate = new Date(validStartDate);
      stageDate.setMonth(stageDate.getMonth() + Math.round((i * durationMonths) / count));
      stageDateStr = formatDate(stageDate);
    }

    const stageName = isFinal ? `Final — Month ${durationMonths}` : `Month ${month}`;

    stages.push({
      id: `stage-${i}`,
      stageName,
      month,
      date: stageDateStr,
      sittingNumber: i,
      progress,
      status: "upcoming",
      clinicalObservations: isFinal
        ? "Target aesthetic and occlusal alignment achieved. Retention phase initiation."
        : `Progress check for Sitting ${i} of ${count}. Alignment tracking at ${progress}%.`,
    });
  }

  // Set the first non-initial stage as 'current' if pending
  if (stages.length > 1) {
    stages[1].status = "current";
  }

  return stages;
}

export function formatDate(date: Date): string {
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}
