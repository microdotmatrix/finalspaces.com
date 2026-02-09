import { MemorialHeaderAvatar } from "./memorial-header-avatar";
import { MemorialHeaderDetails } from "./memorial-header-details";
import type { MemorialHeaderIdentity } from "./memorial-header-types";

interface MemorialHeroProps {
  identity: MemorialHeaderIdentity;
  profilePicture?: string | null;
}

export function MemorialHero({ identity, profilePicture }: MemorialHeroProps) {
  return (
    <section className="relative bg-linear-to-b from-primary/10 to-background py-16 sm:py-24">
      <div className="container mx-auto px-4 text-center">
        <MemorialHeaderAvatar
          displayName={identity.displayName}
          fallbackName={identity.fallbackName}
          priority
          profilePicture={profilePicture}
          variant="hero"
        />

        <MemorialHeaderDetails {...identity} variant="hero" />
      </div>
    </section>
  );
}
