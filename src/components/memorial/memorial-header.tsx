import { HeaderCarousel } from "./header-carousel";
import type {
  MemorialHeaderIdentity,
  MemorialHeaderImage,
} from "./memorial-header-types";
import { MemorialHero } from "./memorial-hero";

interface MemorialHeaderProps {
  images: MemorialHeaderImage[];
  identity: MemorialHeaderIdentity;
  profilePicture?: string | null;
}

export function MemorialHeader({
  identity,
  images,
  profilePicture,
}: MemorialHeaderProps) {
  if (images.length > 0) {
    return (
      <HeaderCarousel
        identity={identity}
        images={images}
        profilePicture={profilePicture}
      />
    );
  }

  return <MemorialHero identity={identity} profilePicture={profilePicture} />;
}
