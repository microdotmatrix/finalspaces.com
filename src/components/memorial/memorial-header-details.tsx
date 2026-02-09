import { cn } from "@/lib/utils";

import type { MemorialHeaderIdentity } from "./memorial-header-types";
import { calculateMemorialAge } from "./memorial-header-utils";

interface MemorialHeaderDetailsProps extends MemorialHeaderIdentity {
  variant: "hero" | "carousel";
  className?: string;
}

const IN_MEMORIAM_LABEL = "In Loving Memory";

export function MemorialHeaderDetails({
  birthDate,
  className,
  deathDate,
  displayName,
  fallbackName,
  fullName,
  hometown,
  inMemoriam,
  nickname,
  useNicknameOnly,
  variant,
}: MemorialHeaderDetailsProps) {
  const name = displayName || fallbackName;
  const showNickname = Boolean(nickname && !useNicknameOnly);
  const showFullName = Boolean(fullName && fullName !== name);

  if (variant === "carousel") {
    const age = calculateMemorialAge(birthDate, deathDate);

    return (
      <div className={cn("py-4 md:py-6", className)}>
        <h1 className="font-normal text-2xl text-foreground md:text-3xl lg:text-6xl">
          {name}
        </h1>

        {(age !== null || hometown) && (
          <div className="mt-1 flex items-center gap-2 text-muted-foreground text-sm md:text-base">
            {age !== null && <span>{age} years</span>}
            {age !== null && hometown && <span>-</span>}
            {hometown && <span>{hometown}</span>}
          </div>
        )}

        {showNickname && (
          <p className="mt-1 text-muted-foreground text-sm italic md:text-base">
            &ldquo;{nickname}&rdquo;
          </p>
        )}

        {showFullName && (
          <p className="mt-1 text-muted-foreground text-sm">{fullName}</p>
        )}

        {inMemoriam && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span className="font-medium text-muted-foreground text-xs">
              {IN_MEMORIAM_LABEL}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("text-center", className)}>
      <h1 className="mb-2 font-bold text-3xl sm:text-4xl lg:text-5xl">
        {name}
      </h1>

      {showNickname && (
        <p className="mb-2 text-lg text-muted-foreground">
          &ldquo;{nickname}&rdquo;
        </p>
      )}

      {showFullName && <p className="text-muted-foreground">{fullName}</p>}

      {(birthDate || deathDate) && (
        <p className="mt-4 text-muted-foreground">
          {birthDate && <span>{birthDate}</span>}
          {birthDate && deathDate && <span> - </span>}
          {deathDate && <span>{deathDate}</span>}
        </p>
      )}

      {inMemoriam && (
        <div className="mt-4 inline-block rounded-full bg-black/80 px-4 py-1 font-medium text-sm text-white">
          {IN_MEMORIAM_LABEL}
        </div>
      )}
    </div>
  );
}
