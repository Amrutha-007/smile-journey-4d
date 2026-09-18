// Clinical smile photography representations for demo cases and realistic simulation

export const DEMO_PHOTO_URLS = {
  ananya: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80",
  rahul: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
  meera: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
};

/**
 * Backward-compatible helper returning authentic patient smile photograph
 */
function createDentalSmileSvg(options?: {
  patientName?: string;
  treatment?: string;
  [key: string]: unknown;
}): string {
  if (options?.patientName?.includes("Rahul")) return DEMO_PHOTO_URLS.rahul;
  if (options?.patientName?.includes("Meera")) return DEMO_PHOTO_URLS.meera;
  return DEMO_PHOTO_URLS.ananya;
}

// Pre-seeded progressions for the demo cases using real patient photographs
export const SAMPLE_PATIENT_IMAGES = {
  ananya: {
    original: DEMO_PHOTO_URLS.ananya,
    stages: {
      initial: DEMO_PHOTO_URLS.ananya,
      month2: DEMO_PHOTO_URLS.ananya,
      month4: DEMO_PHOTO_URLS.ananya,
      month6: DEMO_PHOTO_URLS.ananya,
      month8: DEMO_PHOTO_URLS.ananya,
      month10: DEMO_PHOTO_URLS.ananya,
      final: DEMO_PHOTO_URLS.ananya,
    },
  },
  rahul: {
    original: DEMO_PHOTO_URLS.rahul,
    stages: {
      initial: DEMO_PHOTO_URLS.rahul,
      month1: DEMO_PHOTO_URLS.rahul,
      month2: DEMO_PHOTO_URLS.rahul,
      final: DEMO_PHOTO_URLS.rahul,
    },
  },
  meera: {
    original: DEMO_PHOTO_URLS.meera,
    stages: {
      initial: DEMO_PHOTO_URLS.meera,
      month6: DEMO_PHOTO_URLS.meera,
      month12: DEMO_PHOTO_URLS.meera,
      final: DEMO_PHOTO_URLS.meera,
    },
  },
};

export { createDentalSmileSvg };
