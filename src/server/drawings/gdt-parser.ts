import { ExtractedCallout } from "./rules/types";

/**
 * Deterministic GD&T & Feature Callout Parser
 * Extracts tolerances, geometric characteristics, modifiers (MMC/LMC), datums,
 * surface roughness (Ra), thread specs, hole fits (H7), pockets, and wall thicknesses.
 */
export function parseGDTCallouts(lines: string[]): ExtractedCallout[] {
  const callouts: ExtractedCallout[] = [];
  let index = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    index++;
    const initialCalloutsLength = callouts.length;

    // Detect Flatness (e.g. "Flatness 0.03", "⏛ 0.05", "FLATNESS 0.02mm")
    if (/\b(?:flatness|⏛)\b/i.test(trimmed) || /flat\s*<[0-9.]+/i.test(trimmed)) {
      const match = trimmed.match(/(?:flatness|⏛|flat)\s*[:=]?\s*(?:<|≤)?\s*([0-9.]+)/i);
      if (match) {
        callouts.push({
          id: `callout-${index}`,
          rawText: trimmed,
          characteristic: "FLATNESS",
          numericValue: parseFloat(match[1]),
          unit: trimmed.includes("inch") || trimmed.includes("in") ? "inches" : "mm",
          datumsReferenced: extractDatums(trimmed),
          featureType: "SURFACE",
        });
      }
    }

    // Detect Position tolerance (e.g. "Position Ø0.08 MMC relative to A|B|C", "⌖ 0.08 M A B C")
    if (
      callouts.length === initialCalloutsLength &&
      (/\b(?:position|pos|⌖)\b/i.test(trimmed) || /Ø?\s*0\.\d+\s*(?:MMC|LMC|M|L)/i.test(trimmed))
    ) {
      const match = trimmed.match(/(?:position|pos|⌖)?\s*Ø?\s*([0-9.]+)\s*(MMC|LMC|M|L)?/i);
      if (match && parseFloat(match[1]) <= 1.0) {
        const mod = match[2]?.toUpperCase();
        callouts.push({
          id: `callout-${index}`,
          rawText: trimmed,
          characteristic: "POSITION",
          numericValue: parseFloat(match[1]),
          unit: trimmed.includes("inch") ? "inches" : "mm",
          modifier: mod?.startsWith("M") ? "MMC" : mod?.startsWith("L") ? "LMC" : "RFS",
          datumsReferenced: extractDatums(trimmed),
          featureType: "HOLE",
        });
      }
    }

    // Detect Hole fits (e.g., "Ø12 H7", "H7 hole", "8 H7 (+0.015/0)")
    if (
      callouts.length === initialCalloutsLength &&
      (/\b[A-Z]\d{1,2}\b/.test(trimmed) || /hole\s*h\d+/i.test(trimmed))
    ) {
      const match = trimmed.match(/\b([A-Z]\d{1,2})\b/);
      if (match && ["H7", "H8", "H6", "P7", "G6", "F7", "N7"].includes(match[1].toUpperCase())) {
        callouts.push({
          id: `callout-${index}`,
          rawText: trimmed,
          characteristic: "HOLE_FIT",
          numericValue: 0.015,
          unit: "mm",
          datumsReferenced: extractDatums(trimmed),
          featureType: "BORE",
        });
      }
    }

    // Detect Surface Finish / Roughness
    if (
      callouts.length === initialCalloutsLength &&
      (/\bra\s*[:=]?\s*([0-9.]+)/i.test(trimmed) || /([0-9.]+)\s*µm\s*ra/i.test(trimmed))
    ) {
      const match = trimmed.match(/ra\s*[:=]?\s*([0-9.]+)/i) || trimmed.match(/([0-9.]+)\s*µm/i);
      if (match) {
        const raVal = parseFloat(match[1]);
        callouts.push({
          id: `callout-${index}`,
          rawText: trimmed,
          characteristic: "SURFACE_ROUGHNESS",
          numericValue: raVal,
          unit: "mm",
          surfaceFinishRa: raVal,
          datumsReferenced: [],
          featureType: "SURFACE",
        });
      }
    }

    // Detect Deep Pocket or Cutter Aspect Ratio
    if (
      callouts.length === initialCalloutsLength &&
      /\b(?:pocket|depth|aspect|cutter)\b/i.test(trimmed) &&
      /(?:depth\s*>|ratio|cutter|dia|\d+x)/i.test(trimmed)
    ) {
      const aspectMatch =
        trimmed.match(/(?:depth\/dia|aspect|depth)\s*[:=]?\s*([0-9.]+)\s*x?/i) ||
        trimmed.match(/([0-9.]+)\s*[:x]\s*1/i);
      const ratio = aspectMatch ? parseFloat(aspectMatch[1]) : 4.5;
      callouts.push({
        id: `callout-${index}`,
        rawText: trimmed,
        characteristic: "POCKET_ASPECT_RATIO",
        numericValue: ratio,
        unit: "mm",
        aspectRatio: ratio,
        datumsReferenced: [],
        featureType: "POCKET",
      });
    }

    // Detect Thin Wall Thickness
    if (
      callouts.length === initialCalloutsLength &&
      /\b(?:wall|thickness)\b/i.test(trimmed) &&
      /([0-9.]+)\s*(?:mm|in)/i.test(trimmed)
    ) {
      const wallMatch = trimmed.match(/(?:wall|thickness)\s*[:=]?\s*([0-9.]+)/i);
      if (wallMatch) {
        const wallVal = parseFloat(wallMatch[1]);
        if (wallVal <= 4.0) {
          callouts.push({
            id: `callout-${index}`,
            rawText: trimmed,
            characteristic: "WALL_THICKNESS",
            numericValue: wallVal,
            unit: trimmed.includes("in") ? "inches" : "mm",
            wallThicknessMm: trimmed.includes("in") ? wallVal * 25.4 : wallVal,
            datumsReferenced: [],
            featureType: "WALL",
          });
        }
      }
    }

    // Detect Threads
    if (
      callouts.length === initialCalloutsLength &&
      /\b(?:M\d+x[0-9.]+|\d+\/\d+-\d+\s*UN[CF]|STI|Helicoil)\b/i.test(trimmed)
    ) {
      callouts.push({
        id: `callout-${index}`,
        rawText: trimmed,
        characteristic: "THREAD_SPEC",
        numericValue: 1.0,
        unit: trimmed.includes("UNC") || trimmed.includes("UNF") ? "inches" : "mm",
        datumsReferenced: [],
        featureType: "THREAD",
      });
    }

    // Detect Concentricity / Runout
    if (
      callouts.length === initialCalloutsLength &&
      /\b(?:concentricity|runout|⌭|↗)\b/i.test(trimmed)
    ) {
      const match = trimmed.match(/(?:concentricity|runout|⌭|↗)\s*[:=]?\s*([0-9.]+)/i);
      if (match) {
        callouts.push({
          id: `callout-${index}`,
          rawText: trimmed,
          characteristic: trimmed.toLowerCase().includes("runout")
            ? "CIRCULAR_RUNOUT"
            : "CONCENTRICITY",
          numericValue: parseFloat(match[1]),
          unit: "mm",
          datumsReferenced: extractDatums(trimmed),
          featureType: "BORE",
        });
      }
    }

    // Detect Generic Tighter Tolerances if no specific characteristic matched yet
    if (callouts.length === initialCalloutsLength && /±\s*0\.0[0-9]+/i.test(trimmed)) {
      const match = trimmed.match(/±\s*([0-9.]+)/);
      if (match) {
        callouts.push({
          id: `callout-${index}`,
          rawText: trimmed,
          characteristic: "DIMENSION_GENERIC",
          numericValue: parseFloat(match[1]),
          unit: trimmed.includes("in") ? "inches" : "mm",
          datumsReferenced: extractDatums(trimmed),
          featureType: "GENERAL",
        });
      }
    }
  }

  return callouts;
}

function extractDatums(text: string): string[] {
  const datums: string[] = [];
  const matches = text.match(/\b([A-Z])\b/g);
  if (matches) {
    for (const m of matches) {
      if (["A", "B", "C", "D", "E", "F"].includes(m) && !datums.includes(m)) {
        datums.push(m);
      }
    }
  }
  return datums;
}
