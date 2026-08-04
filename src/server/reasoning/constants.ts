import { EngineeringPrincipleData, ReasoningStageName } from "./types";

export const REASONING_STAGES: ReasoningStageName[] = [
  "EVIDENCE_COLLECTION",
  "EVIDENCE_VALIDATION",
  "EVIDENCE_WEIGHTING",
  "CONSTRAINT_IDENTIFICATION",
  "PRINCIPLE_SELECTION",
  "RELATIONSHIP_ANALYSIS",
  "TRADEOFF_EVALUATION",
  "ALTERNATIVE_GENERATION",
  "CONFLICT_DETECTION",
  "REASONING_CHAIN_CONSTRUCTION",
  "CONFIDENCE_CALCULATION",
  "CONCLUSION_GENERATION",
  "EVIDENCE_CITATION",
  "RECOMMENDATION_GENERATION",
];

export const DEFAULT_ENGINEERING_PRINCIPLES: EngineeringPrincipleData[] = [
  {
    code: "PRIN-ENERGY-CONS",
    name: "Conservation of Energy",
    category: "Thermal",
    description:
      "Energy can neither be created nor destroyed, only transformed from one form to another. Total system energy remains constant in an isolated system.",
    governingEquations: [
      "dE/dt = Q_in - W_out + m_in(h_in + v_in^2/2 + gz_in) - m_out(h_out + v_out^2/2 + gz_out)",
    ],
    domain: "Mechanical",
    version: 1,
    status: "ACTIVE",
    supportingEvidenceRefs: ["ISO 80000-5", "Thermodynamics First Law Axiom"],
  },
  {
    code: "PRIN-STRESS-DIST",
    name: "Stress Distribution",
    category: "Structural",
    description:
      "Internal forces are distributed across cross-sectional areas under applied external loads. Stress concentrations occur at geometric discontinuities.",
    governingEquations: ["sigma = P / A", "sigma_max = K_t * (P / A)", "tau = V * Q / (I * b)"],
    domain: "Mechanical",
    version: 1,
    status: "ACTIVE",
    supportingEvidenceRefs: [
      "Shigley Mechanical Engineering Design",
      "Roark's Formulas for Stress and Strain",
    ],
  },
  {
    code: "PRIN-HEAT-TRANSFER",
    name: "Heat Transfer",
    category: "Thermal",
    description:
      "Thermal energy moves from higher to lower temperature regions via conduction, convection, and radiation.",
    governingEquations: [
      "q = -k * A * (dT/dx)",
      "q = h * A * (T_s - T_inf)",
      "q = epsilon * sigma_SB * A * (T_s^4 - T_surr^4)",
    ],
    domain: "Thermal",
    version: 1,
    status: "ACTIVE",
    supportingEvidenceRefs: ["Incropera Fundamentals of Heat and Mass Transfer"],
  },
  {
    code: "PRIN-FATIGUE",
    name: "Fatigue",
    category: "Structural",
    description:
      "Structural degradation and progressive failure occur under cyclic loading below ultimate tensile strength.",
    governingEquations: ["S_f = a * N^b", "Sum(n_i / N_i) <= D_max (Miner's Rule)"],
    domain: "Mechanical",
    version: 1,
    status: "ACTIVE",
    supportingEvidenceRefs: ["ASTM E647 Standard Test Method for Fatigue Crack Growth"],
  },
  {
    code: "PRIN-BUCKLING",
    name: "Buckling",
    category: "Structural",
    description:
      "Slender structural members undergo sudden lateral instability failure under compressive loading before material yield point is reached.",
    governingEquations: ["P_cr = (pi^2 * E * I) / (K * L)^2", "sigma_cr = P_cr / A"],
    domain: "Aerospace",
    version: 1,
    status: "ACTIVE",
    supportingEvidenceRefs: ["Euler Column Buckling Theory", "NASA SP-8007"],
  },
  {
    code: "PRIN-CORROSION",
    name: "Corrosion",
    category: "Materials",
    description:
      "Electrochemical degradation of materials when exposed to reactive environments, galvanic coupling, or oxidative electrolytes.",
    governingEquations: ["CR = (K * W) / (A * T * D)", "E_cell = E_cathode - E_anode"],
    domain: "Materials",
    version: 1,
    status: "ACTIVE",
    supportingEvidenceRefs: ["NACE SP0169 Control of External Corrosion", "ASTM G31"],
  },
  {
    code: "PRIN-REDUNDANCY",
    name: "Redundancy",
    category: "Reliability",
    description:
      "Duplication of critical components or paths ensures continuous system function despite single-point hardware or software failures.",
    governingEquations: [
      "R_sys = 1 - Prod(1 - R_i)",
      "MTBF_parallel = MTBF_base * (1 + 1/2 + ... + 1/n)",
    ],
    domain: "Systems",
    version: 1,
    status: "ACTIVE",
    supportingEvidenceRefs: ["MIL-HDBK-338B Reliability Design Handbook", "ARP4761"],
  },
  {
    code: "PRIN-SAFETY-MARGIN",
    name: "Safety Margin",
    category: "Safety",
    description:
      "Structural and functional capacity must exceed maximum expected operational loads by a prescribed factor.",
    governingEquations: [
      "MS = (Allowable_Load / (Actual_Load * FoS)) - 1",
      "FoS = Yield_Strength / Working_Stress",
    ],
    domain: "Systems",
    version: 1,
    status: "ACTIVE",
    supportingEvidenceRefs: ["NASA STD 5001 Structural Design and Test Factors of Safety"],
  },
  {
    code: "PRIN-TOLERANCE-STACK",
    name: "Tolerance Stack-up",
    category: "Manufacturing",
    description:
      "Accumulation of individual dimensional variations in assembled components influences clearance, interference, and alignment.",
    governingEquations: ["T_worst_case = Sum(|t_i|)", "T_rss = Sqrt(Sum(t_i^2))"],
    domain: "Manufacturing",
    version: 1,
    status: "ACTIVE",
    supportingEvidenceRefs: ["ASME Y14.5-2018 Dimensioning and Tolerancing", "ISO 286"],
  },
  {
    code: "PRIN-THERMAL-EXP",
    name: "Thermal Expansion",
    category: "Thermal",
    description:
      "Dimensional change in materials proportional to temperature variation and thermal expansion coefficient.",
    governingEquations: ["delta_L = alpha * L_0 * delta_T", "sigma_thermal = E * alpha * delta_T"],
    domain: "Thermal",
    version: 1,
    status: "ACTIVE",
    supportingEvidenceRefs: ["ASTM E228 Linear Thermal Expansion Standard"],
  },
  {
    code: "PRIN-STRUCT-EFF",
    name: "Structural Efficiency",
    category: "Structural",
    description:
      "Maximizing load-carrying capacity while minimizing structural mass through geometry optimization.",
    governingEquations: [
      "Efficiency = P_payload / M_structure",
      "Specific_Strength = sigma_y / rho",
    ],
    domain: "Aerospace",
    version: 1,
    status: "ACTIVE",
    supportingEvidenceRefs: ["Bruhn Analysis and Design of Flight Vehicle Structures"],
  },
  {
    code: "PRIN-FAIL-PROP",
    name: "Failure Propagation",
    category: "Safety",
    description:
      "Initial localized damage must be contained to prevent cascading catastrophic collapse throughout adjacent subsystems.",
    governingEquations: [
      "P_cascade = 1 - Prod(1 - p_ij * S_j)",
      "Damage_Radius = f(Energy_Release, Material_Toughness)",
    ],
    domain: "Systems",
    version: 1,
    status: "ACTIVE",
    supportingEvidenceRefs: ["IEC 61508 Functional Safety", "FMEA/FMECA Methodology"],
  },
  {
    code: "PRIN-MAINTAINABILITY",
    name: "Maintainability",
    category: "Systems",
    description:
      "System design facilitates rapid inspection, modular component replacement, and minimal mean time to repair (MTTR).",
    governingEquations: ["MTTR = Sum(lambda_i * T_i) / Sum(lambda_i)", "M(t) = 1 - exp(-t / MTTR)"],
    domain: "Systems",
    version: 1,
    status: "ACTIVE",
    supportingEvidenceRefs: ["MIL-HDBK-470A Designing and Developing Maintainable Products"],
  },
  {
    code: "PRIN-MANUFACTURABILITY",
    name: "Manufacturability",
    category: "Manufacturing",
    description:
      "Design features conform to tool access, material removal constraints, draft angles, and standard stock sizes.",
    governingEquations: [
      "DFM_Index = Standard_Feature_Count / Total_Feature_Count",
      "Cost_relative = f(Tolerance_Tightness, Machine_Passes)",
    ],
    domain: "Manufacturing",
    version: 1,
    status: "ACTIVE",
    supportingEvidenceRefs: ["Boothroyd Dewhurst Design for Manufacture and Assembly"],
  },
  {
    code: "PRIN-RELIABILITY",
    name: "Reliability",
    category: "Reliability",
    description:
      "Probability that a system performs its required function without failure under stated conditions for a specified period.",
    governingEquations: ["R(t) = exp(-lambda * t)", "MTBF = 1 / lambda"],
    domain: "Systems",
    version: 1,
    status: "ACTIVE",
    supportingEvidenceRefs: ["IEEE 1332 Reliability Program Standard", "MIL-HDBK-217F"],
  },
  {
    code: "PRIN-CONTROL-STABILITY",
    name: "Control Stability",
    category: "Systems",
    description:
      "Closed-loop feedback systems maintain bounded outputs under bounded inputs without self-excited oscillation.",
    governingEquations: [
      "Gain_Margin = 1 / |G(j*omega_180)|",
      "Phase_Margin = 180 + angle(G(j*omega_0dB))",
    ],
    domain: "Electrical",
    version: 1,
    status: "ACTIVE",
    supportingEvidenceRefs: ["Ogata Modern Control Engineering", "IEEE Control Systems Society"],
  },
  {
    code: "PRIN-MAT-COMPAT",
    name: "Material Compatibility",
    category: "Materials",
    description:
      "Adjacent materials in physical or fluid contact must prevent galvanic action, chemical dissolution, or outgassing contamination.",
    governingEquations: [
      "delta_V_galvanic <= 0.15 V (harsh) / 0.25 V (normal)",
      "Solubility_Parameter_Diff = |delta_1 - delta_2|",
    ],
    domain: "Materials",
    version: 1,
    status: "ACTIVE",
    supportingEvidenceRefs: ["MIL-STD-889 Dissimilar Metals", "NASA MAPTIS Database"],
  },
];

export const CONFIDENCE_THRESHOLDS = {
  MINIMUM_SUPPORTED: 0.5,
  HIGH_CONFIDENCE: 0.8,
  INSUFFICIENT_EVIDENCE_SCORE: 0.35,
};
