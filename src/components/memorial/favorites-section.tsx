import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import type { FavoriteType, MemorialFavorite } from "@/lib/db/schema";

interface FavoritesSectionProps {
  favorites: MemorialFavorite[];
  favoriteTypes: FavoriteType[];
}

export function FavoritesSection({
  favorites,
  favoriteTypes,
}: FavoritesSectionProps) {
  if (favorites.length === 0) {
    return null;
  }

  // Group favorites by type
  const favoritesByType = favorites.reduce(
    (acc, fav) => {
      const typeId = fav.favoriteTypeId;
      if (typeId) {
        if (!acc[typeId]) {
          acc[typeId] = [];
        }
        acc[typeId].push(fav);
      }
      return acc;
    },
    {} as Record<string, MemorialFavorite[]>
  );

  // Map types for easy lookup
  const typesById = new Map(favoriteTypes.map((t) => [t.id, t]));

  // Sort types by sortOrder
  const sortedTypeIds = Object.keys(favoritesByType).sort((a, b) => {
    const typeA = typesById.get(a);
    const typeB = typesById.get(b);
    return (typeA?.sortOrder ?? 0) - (typeB?.sortOrder ?? 0);
  });

  return (
    <Card className="border-none bg-transparent shadow-none ring-0">
      <CardHeader>
        <CardTitle className="text-2xl">Favorites</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {sortedTypeIds.map((typeId) => {
          const type = typesById.get(typeId);
          const items = favoritesByType[typeId];

          if (!(type && items)) return null;

          return (
            <div className="space-y-3" key={typeId}>
              <div className="flex items-center gap-2 text-muted-foreground">
                {type.icon && <Icon className="size-5" icon={type.icon} />}
                <h3 className="font-medium text-foreground">
                  {type.namePlural}
                </h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((fav) => (
                  <FavoriteCard favorite={fav} key={fav.id} />
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function FavoriteCard({ favorite }: { favorite: MemorialFavorite }) {
  return (
    <Card
      className="flex flex-row items-start gap-3 px-4 transition-colors hover:bg-muted/50"
      size="sm"
    >
      <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
        {favorite.imageUrl ? (
          <Image
            alt={favorite.title}
            className="object-cover"
            fill
            sizes="48px"
            src={favorite.imageUrl}
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Icon className="size-5 text-muted-foreground" icon="ph:star" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate font-medium text-sm leading-tight">
          {favorite.title}
        </h4>
        {favorite.subtitle && (
          <p className="mt-0.5 truncate text-muted-foreground text-xs">
            {favorite.subtitle}
          </p>
        )}
        {favorite.externalUrl && (
          <a
            className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
            href={favorite.externalUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span>View Details</span>
            <Icon className="size-3" icon="ph:arrow-square-out" />
          </a>
        )}
      </div>
    </Card>
  );
}
