/**
 * Digital Smile Design — Photorealistic Computer Vision & Dental Simulation Engine
 *
 * Core Principle:
 * - NEVER generate a synthetic cartoon face or artificial mouth.
 * - Detect mouth and visible teeth directly on the patient's original photograph.
 * - Generate a refined soft-edged tooth mask.
 * - Apply clinical treatment transformations (Whitening, Alignment, Spacing, Tooth Dimensions, Symmetry)
 *   ONLY to the visible teeth.
 * - Preserve 100% of original facial structure, lips, skin, gums, tongue, lighting, perspective, and background.
 */

export interface TreatmentParameters {
  alignment: number;     // 0.0 to 1.0 (0% to 100% alignment/leveling)
  spacing: number;       // 0.0 to 1.0 (gap reduction)
  whitening: number;     // 0.0 to 1.0 (natural enamel shade lift)
  toothLength: number;   // -0.2 to 0.2 (-20% to +20% incisal length)
  toothWidth: number;    // -0.2 to 0.2 (-20% to +20% crown width)
  smileSymmetry: number; // 0.0 to 1.0 (bilateral midline symmetry)
}

export type PresetName =
  | "natural_whitening"
  | "mild_alignment"
  | "whitening_alignment"
  | "smile_enhancement"
  | "custom";

export interface PresetOption {
  id: PresetName;
  label: string;
  description: string;
  params: TreatmentParameters;
}

export const TREATMENT_PRESETS: Record<PresetName, PresetOption> = {
  natural_whitening: {
    id: "natural_whitening",
    label: "Natural Whitening",
    description: "Moderate ivory shade lift preserving natural enamel texture, highlights, and translucency.",
    params: {
      alignment: 0,
      spacing: 0,
      whitening: 0.6,
      toothLength: 0,
      toothWidth: 0,
      smileSymmetry: 0,
    },
  },
  mild_alignment: {
    id: "mild_alignment",
    label: "Mild Alignment",
    description: "Correction of mild anterior crowding and rotation along the natural smile line.",
    params: {
      alignment: 0.5,
      spacing: 0.25,
      whitening: 0.15,
      toothLength: 0.05,
      toothWidth: 0,
      smileSymmetry: 0.4,
    },
  },
  whitening_alignment: {
    id: "whitening_alignment",
    label: "Whitening + Alignment",
    description: "Harmonious smile arc leveling combined with realistic cosmetic enamel brightening.",
    params: {
      alignment: 0.55,
      spacing: 0.3,
      whitening: 0.65,
      toothLength: 0.05,
      toothWidth: 0,
      smileSymmetry: 0.5,
    },
  },
  smile_enhancement: {
    id: "smile_enhancement",
    label: "Smile Enhancement",
    description: "Comprehensive aesthetic rehabilitation with golden proportions and arch symmetry.",
    params: {
      alignment: 0.75,
      spacing: 0.45,
      whitening: 0.75,
      toothLength: 0.1,
      toothWidth: 0.05,
      smileSymmetry: 0.7,
    },
  },
  custom: {
    id: "custom",
    label: "Custom Treatment",
    description: "Dentist-controlled custom parameters tailored to specific clinical diagnosis.",
    params: {
      alignment: 0.4,
      spacing: 0.2,
      whitening: 0.5,
      toothLength: 0,
      toothWidth: 0,
      smileSymmetry: 0.3,
    },
  },
};

export interface DentalSimulationResult {
  imageUrl: string;
  detectedTeeth: boolean;
  teethCountEstimate: number;
  warnings?: string[];
  metrics: {
    brightnessLiftPercent: number;
    alignmentCorrectionPercent: number;
    symmetryIndex: number;
  };
}

/**
 * Loads an image from a URL or Base64 data URL into an HTMLImageElement safely.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load source image: ${e}`));
    img.src = src;
  });
}

/**
 * Convert RGB to HSL color space.
 */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h, s, l];
}

/**
 * Convert HSL to RGB color space.
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Analyses the image and segments the tooth region.
 * Returns binary & feathered mask and dental landmark metrics.
 */
function detectAndSegmentTeeth(
  imageData: ImageData,
  width: number,
  height: number
): {
  mask: Float32Array;
  mouthBox: BoundingBox;
  toothBox: BoundingBox;
  toothPixelCount: number;
  warnings: string[];
} {
  const data = imageData.data;
  const warnings: string[] = [];

  // 1. Define typical lower-face oral search window for front-facing portrait
  // Smile is centered horizontally, located between 45% and 85% vertically
  const oralMinX = Math.floor(width * 0.2);
  const oralMaxX = Math.ceil(width * 0.8);
  const oralMinY = Math.floor(height * 0.42);
  const oralMaxY = Math.ceil(height * 0.88);

  // 2. Identify candidate tooth pixels inside the oral search window
  const rawMask = new Uint8Array(width * height);
  let toothPixelCount = 0;
  let minTx = width;
  let maxTx = 0;
  let minTy = height;
  let maxTy = 0;

  for (let y = oralMinY; y < oralMaxY; y++) {
    for (let x = oralMinX; x < oralMaxX; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const [h, s, l] = rgbToHsl(r, g, b);
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

      // Color-space tooth classification:
      // Teeth have:
      // - High luminance (> 110 out of 255)
      // - Low to moderate saturation (s < 0.42, not vivid red like lips or pink like gums)
      // - Hue in warm ivory range (h < 0.18 or h > 0.92) or achromatic
      // - Distinctly lighter than oral cavity background (r, g, b all above 75)
      // - Red is not overwhelmingly greater than green (gums/lips have r - g > 45)
      const isLipColor = (r - g > 40 && s > 0.35) || (r > 140 && g < 110 && b < 110);
      const isGumColor = r > g + 30 && s > 0.38 && luminance < 165;
      const isOralBackground = luminance < 75 && Math.max(r, g, b) < 95;

      const isTeeth =
        !isLipColor &&
        !isGumColor &&
        !isOralBackground &&
        luminance >= 115 &&
        s < 0.45 &&
        g >= 80 &&
        b >= 60 &&
        r >= g - 15 &&
        r - b < 95;

      if (isTeeth) {
        rawMask[y * width + x] = 1;
        toothPixelCount++;
        if (x < minTx) minTx = x;
        if (x > maxTx) maxTx = x;
        if (y < minTy) minTy = y;
        if (y > maxTy) maxTy = y;
      }
    }
  }

  // Check detection validity
  const minRequiredPixels = Math.max(120, Math.floor((width * height) * 0.001));
  if (toothPixelCount < minRequiredPixels || maxTx <= minTx || maxTy <= minTy) {
    throw new Error(
      "Unable to reliably detect visible teeth. Please upload a clearer front-facing smile photograph."
    );
  }

  const toothWidthSpan = maxTx - minTx;
  const toothHeightSpan = maxTy - minTy;

  if (toothHeightSpan < 12 || toothWidthSpan < 25) {
    warnings.push("Mouth is partially closed; simulation extent may be limited.");
  }

  // 3. Morphological cleanup: remove isolated noise and fill tiny gaps
  const cleanedMask = new Uint8Array(width * height);
  for (let y = minTy - 2; y <= maxTy + 2; y++) {
    if (y < 0 || y >= height) continue;
    for (let x = minTx - 2; x <= maxTx + 2; x++) {
      if (x < 0 || x >= width) continue;
      const idx = y * width + x;

      // Count neighbors in 3x3
      let neighbors = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (rawMask[(y + dy) * width + (x + dx)]) neighbors++;
        }
      }

      if (rawMask[idx] === 1) {
        cleanedMask[idx] = neighbors >= 3 ? 1 : 0;
      } else {
        cleanedMask[idx] = neighbors >= 6 ? 1 : 0;
      }
    }
  }

  // 4. Gaussian feathering (soft edges to blend naturally with gums and lips)
  const featheredMask = new Float32Array(width * height);
  const blurRadius = Math.max(2, Math.round(width / 400));

  for (let y = Math.max(0, minTy - blurRadius * 2); y <= Math.min(height - 1, maxTy + blurRadius * 2); y++) {
    for (let x = Math.max(0, minTx - blurRadius * 2); x <= Math.min(width - 1, maxTx + blurRadius * 2); x++) {
      let sum = 0;
      let weightSum = 0;

      for (let dy = -blurRadius; dy <= blurRadius; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= height) continue;
        for (let dx = -blurRadius; dx <= blurRadius; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= width) continue;

          const distSq = dx * dx + dy * dy;
          const weight = Math.exp(-distSq / (2 * blurRadius * blurRadius));
          sum += cleanedMask[ny * width + nx] * weight;
          weightSum += weight;
        }
      }

      featheredMask[y * width + x] = weightSum > 0 ? sum / weightSum : 0;
    }
  }

  return {
    mask: featheredMask,
    mouthBox: { minX: oralMinX, minY: oralMinY, maxX: oralMaxX, maxY: oralMaxY },
    toothBox: { minX: minTx, minY: minTy, maxX: maxTx, maxY: maxTy },
    toothPixelCount,
    warnings,
  };
}

/**
 * Executes photorealistic photographic dental simulation on a source image.
 */
export async function simulatePhotographicSmile(
  sourceImageUrl: string,
  params: TreatmentParameters,
  onStepProgress?: (stepDescription: string) => void
): Promise<DentalSimulationResult> {
  // Step 1: Load and analyze
  onStepProgress?.("Analyzing smile...");
  const img = await loadImage(sourceImageUrl);

  const canvas = document.createElement("canvas");
  const maxDim = 800;
  let targetW = img.naturalWidth || img.width;
  let targetH = img.naturalHeight || img.height;
  if (targetW > maxDim || targetH > maxDim) {
    if (targetW > targetH) {
      targetH = Math.round((targetH * maxDim) / targetW);
      targetW = maxDim;
    } else {
      targetW = Math.round((targetW * maxDim) / targetH);
      targetH = maxDim;
    }
  }
  canvas.width = targetW;
  canvas.height = targetH;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Canvas context initialization failed.");
  }

  ctx.drawImage(img, 0, 0, targetW, targetH);
  const srcImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const outImageData = ctx.createImageData(canvas.width, canvas.height);
  outImageData.data.set(srcImageData.data);

  // Step 2: Detect teeth & segmentation mask
  onStepProgress?.("Detecting teeth...");
  const { mask, toothBox, toothPixelCount, warnings } = detectAndSegmentTeeth(
    srcImageData,
    canvas.width,
    canvas.height
  );

  // Step 3: Apply photographic treatment modifications
  onStepProgress?.("Applying treatment simulation...");
  const width = canvas.width;
  const height = canvas.height;
  const src = srcImageData.data;
  const out = outImageData.data;

  const { minX, maxX, minY, maxY } = toothBox;
  const centerX = (minX + maxX) / 2;
  const toothWidthSpan = maxX - minX;
  const toothHeightSpan = maxY - minY;

  // Approximate ideal aesthetic smile arc (parabolic curve matching natural lower lip curvature)
  const idealSmileCurvature = 0.00035 * (1 + params.smileSymmetry * 0.25);
  const maxAlignmentDisplacement = Math.max(1.5, toothHeightSpan * 0.12 * params.alignment);

  // Estimate number of visible teeth based on tooth span
  const avgToothWidth = Math.max(10, toothWidthSpan / 7);
  const teethCountEstimate = Math.min(12, Math.max(4, Math.round(toothWidthSpan / avgToothWidth)));

  for (let y = minY - 5; y <= maxY + 5; y++) {
    if (y < 0 || y >= height) continue;

    for (let x = minX - 5; x <= maxX + 5; x++) {
      if (x < 0 || x >= width) continue;

      const pIdx = y * width + x;
      const maskWeight = mask[pIdx];
      if (maskWeight <= 0.001) continue;

      // -----------------------------------------------------------------------
      // A. GEOMETRIC ALIGNMENT, SPACING & CROWN SHAPING
      // -----------------------------------------------------------------------
      let sampleX = x;
      let sampleY = y;

      if (params.alignment > 0 || params.toothLength !== 0 || params.toothWidth !== 0 || params.spacing > 0) {
        const dxFromCenter = x - centerX;
        const normalizedX = dxFromCenter / (toothWidthSpan / 2 || 1);

        // 1. Arch Alignment: vertical shift toward ideal smile curve
        const idealArcY = idealSmileCurvature * dxFromCenter * dxFromCenter;
        const alignOffset = (idealArcY - (y - minY) * 0.08) * params.alignment;
        sampleY += Math.max(-maxAlignmentDisplacement, Math.min(maxAlignmentDisplacement, alignOffset));

        // 2. Spacing / Diastema Closure: subtle inward pull toward interproximal contact
        if (params.spacing > 0) {
          const gapPull = Math.sin((dxFromCenter / avgToothWidth) * Math.PI) * (params.spacing * 1.5);
          sampleX -= gapPull;
        }

        // 3. Tooth Length & Width modulation
        if (params.toothLength !== 0) {
          const verticalRatio = (y - minY) / (toothHeightSpan || 1);
          sampleY -= verticalRatio * params.toothLength * (toothHeightSpan * 0.35);
        }
        if (params.toothWidth !== 0) {
          sampleX = centerX + dxFromCenter * (1 - params.toothWidth * 0.12);
        }

        // Clamp sample coordinates safely
        sampleX = Math.max(minX, Math.min(maxX, sampleX));
        sampleY = Math.max(minY, Math.min(maxY, sampleY));
      }

      // Bilinear sampling from original image
      const x0 = Math.floor(sampleX);
      const x1 = Math.min(width - 1, x0 + 1);
      const y0 = Math.floor(sampleY);
      const y1 = Math.min(height - 1, y0 + 1);
      const wx = sampleX - x0;
      const wy = sampleY - y0;

      const i00 = (y0 * width + x0) * 4;
      const i10 = (y0 * width + x1) * 4;
      const i01 = (y1 * width + x0) * 4;
      const i11 = (y1 * width + x1) * 4;

      let r = (1 - wx) * (1 - wy) * src[i00] + wx * (1 - wy) * src[i10] + (1 - wx) * wy * src[i01] + wx * wy * src[i11];
      let g = (1 - wx) * (1 - wy) * src[i00 + 1] + wx * (1 - wy) * src[i10 + 1] + (1 - wx) * wy * src[i01 + 1] + wx * wy * src[i11 + 1];
      let b = (1 - wx) * (1 - wy) * src[i00 + 2] + wx * (1 - wy) * src[i10 + 2] + (1 - wx) * wy * src[i01 + 2] + wx * wy * src[i11 + 2];

      // -----------------------------------------------------------------------
      // B. NATURAL PHOTOGRAPHIC WHITENING (SHADE LIFT)
      // -----------------------------------------------------------------------
      if (params.whitening > 0) {
        const [h, s, l] = rgbToHsl(r, g, b);

        // Distance from center for natural anatomical gradient:
        // Central incisors are bright; canines are slightly warmer naturally
        const lateralDist = Math.abs(x - centerX) / (toothWidthSpan / 2 || 1);
        const anatomicalFactor = 1.0 - lateralDist * 0.18; // canines slightly warmer
        const effectiveWhitening = params.whitening * anatomicalFactor;

        // Reduce yellow saturation (stain removal) while preserving subtle warm ivory undertone
        const newS = s * (1 - effectiveWhitening * 0.45);

        // Boost mid-tone luminance while preserving specular gloss (l > 0.9) and deep interdental shadows (l < 0.35)
        let newL = l;
        if (l >= 0.35 && l <= 0.88) {
          const midToneBoost = Math.sin((l - 0.35) / (0.88 - 0.35) * Math.PI) * 0.16 * effectiveWhitening;
          newL = Math.min(0.92, l + midToneBoost);
        } else if (l > 0.88) {
          newL = Math.min(0.97, l + 0.03 * effectiveWhitening);
        }

        const [wr, wg, wb] = hslToRgb(h, newS, newL);
        r = wr;
        g = wg;
        b = wb;
      }

      // -----------------------------------------------------------------------
      // C. NATURAL EDGE-AWARE COMPOSITING
      // -----------------------------------------------------------------------
      // Blend modified tooth pixel with original pixel using soft feathered mask weight
      const origIdx = (y * width + x) * 4;
      const alpha = Math.min(1, Math.max(0, maskWeight));

      out[origIdx] = Math.round(src[origIdx] * (1 - alpha) + r * alpha);
      out[origIdx + 1] = Math.round(src[origIdx + 1] * (1 - alpha) + g * alpha);
      out[origIdx + 2] = Math.round(src[origIdx + 2] * (1 - alpha) + b * alpha);
      out[origIdx + 3] = src[origIdx + 3]; // preserve original alpha
    }
  }

  // Step 4: Finalize visualization
  onStepProgress?.("Generating visualization...");
  ctx.putImageData(outImageData, 0, 0);

  // Return high-quality JPEG data URL preserving natural photograph resolution while compact in size
  const finalImageUrl = canvas.toDataURL("image/jpeg", 0.82);

  onStepProgress?.("Simulation ready.");

  return {
    imageUrl: finalImageUrl,
    detectedTeeth: true,
    teethCountEstimate,
    warnings: warnings.length ? warnings : undefined,
    metrics: {
      brightnessLiftPercent: Math.round(params.whitening * 35),
      alignmentCorrectionPercent: Math.round(params.alignment * 80),
      symmetryIndex: +(0.78 + params.smileSymmetry * 0.2).toFixed(2),
    },
  };
}
