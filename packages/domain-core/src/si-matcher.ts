// File: packages/domain-core/src/si-matcher.ts

import { KnowledgeGraph } from "./graph";
import {
  CrossDomainQuery,
  MatchResult,
  MatchPath,
  ConstraintDemotionWarning,
  SIProperty,
  KnowledgeNode,
  KnowledgeEdge,
  DimensionMismatchError,
} from "./types";

export interface UnitCategory {
  category: string;
  dimension: number[]; // [Mass, Length, Time, Current, Temp, Amount, Luminous]
  units: Record<string, number>; // factor to SI base
}

const UNIT_DICTIONARY: Record<string, { category: string; factor: number; offset?: number }> = {
  // Pressure / Stress (SI base: Pa = kg * m^-1 * s^-2)
  pa: { category: "pressure", factor: 1 },
  kpa: { category: "pressure", factor: 1e3 },
  mpa: { category: "pressure", factor: 1e6 },
  gpa: { category: "pressure", factor: 1e9 },
  psi: { category: "pressure", factor: 6894.757 },
  bar: { category: "pressure", factor: 1e5 },
  "n/m^2": { category: "pressure", factor: 1 },
  "n/mm^2": { category: "pressure", factor: 1e6 },

  // Length (SI base: m)
  m: { category: "length", factor: 1 },
  mm: { category: "length", factor: 1e-3 },
  cm: { category: "length", factor: 1e-2 },
  km: { category: "length", factor: 1e3 },
  in: { category: "length", factor: 0.0254 },
  ft: { category: "length", factor: 0.3048 },

  // Force (SI base: N = kg * m * s^-2)
  n: { category: "force", factor: 1 },
  kn: { category: "force", factor: 1e3 },
  mn: { category: "force", factor: 1e6 },
  lbf: { category: "force", factor: 4.448222 },

  // Mass (SI base: kg)
  kg: { category: "mass", factor: 1 },
  g: { category: "mass", factor: 1e-3 },
  mg: { category: "mass", factor: 1e-6 },
  lb: { category: "mass", factor: 0.453592 },

  // Temperature
  k: { category: "temperature", factor: 1 },
  c: { category: "temperature", factor: 1, offset: 273.15 },
};

/**
 * Converts a numerical value from one unit to another within the same physical dimension category.
 */
export function convertSI(value: number, fromUnit: string, toUnit: string): number {
  const fromNorm = fromUnit.trim().toLowerCase();
  const toNorm = toUnit.trim().toLowerCase();

  if (fromNorm === toNorm) return value;

  const fromSpec = UNIT_DICTIONARY[fromNorm];
  const toSpec = UNIT_DICTIONARY[toNorm];

  if (!fromSpec || !toSpec) {
    throw new DimensionMismatchError(
      `Unsupported unit conversion between '${fromUnit}' and '${toUnit}'.`,
    );
  }

  if (fromSpec.category !== toSpec.category) {
    throw new DimensionMismatchError(
      `Dimension mismatch: Cannot convert '${fromUnit}' (${fromSpec.category}) to '${toUnit}' (${toSpec.category}).`,
    );
  }

  // Handle temperature offsets if present
  let baseValue = value;
  if (fromSpec.offset) {
    baseValue = value + fromSpec.offset;
  } else {
    baseValue = value * fromSpec.factor;
  }

  if (toSpec.offset) {
    return baseValue - toSpec.offset;
  }
  return baseValue / toSpec.factor;
}

/**
 * Helper to extract an SIProperty from a node's properties record.
 */
function extractSIProperty(node: KnowledgeNode): { name: string; prop: SIProperty } | null {
  if (!node.properties) return null;

  // Direct si_value key
  if (
    node.properties.si_value &&
    typeof (node.properties.si_value as SIProperty).value === "number"
  ) {
    return { name: "si_value", prop: node.properties.si_value as SIProperty };
  }

  // Check known engineering property keys
  const keys = [
    "yield_strength",
    "tensile_strength",
    "operating_stress",
    "stress",
    "pressure",
    "force",
    "thickness",
    "length",
    "value",
  ];
  for (const k of keys) {
    const p = node.properties[k];
    if (
      p &&
      typeof p === "object" &&
      typeof (p as SIProperty).value === "number" &&
      (p as SIProperty).unit
    ) {
      return { name: k, prop: p as SIProperty };
    }
  }

  return null;
}

/**
 * 2-Phase SI-Normalized Arithmetic Cross-Domain Matcher
 */
export function twoPhaseMatch(graph: KnowledgeGraph, query: CrossDomainQuery): MatchResult {
  const sourceNode = graph.getNode(query.sourceNodeId);
  const targetNode = graph.getNode(query.targetNodeId);

  if (!sourceNode || !targetNode) {
    return {
      matchedPaths: [],
      overallStatus: "NO_PATHS",
      suggestion: `Source or target node not found in active graph. Source: ${query.sourceNodeId}, Target: ${query.targetNodeId}`,
    };
  }

  // Phase 1: Path Traversal (DFS up to max depth 3)
  const paths: Array<{ nodes: KnowledgeNode[]; edges: KnowledgeEdge[] }> = [];

  function dfs(
    currentId: string,
    currentPathNodes: KnowledgeNode[],
    currentPathEdges: KnowledgeEdge[],
    visited: Set<string>,
    depth: number,
  ) {
    if (depth > 3) return;

    if (currentId === query.targetNodeId && currentPathEdges.length > 0) {
      paths.push({
        nodes: [...currentPathNodes],
        edges: [...currentPathEdges],
      });
      return;
    }

    const outgoingEdges = graph.getEdges(currentId);
    for (const edge of outgoingEdges) {
      if (query.relationshipHint && edge.edge_type !== query.relationshipHint) {
        // Skip edges that do not match the hint if specified
        continue;
      }
      const nextId = edge.target_id;
      if (!visited.has(nextId)) {
        const nextNode = graph.getNode(nextId);
        if (nextNode) {
          visited.add(nextId);
          dfs(
            nextId,
            [...currentPathNodes, nextNode],
            [...currentPathEdges, edge],
            visited,
            depth + 1,
          );
          visited.delete(nextId);
        }
      }
    }
  }

  const initialVisited = new Set<string>([query.sourceNodeId]);
  dfs(query.sourceNodeId, [sourceNode], [], initialVisited, 0);

  if (paths.length === 0) {
    return {
      matchedPaths: [],
      overallStatus: "NO_PATHS",
      suggestion: `No relationship paths (max depth 3) found between source '${sourceNode.id}' and target '${targetNode.id}'. Consider adding an evidence-backed relationship edge.`,
    };
  }

  // Phase 2: SI Arithmetic Compatibility & Constraint Checking
  const matchedPaths: MatchPath[] = [];

  for (const path of paths) {
    const warnings: ConstraintDemotionWarning[] = [];
    let compatibilityScore = 1.0;

    const sourceSI = extractSIProperty(path.nodes[0]);
    const targetSI = extractSIProperty(path.nodes[path.nodes.length - 1]);

    if (sourceSI && targetSI) {
      try {
        const sourceSIValueInPaOrM = convertSI(
          sourceSI.prop.value,
          sourceSI.prop.unit,
          targetSI.prop.unit,
        );

        // Arithmetic Constraint Check: e.g., stress vs yield strength
        if (
          (sourceSI.name.includes("stress") || sourceSI.name.includes("value")) &&
          (targetSI.name.includes("yield") || targetSI.name.includes("strength"))
        ) {
          const stressVal = sourceSIValueInPaOrM;
          const yieldVal = targetSI.prop.value;

          if (stressVal > yieldVal) {
            const demotedYield = yieldVal * 0.7; // Demote by uncertainty factor
            warnings.push({
              nodeId: targetNode.id,
              reason: `Constraint Demotion: Calculated stress (${stressVal.toFixed(2)} ${targetSI.prop.unit}) exceeds material yield strength (${yieldVal} ${targetSI.prop.unit}). Demoting allowable strength constraint value.`,
              originalValue: yieldVal,
              demotedValue: demotedYield,
            });
            compatibilityScore = Math.max(0.1, yieldVal / stressVal);
          } else {
            compatibilityScore = Math.min(1.0, yieldVal / (stressVal || 1));
          }
        }
      } catch (err) {
        if (err instanceof DimensionMismatchError) {
          warnings.push({
            nodeId: targetNode.id,
            reason: `SI Dimension Warning: ${err.message}`,
            originalValue: targetSI.prop.value,
            demotedValue: targetSI.prop.value,
          });
          compatibilityScore = 0.5;
        }
      }
    }

    matchedPaths.push({
      pathNodes: path.nodes,
      pathEdges: path.edges,
      siCompatibilityScore: Number(compatibilityScore.toFixed(3)),
      warnings,
    });
  }

  const hasWarnings = matchedPaths.some((p) => p.warnings.length > 0);
  return {
    matchedPaths,
    overallStatus: hasWarnings ? "CONSTRAINT_DEMOTED" : "MATCHED",
  };
}
