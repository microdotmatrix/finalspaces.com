export interface MemorialHeaderImage {
  id: string;
  url: string;
  altText?: string | null;
  caption?: string | null;
}

export interface MemorialHeaderIdentity {
  displayName: string;
  fallbackName: string;
  fullName?: string;
  nickname?: string | null;
  useNicknameOnly?: boolean;
  birthDate?: string | null;
  deathDate?: string | null;
  inMemoriam?: boolean;
  hometown?: string | null;
}
