import Image from "next/image";

import { ImageDialog } from "@/components/elements/image-dialog";

import { getMemorialMediaUrl } from "./memorial-header-utils";

interface MemorialHeaderAvatarProps {
  displayName: string;
  fallbackName: string;
  profilePicture?: string | null;
  variant: "hero" | "carousel";
  interactive?: boolean;
  priority?: boolean;
}

const avatarClasses = {
  hero: {
    image:
      "relative mx-auto mb-6 size-32 overflow-hidden rounded-full sm:size-40 md:size-64 lg:size-72",
    fallback:
      "mx-auto mb-6 flex size-32 items-center justify-center rounded-full bg-primary/20 font-bold text-4xl text-primary sm:size-40 md:size-64 md:text-6xl lg:size-72 lg:text-7xl",
  },
  carousel: {
    image:
      "relative size-32 overflow-hidden rounded-full border-4 border-background shadow-xl sm:size-40 md:size-64 lg:size-72",
    fallback:
      "flex size-32 items-center justify-center rounded-full border-4 border-background bg-muted font-bold text-4xl text-muted-foreground shadow-xl sm:size-40 md:size-64 md:text-7xl lg:size-72 lg:text-8xl",
  },
} as const;

export function MemorialHeaderAvatar({
  displayName,
  fallbackName,
  interactive,
  priority,
  profilePicture,
  variant,
}: MemorialHeaderAvatarProps) {
  const name = displayName || fallbackName;
  const initial = name.charAt(0).toUpperCase() || "?";
  const profilePictureUrl = getMemorialMediaUrl(profilePicture);

  if (profilePictureUrl) {
    if (interactive) {
      return (
        <div className={avatarClasses[variant].image}>
          <ImageDialog
            alt={name}
            className="h-full w-full object-cover"
            src={profilePictureUrl}
          />
        </div>
      );
    }

    return (
      <div className={avatarClasses[variant].image}>
        <Image
          alt={name}
          className="object-cover"
          fill
          priority={priority}
          sizes="(min-width: 1024px) 288px, (min-width: 768px) 256px, (min-width: 640px) 160px, 128px"
          src={profilePictureUrl}
        />
      </div>
    );
  }

  return <div className={avatarClasses[variant].fallback}>{initial}</div>;
}
