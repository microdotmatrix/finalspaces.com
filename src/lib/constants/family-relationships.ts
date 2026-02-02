import type { relationshipTypeValues } from "@/lib/db/schema";

export type RelationshipType = (typeof relationshipTypeValues)[number];
export type FamilyCategory =
  | "ancestor"
  | "lateral"
  | "spouse"
  | "descendant"
  | "pet";

export interface RelationshipOption {
  type: RelationshipType;
  label: string;
  category: FamilyCategory;
  generationLevel: number;
}

/**
 * Relationship presets organized by category
 * generationLevel: negative = ancestors, 0 = same generation, positive = descendants
 */
export const RELATIONSHIP_PRESETS: RelationshipOption[] = [
  // Direct ancestors (negative generation)
  {
    type: "parent",
    label: "Parent",
    category: "ancestor",
    generationLevel: -1,
  },
  {
    type: "grandparent",
    label: "Grandparent",
    category: "ancestor",
    generationLevel: -2,
  },
  {
    type: "great_grandparent",
    label: "Great-Grandparent",
    category: "ancestor",
    generationLevel: -3,
  },

  // Direct descendants (positive generation)
  { type: "child", label: "Child", category: "descendant", generationLevel: 1 },
  {
    type: "grandchild",
    label: "Grandchild",
    category: "descendant",
    generationLevel: 2,
  },
  {
    type: "great_grandchild",
    label: "Great-Grandchild",
    category: "descendant",
    generationLevel: 3,
  },

  // Siblings (same generation)
  {
    type: "sibling",
    label: "Sibling",
    category: "lateral",
    generationLevel: 0,
  },
  {
    type: "half_sibling",
    label: "Half-Sibling",
    category: "lateral",
    generationLevel: 0,
  },
  {
    type: "step_sibling",
    label: "Step-Sibling",
    category: "lateral",
    generationLevel: 0,
  },

  // Extended lateral
  { type: "cousin", label: "Cousin", category: "lateral", generationLevel: 0 },
  {
    type: "aunt_uncle",
    label: "Aunt/Uncle",
    category: "lateral",
    generationLevel: -1,
  },
  {
    type: "niece_nephew",
    label: "Niece/Nephew",
    category: "lateral",
    generationLevel: 1,
  },

  // Spouse relationships (same generation)
  { type: "spouse", label: "Spouse", category: "spouse", generationLevel: 0 },
  {
    type: "ex_spouse",
    label: "Ex-Spouse",
    category: "spouse",
    generationLevel: 0,
  },
  { type: "partner", label: "Partner", category: "spouse", generationLevel: 0 },

  // In-laws
  {
    type: "parent_in_law",
    label: "Parent-in-Law",
    category: "spouse",
    generationLevel: -1,
  },
  {
    type: "sibling_in_law",
    label: "Sibling-in-Law",
    category: "spouse",
    generationLevel: 0,
  },
  {
    type: "child_in_law",
    label: "Child-in-Law",
    category: "spouse",
    generationLevel: 1,
  },

  // Step relationships
  {
    type: "step_parent",
    label: "Step-Parent",
    category: "ancestor",
    generationLevel: -1,
  },
  {
    type: "step_child",
    label: "Step-Child",
    category: "descendant",
    generationLevel: 1,
  },

  // Other
  {
    type: "godparent",
    label: "Godparent",
    category: "lateral",
    generationLevel: -1,
  },
  {
    type: "godchild",
    label: "Godchild",
    category: "lateral",
    generationLevel: 1,
  },
  { type: "other", label: "Other", category: "lateral", generationLevel: 0 },
];

/**
 * Grouped presets by category for UI display
 */
export const RELATIONSHIP_GROUPS = {
  ancestor: RELATIONSHIP_PRESETS.filter((r) => r.category === "ancestor"),
  descendant: RELATIONSHIP_PRESETS.filter((r) => r.category === "descendant"),
  lateral: RELATIONSHIP_PRESETS.filter((r) => r.category === "lateral"),
  spouse: RELATIONSHIP_PRESETS.filter((r) => r.category === "spouse"),
} as const;

/**
 * Get relationship option by type
 */
export function getRelationshipOption(
  type: RelationshipType
): RelationshipOption | undefined {
  return RELATIONSHIP_PRESETS.find((r) => r.type === type);
}

/**
 * Get category from relationship type
 */
export function getCategoryFromRelationshipType(
  type: RelationshipType
): FamilyCategory {
  return getRelationshipOption(type)?.category ?? "lateral";
}

/**
 * Get generation level from relationship type
 */
export function getGenerationLevel(type: RelationshipType): number {
  return getRelationshipOption(type)?.generationLevel ?? 0;
}

/**
 * Specific relationship labels (more descriptive than type)
 */
export const SPECIFIC_RELATIONSHIPS: Record<string, string[]> = {
  parent: ["Mother", "Father", "Mom", "Dad"],
  grandparent: [
    "Grandmother",
    "Grandfather",
    "Grandma",
    "Grandpa",
    "Nana",
    "Papa",
  ],
  great_grandparent: [
    "Great-Grandmother",
    "Great-Grandfather",
    "Great-Grandma",
    "Great-Grandpa",
  ],
  child: ["Daughter", "Son"],
  grandchild: ["Granddaughter", "Grandson"],
  great_grandchild: ["Great-Granddaughter", "Great-Grandson"],
  sibling: ["Sister", "Brother"],
  half_sibling: ["Half-Sister", "Half-Brother"],
  step_sibling: ["Step-Sister", "Step-Brother"],
  cousin: ["Cousin"],
  aunt_uncle: ["Aunt", "Uncle"],
  niece_nephew: ["Niece", "Nephew"],
  spouse: ["Wife", "Husband"],
  ex_spouse: ["Ex-Wife", "Ex-Husband"],
  partner: ["Partner", "Fiance", "Fiancee"],
  parent_in_law: ["Mother-in-Law", "Father-in-Law"],
  sibling_in_law: ["Sister-in-Law", "Brother-in-Law"],
  child_in_law: ["Daughter-in-Law", "Son-in-Law"],
  step_parent: ["Step-Mother", "Step-Father"],
  step_child: ["Step-Daughter", "Step-Son"],
  godparent: ["Godmother", "Godfather"],
  godchild: ["Goddaughter", "Godson"],
  other: ["Family Friend", "Guardian", "Other"],
};
