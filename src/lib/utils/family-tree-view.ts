import type { FamilyMember } from "@/lib/actions/family-actions";

export type FamilyGranularity = "immediate" | "extended" | "full";
export type FamilyFocus = "all" | "ancestors";

interface FamilyGenerationGroup {
  generationLevel: number;
  members: FamilyMember[];
}

const GRANULARITY_DEPTH: Record<FamilyGranularity, number> = {
  immediate: 1,
  extended: 2,
  full: Number.POSITIVE_INFINITY,
};

export function filterFamilyMembers(
  familyMembers: FamilyMember[],
  granularity: FamilyGranularity,
  focus: FamilyFocus
): FamilyMember[] {
  const maxDepth = GRANULARITY_DEPTH[granularity];

  return familyMembers.filter((member) => {
    if (focus === "ancestors" && member.generationLevel >= 0) {
      return false;
    }

    return Math.abs(member.generationLevel) <= maxDepth;
  });
}

export function groupFamilyMembersByGeneration(
  familyMembers: FamilyMember[]
): FamilyGenerationGroup[] {
  const generationGroups = new Map<number, FamilyMember[]>();

  for (const member of familyMembers) {
    const existingMembers = generationGroups.get(member.generationLevel) ?? [];
    existingMembers.push(member);
    generationGroups.set(member.generationLevel, existingMembers);
  }

  return Array.from(generationGroups.entries())
    .sort(([generationA], [generationB]) => generationA - generationB)
    .map(([generationLevel, members]) => ({
      generationLevel,
      members,
    }));
}

export function getGenerationLabel(generationLevel: number): string {
  if (generationLevel < 0) {
    if (generationLevel === -1) {
      return "Parents";
    }
    if (generationLevel === -2) {
      return "Grandparents";
    }
    return "Ancestors";
  }

  if (generationLevel > 0) {
    if (generationLevel === 1) {
      return "Children";
    }
    if (generationLevel === 2) {
      return "Grandchildren";
    }
    return "Descendants";
  }

  return "Same Generation";
}
