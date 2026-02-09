import type { FinalSpace } from "@/lib/db/schema";

const UPLOADTHING_BASE_URL = "https://utfs.io/f/";

type MemorialNameSource = Pick<
  FinalSpace,
  | "firstName"
  | "middleName"
  | "lastName"
  | "suffix"
  | "nickname"
  | "useNicknameOnly"
>;

export const getMemorialDisplayName = (space: MemorialNameSource): string => {
  if (space.useNicknameOnly && space.nickname) {
    return space.nickname;
  }

  return `${space.firstName || ""} ${space.lastName || ""}`.trim();
};

export const getMemorialFullName = (space: MemorialNameSource): string => {
  return [space.firstName, space.middleName, space.lastName, space.suffix]
    .filter(Boolean)
    .join(" ");
};

export const getMemorialMediaUrl = (
  storageKey: string | null | undefined
): string | null => {
  if (!storageKey) {
    return null;
  }

  return `${UPLOADTHING_BASE_URL}${storageKey}`;
};

export const calculateMemorialAge = (
  birthDate: string | null | undefined,
  deathDate: string | null | undefined
): number | null => {
  if (!birthDate) {
    return null;
  }

  const birth = new Date(birthDate);
  const end = deathDate ? new Date(deathDate) : new Date();

  let age = end.getFullYear() - birth.getFullYear();
  const monthDiff = end.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};
