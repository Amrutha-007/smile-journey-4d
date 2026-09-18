// Clinical smile photography representations for demo cases and procedural generation

function createDentalSmileSvg({
  patientName,
  stageLabel,
  crowdingLevel = 0, // 100 = high crowding, 0 = perfect
  whiteness = 0,     // 0 = natural/stained, 100 = bright pearlescent veneer
  alignment = 100,   // 0 = crooked, 100 = straight
  spacing = 0,       // spacing between teeth
  hasBraces = false,
  skinTone = "#e0a98b",
  lipColor = "#c25e6b",
  treatment = "Clear Aligners",
}: {
  patientName: string;
  stageLabel: string;
  crowdingLevel?: number;
  whiteness?: number;
  alignment?: number;
  spacing?: number;
  hasBraces?: boolean;
  skinTone?: string;
  lipColor?: string;
  treatment?: string;
}): string {
  // Tooth shades
  const toothR = Math.round(238 + (whiteness / 100) * 17);
  const toothG = Math.round(225 + (whiteness / 100) * 28);
  const toothB = Math.round(200 + (whiteness / 100) * 52);
  const toothColor = `rgb(${toothR}, ${toothG}, ${toothB})`;
  const shadowColor = `rgb(${Math.round(toothR * 0.82)}, ${Math.round(toothG * 0.8)}, ${Math.round(toothB * 0.78)})`;

  // Calculate teeth positions based on alignment and crowding
  const irregularity = (100 - alignment) * 0.25;
  const centralRot1 = ((100 - alignment) / 100) * 4;
  const centralRot2 = -((100 - alignment) / 100) * 3.5;
  const lateralDrop = ((100 - alignment) / 100) * 7;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <radialGradient id="faceGrad" cx="50%" cy="45%" r="55%">
      <stop offset="0%" stop-color="${skinTone}" stop-opacity="1" />
      <stop offset="80%" stop-color="${adjustBrightness(skinTone, -25)}" stop-opacity="1" />
      <stop offset="100%" stop-color="${adjustBrightness(skinTone, -45)}" stop-opacity="1" />
    </radialGradient>
    <linearGradient id="lipGradUpper" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${lipColor}" />
      <stop offset="100%" stop-color="${adjustBrightness(lipColor, -30)}" />
    </linearGradient>
    <linearGradient id="lipGradLower" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${adjustBrightness(lipColor, -15)}" />
      <stop offset="50%" stop-color="${lipColor}" />
      <stop offset="100%" stop-color="${adjustBrightness(lipColor, 20)}" />
    </linearGradient>
    <radialGradient id="oralCavity" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1c0508" />
      <stop offset="100%" stop-color="#0a0203" />
    </radialGradient>
    <linearGradient id="toothGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${toothColor}" />
      <stop offset="85%" stop-color="${toothColor}" />
      <stop offset="100%" stop-color="${shadowColor}" />
    </linearGradient>
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Background / Clinical Studio Lighting -->
  <rect width="800" height="600" fill="#0f172a" />
  <circle cx="400" cy="300" r="450" fill="url(#faceGrad)" />

  <!-- Chin & Cheek Contours -->
  <path d="M 180 200 C 180 440 260 550 400 560 C 540 550 620 440 620 200 Z" fill="url(#faceGrad)" />

  <!-- Philtrum & Cupid's Bow Area -->
  <path d="M 380 250 Q 400 270 420 250" stroke="${adjustBrightness(skinTone, -30)}" stroke-width="2" fill="none" opacity="0.4" />

  <!-- Oral Cavity (Behind Teeth) -->
  <path d="M 230 330 Q 400 310 570 330 Q 560 410 400 425 Q 240 410 230 330 Z" fill="url(#oralCavity)" />

  <!-- Gums / Gingiva -->
  <path d="M 240 332 Q 400 318 560 332 Q 550 345 400 342 Q 250 345 240 332 Z" fill="#b84c62" opacity="0.9" />

  <!-- Maxillary Arch (Upper Teeth) -->
  <g transform="translate(0, 0)">
    <!-- Right Molars / Premolars -->
    <path d="M 252 334 Q 262 336 270 342 Q 268 358 258 355 Z" fill="url(#toothGrad)" opacity="0.75" />
    <path d="M 270 336 Q 284 338 296 348 Q 292 368 276 364 Z" fill="url(#toothGrad)" opacity="0.85" />
    <path d="M 296 337 Q 312 339 324 353 Q 320 376 302 370 Z" fill="url(#toothGrad)" />

    <!-- Right Canine (Tooth #6 / #13) -->
    <path d="M 324 337 Q 342 339 350 357 Q 346 384 326 377 Z" fill="url(#toothGrad)" transform="rotate(${-irregularity * 0.4}, 337, 357)" />

    <!-- Right Lateral Incisor (Tooth #7 / #12) -->
    <rect x="${349 - irregularity * 0.8}" y="${336 + lateralDrop}" width="26" height="${46 - lateralDrop * 0.4}" rx="6" fill="url(#toothGrad)" transform="rotate(${irregularity * 0.8}, 362, 360)" filter="url(#softShadow)" />

    <!-- Right Central Incisor (Tooth #8 / #11) -->
    <rect x="${374 - irregularity * 0.4}" y="334" width="31" height="52" rx="7" fill="url(#toothGrad)" transform="rotate(${centralRot1}, 390, 360)" filter="url(#softShadow)" />

    <!-- Left Central Incisor (Tooth #9 / #21) -->
    <rect x="${404 + irregularity * 0.3}" y="334" width="31" height="52" rx="7" fill="url(#toothGrad)" transform="rotate(${centralRot2}, 420, 360)" filter="url(#softShadow)" />

    <!-- Left Lateral Incisor (Tooth #10 / #22) -->
    <rect x="${434 + irregularity * 0.7}" y="${336 + lateralDrop * 0.9}" width="26" height="${46 - lateralDrop * 0.4}" rx="6" fill="url(#toothGrad)" transform="rotate(${-irregularity * 0.7}, 447, 360)" filter="url(#softShadow)" />

    <!-- Left Canine (Tooth #11 / #23) -->
    <path d="M 460 337 Q 476 339 486 357 Q 478 384 458 377 Z" fill="url(#toothGrad)" transform="rotate(${irregularity * 0.5}, 470, 357)" />

    <!-- Left Premolars & Molars -->
    <path d="M 484 337 Q 500 339 514 353 Q 506 376 488 370 Z" fill="url(#toothGrad)" />
    <path d="M 512 336 Q 526 338 538 348 Q 532 368 518 364 Z" fill="url(#toothGrad)" opacity="0.85" />
    <path d="M 536 334 Q 546 336 554 342 Q 548 358 538 355 Z" fill="url(#toothGrad)" opacity="0.75" />
  </g>

  <!-- Lower Teeth (Subtle Incisal View) -->
  <path d="M 290 405 Q 400 414 510 405 Q 500 392 400 394 Q 300 392 290 405 Z" fill="${shadowColor}" opacity="0.85" />

  ${hasBraces ? `
  <!-- Orthodontic Braces & Archwire -->
  <g stroke="#94a3b8" stroke-width="2.5" fill="none">
    <path d="M 270 354 Q 400 366 530 354" />
    <!-- Brackets -->
    <rect x="306" y="348" width="10" height="10" rx="2" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5" />
    <rect x="333" y="352" width="10" height="10" rx="2" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5" />
    <rect x="357" y="354" width="10" height="10" rx="2" fill="#0284c7" stroke="#0369a1" stroke-width="1.5" />
    <rect x="384" y="355" width="12" height="11" rx="2" fill="#0284c7" stroke="#0369a1" stroke-width="1.5" />
    <rect x="414" y="355" width="12" height="11" rx="2" fill="#0284c7" stroke="#0369a1" stroke-width="1.5" />
    <rect x="441" y="354" width="10" height="10" rx="2" fill="#0284c7" stroke="#0369a1" stroke-width="1.5" />
    <rect x="466" y="352" width="10" height="10" rx="2" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5" />
    <rect x="494" y="348" width="10" height="10" rx="2" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5" />
  </g>
  ` : ""}

  <!-- Upper Lip -->
  <path d="M 210 326 C 270 300 340 286 384 296 C 394 298 400 302 406 298 C 450 286 520 300 590 326 C 540 338 460 332 400 331 C 340 332 260 338 210 326 Z" fill="url(#lipGradUpper)" filter="url(#softShadow)" />

  <!-- Lower Lip -->
  <path d="M 214 328 C 260 380 320 442 400 442 C 480 442 540 380 586 328 C 530 404 470 415 400 416 C 330 415 270 404 214 328 Z" fill="url(#lipGradLower)" filter="url(#softShadow)" />

  <!-- Lip Highlights & Gloss -->
  <path d="M 350 422 Q 400 430 450 422" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.35" />
  <ellipse cx="400" cy="425" rx="30" ry="4" fill="#ffffff" opacity="0.25" />

  <!-- Clinical Overlay Badge -->
  <g transform="translate(30, 30)">
    <rect width="260" height="64" rx="10" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1" />
    <text x="16" y="26" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#38bdf8">${patientName}</text>
    <text x="16" y="46" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#94a3b8">${treatment} • ${stageLabel}</text>
  </g>

  <!-- AI Simulation Watermark Disclaimer -->
  <g transform="translate(480, 530)">
    <rect width="290" height="40" rx="8" fill="rgba(15, 23, 42, 0.88)" stroke="rgba(56, 189, 248, 0.4)" stroke-width="1" />
    <circle cx="20" cy="20" r="6" fill="#38bdf8" />
    <text x="36" y="24" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="600" fill="#f8fafc">AI SIMULATION — POTENTIAL OUTCOME</text>
  </g>
</svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function adjustBrightness(col: string, percent: number): string {
  let num = parseInt(col.replace("#", ""), 16);
  if (isNaN(num)) return col;
  let amt = Math.round(2.55 * percent);
  let R = (num >> 16) + amt;
  let G = (num >> 8 & 0x00FF) + amt;
  let B = (num & 0x0000FF) + amt;
  return "#" + (
    0x1000000 +
    (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 0 ? 0 : B) : 255)
  ).toString(16).slice(1);
}

// Pre-seeded progressions for the demo cases
export const SAMPLE_PATIENT_IMAGES = {
  ananya: {
    original: createDentalSmileSvg({
      patientName: "Ananya Menon",
      stageLabel: "Baseline / Initial",
      crowdingLevel: 90,
      alignment: 15,
      whiteness: 20,
      skinTone: "#d99773",
      lipColor: "#bd5366",
      treatment: "Clear Aligners",
    }),
    stages: {
      initial: createDentalSmileSvg({
        patientName: "Ananya Menon",
        stageLabel: "Initial (Month 0)",
        crowdingLevel: 90,
        alignment: 15,
        whiteness: 20,
        skinTone: "#d99773",
        lipColor: "#bd5366",
        treatment: "Clear Aligners",
      }),
      month2: createDentalSmileSvg({
        patientName: "Ananya Menon",
        stageLabel: "Stage 1 (Month 2)",
        crowdingLevel: 75,
        alignment: 32,
        whiteness: 30,
        skinTone: "#d99773",
        lipColor: "#bd5366",
        treatment: "Clear Aligners",
      }),
      month4: createDentalSmileSvg({
        patientName: "Ananya Menon",
        stageLabel: "Stage 2 (Month 4)",
        crowdingLevel: 55,
        alignment: 50,
        whiteness: 45,
        skinTone: "#d99773",
        lipColor: "#bd5366",
        treatment: "Clear Aligners",
      }),
      month6: createDentalSmileSvg({
        patientName: "Ananya Menon",
        stageLabel: "Stage 3 (Month 6)",
        crowdingLevel: 40,
        alignment: 68,
        whiteness: 60,
        skinTone: "#d99773",
        lipColor: "#bd5366",
        treatment: "Clear Aligners",
      }),
      month8: createDentalSmileSvg({
        patientName: "Ananya Menon",
        stageLabel: "Stage 4 (Month 8)",
        crowdingLevel: 25,
        alignment: 82,
        whiteness: 75,
        skinTone: "#d99773",
        lipColor: "#bd5366",
        treatment: "Clear Aligners",
      }),
      month10: createDentalSmileSvg({
        patientName: "Ananya Menon",
        stageLabel: "Stage 5 (Month 10)",
        crowdingLevel: 10,
        alignment: 92,
        whiteness: 88,
        skinTone: "#d99773",
        lipColor: "#bd5366",
        treatment: "Clear Aligners",
      }),
      final: createDentalSmileSvg({
        patientName: "Ananya Menon",
        stageLabel: "Final (Month 12)",
        crowdingLevel: 0,
        alignment: 100,
        whiteness: 98,
        skinTone: "#d99773",
        lipColor: "#bd5366",
        treatment: "Clear Aligners",
      }),
    },
  },
  rahul: {
    original: createDentalSmileSvg({
      patientName: "Rahul Kumar",
      stageLabel: "Baseline / Initial",
      crowdingLevel: 20,
      alignment: 60,
      whiteness: 5,
      skinTone: "#bf8360",
      lipColor: "#a34552",
      treatment: "Dental Veneers",
    }),
    stages: {
      initial: createDentalSmileSvg({
        patientName: "Rahul Kumar",
        stageLabel: "Initial (Month 0)",
        crowdingLevel: 20,
        alignment: 60,
        whiteness: 5,
        skinTone: "#bf8360",
        lipColor: "#a34552",
        treatment: "Dental Veneers",
      }),
      month1: createDentalSmileSvg({
        patientName: "Rahul Kumar",
        stageLabel: "Stage 1 (Month 1)",
        crowdingLevel: 10,
        alignment: 75,
        whiteness: 45,
        skinTone: "#bf8360",
        lipColor: "#a34552",
        treatment: "Dental Veneers",
      }),
      month2: createDentalSmileSvg({
        patientName: "Rahul Kumar",
        stageLabel: "Stage 2 (Month 2)",
        crowdingLevel: 5,
        alignment: 90,
        whiteness: 75,
        skinTone: "#bf8360",
        lipColor: "#a34552",
        treatment: "Dental Veneers",
      }),
      final: createDentalSmileSvg({
        patientName: "Rahul Kumar",
        stageLabel: "Final (Month 3)",
        crowdingLevel: 0,
        alignment: 100,
        whiteness: 100,
        skinTone: "#bf8360",
        lipColor: "#a34552",
        treatment: "Dental Veneers",
      }),
    },
  },
  meera: {
    original: createDentalSmileSvg({
      patientName: "Meera S",
      stageLabel: "Baseline / Initial",
      crowdingLevel: 80,
      alignment: 20,
      whiteness: 35,
      hasBraces: true,
      skinTone: "#e6b095",
      lipColor: "#c96574",
      treatment: "Braces",
    }),
    stages: {
      initial: createDentalSmileSvg({
        patientName: "Meera S",
        stageLabel: "Initial (Month 0)",
        crowdingLevel: 80,
        alignment: 20,
        whiteness: 35,
        hasBraces: true,
        skinTone: "#e6b095",
        lipColor: "#c96574",
        treatment: "Braces",
      }),
      month6: createDentalSmileSvg({
        patientName: "Meera S",
        stageLabel: "Stage 3 (Month 6)",
        crowdingLevel: 45,
        alignment: 55,
        whiteness: 50,
        hasBraces: true,
        skinTone: "#e6b095",
        lipColor: "#c96574",
        treatment: "Braces",
      }),
      month12: createDentalSmileSvg({
        patientName: "Meera S",
        stageLabel: "Stage 6 (Month 12)",
        crowdingLevel: 20,
        alignment: 80,
        whiteness: 65,
        hasBraces: true,
        skinTone: "#e6b095",
        lipColor: "#c96574",
        treatment: "Braces",
      }),
      final: createDentalSmileSvg({
        patientName: "Meera S",
        stageLabel: "Final (Month 18)",
        crowdingLevel: 0,
        alignment: 100,
        whiteness: 90,
        hasBraces: false,
        skinTone: "#e6b095",
        lipColor: "#c96574",
        treatment: "Braces",
      }),
    },
  },
};

export { createDentalSmileSvg };
