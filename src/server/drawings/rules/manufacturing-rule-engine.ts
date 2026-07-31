import { DrawingMetadata, ExtractedCallout, RuleTriggerResult, ProcessDomain } from "./types";

export interface RuleDefinition {
  ruleId: string;
  ruleName: string;
  processDomain: ProcessDomain;
  description: string;
  evaluate: (metadata: DrawingMetadata, callout?: ExtractedCallout) => RuleTriggerResult | null;
}

/**
 * Production-Quality Manufacturing Rule Engine
 * Implements deterministic physics, GD&T, material, process domain, and manufacturability rules.
 */
export class ManufacturingRuleEngine {
  private rules: RuleDefinition[] = [];

  constructor() {
    this.registerRules();
  }

  private registerRules() {
    // --- 1. GD&T Rules ---

    // Flatness < 0.05 mm & < 0.03 mm
    this.rules.push({
      ruleId: "RULE_GDT_FLATNESS_TIGHT",
      ruleName: "Tight Flatness Tolerance (<0.05 mm)",
      processDomain: "GENERAL_GD_AND_T",
      description:
        "Flatness tolerances tighter than 0.05 mm cause machining warping and inspection challenges.",
      evaluate: (_meta, callout) => {
        if (callout?.characteristic === "FLATNESS" && callout.numericValue <= 0.05) {
          const isUltraTight = callout.numericValue <= 0.03;
          return {
            ruleId: isUltraTight ? "RULE_GDT_FLATNESS_ULTRA_TIGHT" : "RULE_GDT_FLATNESS_TIGHT",
            ruleName: isUltraTight
              ? "Ultra-Tight Flatness (<0.03 mm)"
              : "Tight Flatness (<0.05 mm)",
            processDomain: "GENERAL_GD_AND_T",
            confidence: "HIGH",
            confidenceScore: 0.95,
            impacts: {
              manufacturingComplexityDelta: isUltraTight ? 35 : 25,
              engineeringDifficultyDelta: isUltraTight ? 30 : 20,
              inspectionDifficultyDelta: isUltraTight ? 35 : 25,
              supplierComplexityDelta: 20,
              materialRiskDelta: 15,
              scrapProbabilityDelta: isUltraTight ? 20 : 12,
            },
            why: `Flatness ${callout.numericValue} mm requires multiple stress-relief and finishing passes. Thin parts flex during clamping, causing residual stress distortion, especially after anodizing or surface treatment.`,
            evidence: callout.rawText,
            recommendation:
              "Recommend CMM 9-point grid inspection. Incorporate stress-relief heat treatment between roughing and finish facing passes. Use vacuum or soft-jaw workholding.",
          };
        }
        return null;
      },
    });

    // Position Tolerance Ø0.08 MMC
    this.rules.push({
      ruleId: "RULE_GDT_POSITION_MMC_PRECISION",
      ruleName: "Precision Position Tolerance (≤Ø0.08 mm MMC)",
      processDomain: "GENERAL_GD_AND_T",
      description:
        "Tight true position callouts relative to datums demand high-precision fixturing and CMM routines.",
      evaluate: (_meta, callout) => {
        if (callout?.characteristic === "POSITION" && callout.numericValue <= 0.08) {
          const datums =
            callout.datumsReferenced.length > 0 ? callout.datumsReferenced.join("") : "ABC";
          return {
            ruleId: "RULE_GDT_POSITION_MMC_PRECISION",
            ruleName: "Precision Position Tolerance (≤Ø0.08 mm MMC)",
            processDomain: "GENERAL_GD_AND_T",
            confidence: "HIGH",
            confidenceScore: 0.92,
            impacts: {
              manufacturingComplexityDelta: 30,
              engineeringDifficultyDelta: 25,
              inspectionDifficultyDelta: 35,
              supplierComplexityDelta: 20,
              materialRiskDelta: 10,
              scrapProbabilityDelta: 15,
            },
            why: `Position tolerance Ø${callout.numericValue} mm MMC relative to Datum ${datums} requires precise datum setup, temperature-controlled machining environment, and high-repeatability CNC indexing.`,
            evidence: callout.rawText,
            recommendation:
              "Requires precision fixturing with hardened locating pins. Inspect using CMM with touch-trigger or optical probe. Design functional go/no-go pin gauge for shop-floor verification.",
          };
        }
        return null;
      },
    });

    // H7 Hole Fit
    this.rules.push({
      ruleId: "RULE_GDT_H7_HOLE_REAMING",
      ruleName: "Precision Bore Fit (H7/H8 Tolerance)",
      processDomain: "CNC_MILLING",
      description:
        "H7 precision hole fits require dedicated reaming, boring, or honing operations.",
      evaluate: (_meta, callout) => {
        if (callout?.characteristic === "HOLE_FIT") {
          return {
            ruleId: "RULE_GDT_H7_HOLE_REAMING",
            ruleName: "Precision Bore Fit (H7 Tolerance)",
            processDomain: "CNC_MILLING",
            confidence: "HIGH",
            confidenceScore: 0.9,
            impacts: {
              manufacturingComplexityDelta: 20,
              engineeringDifficultyDelta: 15,
              inspectionDifficultyDelta: 25,
              supplierComplexityDelta: 15,
              materialRiskDelta: 5,
              scrapProbabilityDelta: 10,
            },
            why: "H7 holes cannot be produced directly by drilling. They require precision reaming or CNC circular boring, specialized tool inventory, and strict chip evacuation to avoid bore scratching.",
            evidence: callout.rawText,
            recommendation:
              "Reaming operation required. Verify tool availability (H7 precision reamer). Inspect using calibrated plug pin gauges (Go / No-Go).",
          };
        }
        return null;
      },
    });

    // Surface Finish Ra 0.8
    this.rules.push({
      ruleId: "RULE_SURFACE_FINISH_FINE",
      ruleName: "Fine Surface Finish Specification (Ra ≤ 0.8 µm)",
      processDomain: "CNC_MILLING",
      description:
        "Fine surface finishes require secondary grinding, honing, or polishing operations.",
      evaluate: (_meta, callout) => {
        if (
          callout?.characteristic === "SURFACE_ROUGHNESS" &&
          callout.surfaceFinishRa !== undefined &&
          callout.surfaceFinishRa <= 0.8
        ) {
          return {
            ruleId: "RULE_SURFACE_FINISH_FINE",
            ruleName: "Fine Surface Finish (Ra ≤ 0.8 µm / 32 µin)",
            processDomain: "CNC_MILLING",
            confidence: "HIGH",
            confidenceScore: 0.94,
            impacts: {
              manufacturingComplexityDelta: 25,
              engineeringDifficultyDelta: 15,
              inspectionDifficultyDelta: 20,
              supplierComplexityDelta: 15,
              materialRiskDelta: 10,
              scrapProbabilityDelta: 10,
            },
            why: `Surface finish Ra ${callout.surfaceFinishRa} µm exceeds standard CNC milling capability (typically Ra 1.6 - 3.2 µm). Requires extra finishing operations (e.g., surface grinding, honing, or hand polishing).`,
            evidence: callout.rawText,
            recommendation:
              "Plan secondary finishing pass (fly cutting, grinding, or polishing). Measure surface roughness using a calibrated contact stylus profilometer.",
          };
        }
        return null;
      },
    });

    // Deep Pocket (Depth > 4x cutter diameter)
    this.rules.push({
      ruleId: "RULE_GEOM_DEEP_POCKET",
      ruleName: "Deep Pocket Aspect Ratio (>4x Cutter Diameter)",
      processDomain: "CNC_MILLING",
      description:
        "Pockets deeper than 4x tool diameter increase tool deflection and chatter risk.",
      evaluate: (_meta, callout) => {
        if (
          callout?.characteristic === "POCKET_ASPECT_RATIO" &&
          callout.aspectRatio !== undefined &&
          callout.aspectRatio >= 4.0
        ) {
          return {
            ruleId: "RULE_GEOM_DEEP_POCKET",
            ruleName: "Deep Pocket Aspect Ratio (>4x Diameter)",
            processDomain: "CNC_MILLING",
            confidence: "HIGH",
            confidenceScore: 0.91,
            impacts: {
              manufacturingComplexityDelta: 35,
              engineeringDifficultyDelta: 25,
              inspectionDifficultyDelta: 20,
              supplierComplexityDelta: 20,
              materialRiskDelta: 15,
              scrapProbabilityDelta: 25,
            },
            why: `Aspect ratio ${callout.aspectRatio}:1 causes tool chatter, poor surface finish, chip packing, and risk of cutter breakage during high-speed milling.`,
            evidence: callout.rawText,
            recommendation:
              "Use anti-vibration carbide extension shanks, high-pressure through-spindle coolant, and trochoidal milling toolpaths. Relax internal corner radii if feasible.",
          };
        }
        return null;
      },
    });

    // Thin Walls (<2 mm)
    this.rules.push({
      ruleId: "RULE_GEOM_THIN_WALL",
      ruleName: "Thin Wall Section (<2.0 mm)",
      processDomain: "CNC_MILLING",
      description: "Thin walls flex under cutting forces and warp from thermal release.",
      evaluate: (_meta, callout) => {
        if (
          callout?.characteristic === "WALL_THICKNESS" &&
          callout.wallThicknessMm !== undefined &&
          callout.wallThicknessMm < 2.0
        ) {
          return {
            ruleId: "RULE_GEOM_THIN_WALL",
            ruleName: "Thin Wall Deflection Risk (<2.0 mm)",
            processDomain: "CNC_MILLING",
            confidence: "HIGH",
            confidenceScore: 0.93,
            impacts: {
              manufacturingComplexityDelta: 30,
              engineeringDifficultyDelta: 25,
              inspectionDifficultyDelta: 25,
              supplierComplexityDelta: 20,
              materialRiskDelta: 20,
              scrapProbabilityDelta: 20,
            },
            why: `Wall thickness ${callout.wallThicknessMm} mm leads to severe deflection under cutting pressure, wall chatter, and distortion after unclamping or anodizing.`,
            evidence: callout.rawText,
            recommendation:
              "Use light finishing passes with high spindle speed (HST), balance cutting forces on both sides of wall simultaneously, or apply low-melting-point alloy support fill.",
          };
        }
        return null;
      },
    });

    // --- 2. Material Rules ---

    // Titanium
    this.rules.push({
      ruleId: "RULE_MAT_TITANIUM",
      ruleName: "Titanium Alloy (Ti-6Al-4V) Machining Risk",
      processDomain: "MATERIAL_SELECTION",
      description:
        "Titanium exhibits low thermal conductivity, high tool wear, and work hardening.",
      evaluate: (meta) => {
        if (meta.materialFamily === "TITANIUM") {
          return {
            ruleId: "RULE_MAT_TITANIUM",
            ruleName: "Titanium Alloy (Ti-6Al-4V) High Wear & Cost",
            processDomain: "MATERIAL_SELECTION",
            confidence: "HIGH",
            confidenceScore: 0.96,
            impacts: {
              manufacturingComplexityDelta: 35,
              engineeringDifficultyDelta: 25,
              inspectionDifficultyDelta: 15,
              supplierComplexityDelta: 25,
              materialRiskDelta: 35,
              scrapProbabilityDelta: 18,
            },
            why: "Titanium has poor thermal conductivity, concentrating heat at the cutting edge. Requires low cutting speeds (Vc), high coolant pressure, and frequent insert changes to prevent catastrophic tool wear.",
            evidence: `Material specified: ${meta.material}`,
            recommendation:
              "Use high-pressure through-tool coolant (>70 bar), dedicated PVD-coated carbide tooling, and rigid 5-axis machines. Account for 3-4x higher machining cycle time and tool cost.",
          };
        }
        return null;
      },
    });

    // Inconel
    this.rules.push({
      ruleId: "RULE_MAT_INCONEL",
      ruleName: "Inconel Nickel Superalloy Extreme Risk",
      processDomain: "MATERIAL_SELECTION",
      description:
        "Inconel causes severe work hardening, extreme cutting forces, and rapid notch wear.",
      evaluate: (meta) => {
        if (meta.materialFamily === "INCONEL") {
          return {
            ruleId: "RULE_MAT_INCONEL",
            ruleName: "Inconel Superalloy Extreme Risk",
            processDomain: "MATERIAL_SELECTION",
            confidence: "HIGH",
            confidenceScore: 0.98,
            impacts: {
              manufacturingComplexityDelta: 40,
              engineeringDifficultyDelta: 35,
              inspectionDifficultyDelta: 25,
              supplierComplexityDelta: 30,
              materialRiskDelta: 40,
              scrapProbabilityDelta: 30,
            },
            why: "Inconel 718/625 experiences extreme work hardening and high heat generation. Tool life is severely restricted, and stress-relief heat treatments are mandatory post-machining.",
            evidence: `Material specified: ${meta.material}`,
            recommendation:
              "Mandate specialized suppliers with aerospace nickel alloy capability. Use ceramic or whisker-reinforced inserts for roughing. Perform stress relief before final sizing.",
          };
        }
        return null;
      },
    });

    // Magnesium
    this.rules.push({
      ruleId: "RULE_MAT_MAGNESIUM",
      ruleName: "Magnesium Alloy Combustible Fire Hazard",
      processDomain: "MATERIAL_SELECTION",
      description: "Magnesium chips are highly flammable and pose severe explosive fire hazards.",
      evaluate: (meta) => {
        if (meta.materialFamily === "MAGNESIUM") {
          return {
            ruleId: "RULE_MAT_MAGNESIUM",
            ruleName: "Magnesium Flammable Chip Safety Hazard",
            processDomain: "MATERIAL_SELECTION",
            confidence: "HIGH",
            confidenceScore: 0.97,
            impacts: {
              manufacturingComplexityDelta: 30,
              engineeringDifficultyDelta: 20,
              inspectionDifficultyDelta: 15,
              supplierComplexityDelta: 35,
              materialRiskDelta: 35,
              scrapProbabilityDelta: 15,
            },
            why: "Magnesium fine chips and dust ignite rapidly when exposed to heat or sparks. Standard water-based coolants generate explosive hydrogen gas.",
            evidence: `Material specified: ${meta.material}`,
            recommendation:
              "Ensure supplier has Class D fire suppression systems and oil-based coolant setup. Keep tools sharp and feeds high to produce thick chips rather than fine dust.",
          };
        }
        return null;
      },
    });

    // Aluminum 7075-T6 Anodize Distortion
    this.rules.push({
      ruleId: "RULE_MAT_AL7075_ANODIZE",
      ruleName: "Aluminum 7075 Residual Stress & Anodize Distortion",
      processDomain: "MATERIAL_SELECTION",
      description:
        "High-strength Al 7075 releases internal stress during heavy milling and anodizing.",
      evaluate: (meta) => {
        if (meta.materialFamily === "ALUMINUM" && meta.material.includes("7075")) {
          return {
            ruleId: "RULE_MAT_AL7075_ANODIZE",
            ruleName: "Al 7075 Anodize & Stress Release Distortion",
            processDomain: "MATERIAL_SELECTION",
            confidence: "MEDIUM",
            confidenceScore: 0.85,
            impacts: {
              manufacturingComplexityDelta: 15,
              engineeringDifficultyDelta: 10,
              inspectionDifficultyDelta: 15,
              supplierComplexityDelta: 10,
              materialRiskDelta: 10,
              scrapProbabilityDelta: 8,
            },
            why: "Aluminum 7075-T6 is low material cost, but contains internal residual stresses. Heavy pocketing or hard anodizing can cause dimensional growth (0.005-0.015 mm per side) and part bowing.",
            evidence: `Material: ${meta.material}, Finish: ${meta.finish || "Anodize"}`,
            recommendation:
              "Specify stress-relieved stock (7075-T7351). Mask critical bearing bores before anodizing, or pre-machine with stock allowance prior to final pass.",
          };
        }
        return null;
      },
    });

    // --- 3. Process Domain Rules (Bonus Rules) ---

    // CNC Milling: Sharp Internal Corners
    this.rules.push({
      ruleId: "RULE_DOMAIN_CNC_MILL_CORNER",
      ruleName: "CNC Milling Internal Corner Radius (<1.5 mm)",
      processDomain: "CNC_MILLING",
      description:
        "Sharp internal vertical corners require small diameter endmills, slowing feeds.",
      evaluate: (_meta, callout) => {
        if (callout?.rawText.toLowerCase().includes("radius") && callout.numericValue < 1.5) {
          return {
            ruleId: "RULE_DOMAIN_CNC_MILL_CORNER",
            ruleName: "Small Internal Radius (R < 1.5 mm)",
            processDomain: "CNC_MILLING",
            confidence: "HIGH",
            confidenceScore: 0.88,
            impacts: {
              manufacturingComplexityDelta: 20,
              engineeringDifficultyDelta: 15,
              inspectionDifficultyDelta: 15,
              supplierComplexityDelta: 10,
              materialRiskDelta: 5,
              scrapProbabilityDelta: 10,
            },
            why: "Vertical internal corners with R < 1.5 mm require micro endmills (<3 mm dia), leading to high cycle times, tool chatter, and frequent cutter breakage.",
            evidence: callout.rawText,
            recommendation:
              "Increase internal corner radius to R ≥ 2.0 mm or add corner relief undercuts (dogbone corners) if non-functional.",
          };
        }
        return null;
      },
    });

    // Turning: High L/D Ratio (>4)
    this.rules.push({
      ruleId: "RULE_DOMAIN_TURNING_LD_RATIO",
      ruleName: "Turning High Length-to-Diameter Ratio (L/D > 4)",
      processDomain: "TURNING",
      description:
        "Slender turned parts flex under cutting forces, requiring tailstock/steady rest.",
      evaluate: (_meta, callout) => {
        if (
          callout?.rawText.toLowerCase().includes("turning") ||
          (callout?.characteristic === "CIRCULAR_RUNOUT" && callout.numericValue <= 0.02)
        ) {
          return {
            ruleId: "RULE_DOMAIN_TURNING_LD_RATIO",
            ruleName: "Turning Deflection & Concentricity (Runout ≤0.02 mm)",
            processDomain: "TURNING",
            confidence: "HIGH",
            confidenceScore: 0.89,
            impacts: {
              manufacturingComplexityDelta: 25,
              engineeringDifficultyDelta: 20,
              inspectionDifficultyDelta: 25,
              supplierComplexityDelta: 15,
              materialRiskDelta: 10,
              scrapProbabilityDelta: 12,
            },
            why: "Turned shafts with high L/D ratio or tight runout ≤ 0.02 mm flex away from cutting tool, resulting in taper, chatter marks, and out-of-roundness.",
            evidence: callout?.rawText || "Tight turning runout callout",
            recommendation:
              "Use live center tailstock support, follow rest, and multi-pass light depth of cut. Inspect runout on precision centers with dial test indicator (DTI).",
          };
        }
        return null;
      },
    });

    // Sheet Metal: Small Bend Radius
    this.rules.push({
      ruleId: "RULE_DOMAIN_SHEET_BEND_RADIUS",
      ruleName: "Sheet Metal Tight Bend Radius (<1x Thickness)",
      processDomain: "SHEET_METAL",
      description: "Bend radii tighter than 1x material thickness risk outer fiber cracking.",
      evaluate: (_meta, callout) => {
        if (
          callout?.rawText.toLowerCase().includes("bend") ||
          callout?.rawText.toLowerCase().includes("sheet")
        ) {
          return {
            ruleId: "RULE_DOMAIN_SHEET_BEND_RADIUS",
            ruleName: "Sheet Metal Bend Cracking & Springback",
            processDomain: "SHEET_METAL",
            confidence: "HIGH",
            confidenceScore: 0.87,
            impacts: {
              manufacturingComplexityDelta: 20,
              engineeringDifficultyDelta: 15,
              inspectionDifficultyDelta: 15,
              supplierComplexityDelta: 15,
              materialRiskDelta: 15,
              scrapProbabilityDelta: 15,
            },
            why: "Tight bend radii induce micro-fracturing on the outer tension surface and cause excessive springback, degrading dimensional accuracy.",
            evidence: callout.rawText,
            recommendation:
              "Maintain minimum inside bend radius R ≥ 1.0x sheet thickness. Orient bend perpendicular to material grain direction.",
          };
        }
        return null;
      },
    });

    // Injection Molding: Rib-to-Wall Ratio & Draft
    this.rules.push({
      ruleId: "RULE_DOMAIN_MOLDING_SINK_MARKS",
      ruleName: "Injection Molding Rib-to-Wall Sink Mark Risk",
      processDomain: "INJECTION_MOLDING",
      description: "Ribs thicker than 0.6x main wall produce sink marks on cosmetic surfaces.",
      evaluate: (meta) => {
        if (meta.materialFamily === "PLASTIC_POLYMER") {
          return {
            ruleId: "RULE_DOMAIN_MOLDING_SINK_MARKS",
            ruleName: "Injection Molding Wall Thickness & Draft Angle",
            processDomain: "INJECTION_MOLDING",
            confidence: "HIGH",
            confidenceScore: 0.9,
            impacts: {
              manufacturingComplexityDelta: 30,
              engineeringDifficultyDelta: 25,
              inspectionDifficultyDelta: 15,
              supplierComplexityDelta: 25,
              materialRiskDelta: 15,
              scrapProbabilityDelta: 20,
            },
            why: "Non-uniform polymer wall thickness causes differential shrinkage, sink marks on A-surfaces, and ejection sticking if draft angle < 1.0°.",
            evidence: `Material: ${meta.material}`,
            recommendation:
              "Maintain uniform nominal wall thickness (2.0-3.0 mm). Ensure rib base thickness ≤ 0.6x wall thickness. Provide minimum 1.5° draft per side.",
          };
        }
        return null;
      },
    });

    // Additive Manufacturing: Overhangs & Post-Machining
    this.rules.push({
      ruleId: "RULE_DOMAIN_ADDITIVE_OVERHANG",
      ruleName: "Additive Manufacturing Overhang & Rough Surface",
      processDomain: "ADDITIVE_MANUFACTURING",
      description:
        "AM overhang angles < 45° require support structures and secondary CNC finish machining.",
      evaluate: (meta) => {
        if (
          meta.notes.some(
            (n) => n.toLowerCase().includes("3d print") || n.toLowerCase().includes("additive"),
          )
        ) {
          return {
            ruleId: "RULE_DOMAIN_ADDITIVE_OVERHANG",
            ruleName: "Additive Support Structure & Surface Finish Ra",
            processDomain: "ADDITIVE_MANUFACTURING",
            confidence: "HIGH",
            confidenceScore: 0.92,
            impacts: {
              manufacturingComplexityDelta: 25,
              engineeringDifficultyDelta: 20,
              inspectionDifficultyDelta: 20,
              supplierComplexityDelta: 20,
              materialRiskDelta: 15,
              scrapProbabilityDelta: 15,
            },
            why: "As-printed metal AM parts exhibit surface roughness Ra 6.3 - 12.5 µm and internal residual stresses. Overhangs < 45° require heavy support removal.",
            evidence: "Additive manufacturing process note detected",
            recommendation:
              "Orient part to minimize support volume. Plan post-build stress relief heat treatment (HIP) followed by CNC finishing of mating faces.",
          };
        }
        return null;
      },
    });
  }

  public evaluateRules(
    metadata: DrawingMetadata,
    callouts: ExtractedCallout[],
  ): RuleTriggerResult[] {
    const results: RuleTriggerResult[] = [];
    const triggeredIds = new Set<string>();

    // 1. Evaluate metadata rules
    for (const rule of this.rules) {
      const result = rule.evaluate(metadata);
      if (result && !triggeredIds.has(result.ruleId)) {
        results.push(result);
        triggeredIds.add(result.ruleId);
      }
    }

    // 2. Evaluate callout specific rules
    for (const callout of callouts) {
      for (const rule of this.rules) {
        const result = rule.evaluate(metadata, callout);
        if (result && !triggeredIds.has(result.ruleId)) {
          results.push(result);
          triggeredIds.add(result.ruleId);
        }
      }
    }

    return results;
  }
}
