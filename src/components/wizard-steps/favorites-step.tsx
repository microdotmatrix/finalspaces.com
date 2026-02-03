"use client";

import { useAtomValue } from "jotai";
import Image from "next/image";
import {
  type ChangeEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  addFavorite,
  type FavoriteCategory,
  getFavorites,
  removeFavorite,
  searchFavorites,
} from "@/lib/actions/favorites-actions";
import type { SearchResult } from "@/lib/api/shared";
import type { FavoriteType, MemorialFavorite } from "@/lib/db/schema";
import { draftIdAtom } from "@/lib/stores/wizard-state";

// Category configuration with icons and display names
const CATEGORY_CONFIG: Record<
  FavoriteCategory,
  {
    label: string;
    labelPlural: string;
    icon: string;
    searchPlaceholder: string;
  }
> = {
  books: {
    label: "Book",
    labelPlural: "Books",
    icon: "ph:book-duotone",
    searchPlaceholder: "Search for books...",
  },
  movies: {
    label: "Movie",
    labelPlural: "Movies",
    icon: "ph:film-slate-duotone",
    searchPlaceholder: "Search for movies...",
  },
  tv: {
    label: "TV Show",
    labelPlural: "TV Shows",
    icon: "ph:television-duotone",
    searchPlaceholder: "Search for TV shows...",
  },
  games: {
    label: "Video Game",
    labelPlural: "Video Games",
    icon: "ph:game-controller-duotone",
    searchPlaceholder: "Search for video games...",
  },
  artists: {
    label: "Artist",
    labelPlural: "Artists",
    icon: "ph:microphone-stage-duotone",
    searchPlaceholder: "Search for artists...",
  },
  anime: {
    label: "Anime",
    labelPlural: "Anime",
    icon: "ph:star-four-duotone",
    searchPlaceholder: "Search for anime...",
  },
  meals: {
    label: "Meal",
    labelPlural: "Meals",
    icon: "ph:cooking-pot-duotone",
    searchPlaceholder: "Search for meals...",
  },
  artworks: {
    label: "Artwork",
    labelPlural: "Artworks",
    icon: "ph:paint-brush-duotone",
    searchPlaceholder: "Search for artworks...",
  },
  boardgames: {
    label: "Board Game",
    labelPlural: "Board Games",
    icon: "ph:dice-five-duotone",
    searchPlaceholder: "Search for board games...",
  },
  comics: {
    label: "Comic",
    labelPlural: "Comics",
    icon: "ph:book-open-duotone",
    searchPlaceholder: "Search for comics...",
  },
  drinks: {
    label: "Drink",
    labelPlural: "Drinks",
    icon: "ph:martini-duotone",
    searchPlaceholder: "Search for drinks...",
  },
  teams: {
    label: "Team",
    labelPlural: "Teams",
    icon: "ph:soccer-ball-duotone",
    searchPlaceholder: "Search for teams...",
  },
};

const CATEGORY_ORDER: FavoriteCategory[] = [
  "books",
  "movies",
  "tv",
  "games",
  "artists",
  "anime",
  "meals",
  "artworks",
  "boardgames",
  "comics",
  "drinks",
  "teams",
];

const SEARCH_SKELETON_KEYS = ["search-1", "search-2", "search-3"] as const;
const FAVORITES_SKELETON_KEYS = ["favorites-1", "favorites-2"] as const;

function SearchResultItem({
  result,
  onAdd,
  isAdding,
  isAdded,
}: {
  result: SearchResult;
  onAdd: () => void;
  isAdding: boolean;
  isAdded: boolean;
}) {
  let actionIcon = <Icon className="size-4" icon="ph:plus" />;

  if (isAdding) {
    actionIcon = <Icon className="size-4 animate-spin" icon="ph:spinner" />;
  } else if (isAdded) {
    actionIcon = <Icon className="size-4 text-green-500" icon="ph:check" />;
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
        {result.imageUrl ? (
          <Image
            alt={result.title}
            className="object-cover"
            fill
            sizes="56px"
            src={result.imageUrl}
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Icon className="size-6 text-muted-foreground" icon="ph:image" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-sm">{result.title}</p>
        {result.subtitle && (
          <p className="truncate text-muted-foreground text-xs">
            {result.subtitle}
          </p>
        )}
      </div>
      <Button
        disabled={isAdding || isAdded}
        onClick={onAdd}
        size="icon"
        type="button"
        variant={isAdded ? "secondary" : "ghost"}
      >
        {actionIcon}
      </Button>
    </div>
  );
}

function FavoriteItem({
  favorite,
  typeConfig,
  onRemove,
  isRemoving,
}: {
  favorite: MemorialFavorite;
  typeConfig: (typeof CATEGORY_CONFIG)[FavoriteCategory] | undefined;
  onRemove: () => void;
  isRemoving: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
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
            <Icon
              className="size-5 text-muted-foreground"
              icon={typeConfig?.icon ?? "ph:star"}
            />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-sm">{favorite.title}</p>
        {favorite.subtitle && (
          <p className="truncate text-muted-foreground text-xs">
            {favorite.subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1">
        {favorite.externalUrl && (
          <a
            className="inline-flex size-9 items-center justify-center rounded-md hover:bg-muted"
            href={favorite.externalUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Icon className="size-4" icon="ph:arrow-square-out" />
          </a>
        )}
        <Button
          className="text-destructive hover:text-destructive"
          disabled={isRemoving}
          onClick={onRemove}
          size="icon"
          type="button"
          variant="ghost"
        >
          {isRemoving ? (
            <Icon className="size-4 animate-spin" icon="ph:spinner" />
          ) : (
            <Icon className="size-4" icon="ph:trash" />
          )}
        </Button>
      </div>
    </div>
  );
}

export function FavoritesStep() {
  const finalSpaceId = useAtomValue(draftIdAtom);

  // UI state
  const [selectedCategory, setSelectedCategory] =
    useState<FavoriteCategory>("books");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Data state
  const [favorites, setFavorites] = useState<MemorialFavorite[]>([]);
  const [favoriteTypes, setFavoriteTypes] = useState<FavoriteType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Transition states for mutations
  const [, startTransition] = useTransition();
  const [addingId, setAddingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [recentlyAdded, setRecentlyAdded] = useState<Set<string>>(new Set());

  // Load favorites on mount
  useEffect(() => {
    if (!finalSpaceId) {
      return;
    }

    let isCancelled = false;
    const loadFavorites = async () => {
      setIsLoading(true);
      try {
        const data = await getFavorites(finalSpaceId);
        if (!isCancelled) {
          setFavorites(data.favorites);
          setFavoriteTypes(data.types);
        }
      } catch {
        if (!isCancelled) {
          toast.error("Failed to load favorites");
          setFavorites([]);
          setFavoriteTypes([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadFavorites();
    return () => {
      isCancelled = true;
    };
  }, [finalSpaceId]);

  // Debounced search
  useEffect(() => {
    const trimmed = searchQuery.trim();
    let isCancelled = false;

    // For static lists (boardgames, teams), show results immediately
    if (selectedCategory === "boardgames" || selectedCategory === "teams") {
      setIsSearching(true);
      searchFavorites(selectedCategory, trimmed)
        .then((results) => {
          if (!isCancelled) {
            setSearchResults(results);
            setIsSearching(false);
          }
        })
        .catch(() => {
          if (!isCancelled) {
            setSearchResults([]);
            setIsSearching(false);
          }
        });
      return () => {
        isCancelled = true;
      };
    }

    // For API-based searches, require minimum query length
    if (trimmed.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const results = await searchFavorites(selectedCategory, trimmed);
        if (!isCancelled) {
          setSearchResults(results);
        }
      } catch {
        if (!isCancelled) {
          setSearchResults([]);
        }
      } finally {
        if (!isCancelled) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timeout);
    };
  }, [searchQuery, selectedCategory]);

  const favoriteTypesByKey = useMemo(
    () =>
      new Map<FavoriteCategory, FavoriteType>(
        favoriteTypes.map((type) => [type.key as FavoriteCategory, type])
      ),
    [favoriteTypes]
  );

  const currentTypeId = favoriteTypesByKey.get(selectedCategory)?.id ?? null;

  const handleCategoryChange = (value: FavoriteCategory | null) => {
    if (!value) {
      return;
    }

    const nextCategory = value;
    setSelectedCategory(nextCategory);
    setSearchQuery("");
    setSearchResults([]);
    setRecentlyAdded(new Set());
  };

  // Add favorite handler
  const handleAdd = useCallback(
    (result: SearchResult) => {
      if (!finalSpaceId) {
        return;
      }

      if (!currentTypeId) {
        toast.error("Category not configured");
        return;
      }

      setAddingId(result.id);
      startTransition(async () => {
        try {
          const response = await addFavorite({
            finalSpaceId,
            favoriteTypeId: currentTypeId,
            title: result.title,
            subtitle: result.subtitle,
            imageUrl: result.imageUrl,
            externalUrl: result.externalUrl,
            apiId: result.id,
          });

          if (response.success && response.favorite) {
            const newFavorite = response.favorite;
            setFavorites((prev) => [...prev, newFavorite]);
            setRecentlyAdded((prev) => new Set([...prev, result.id]));
            toast.success(`Added "${result.title}" to favorites`);
          } else {
            toast.error(response.error ?? "Failed to add favorite");
          }
        } catch {
          toast.error("An unexpected error occurred");
        } finally {
          setAddingId(null);
        }
      });
    },
    [currentTypeId, finalSpaceId]
  );

  // Remove favorite handler
  const handleRemove = useCallback((favorite: MemorialFavorite) => {
    setRemovingId(favorite.id);
    startTransition(async () => {
      try {
        const response = await removeFavorite(favorite.id);

        if (response.success) {
          setFavorites((prev) => prev.filter((f) => f.id !== favorite.id));
          toast.success(`Removed "${favorite.title}" from favorites`);
        } else {
          toast.error(response.error ?? "Failed to remove favorite");
        }
      } catch {
        toast.error("An unexpected error occurred");
      } finally {
        setRemovingId(null);
      }
    });
  }, []);

  const favoritesByType = useMemo(() => {
    return favorites.reduce(
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
  }, [favorites]);

  if (!finalSpaceId) {
    return (
      <div className="space-y-4">
        <h2 className="font-bold text-2xl">Favorites</h2>
        <p className="text-muted-foreground">
          Save the memorial first to add favorites.
        </p>
      </div>
    );
  }

  const categoryConfig = CATEGORY_CONFIG[selectedCategory];
  const currentCategoryFavorites = currentTypeId
    ? (favoritesByType[currentTypeId] ?? [])
    : [];
  const trimmedQuery = searchQuery.trim();
  const showQueryHint =
    trimmedQuery.length < 2 &&
    selectedCategory !== "boardgames" &&
    selectedCategory !== "teams";

  let searchContent: ReactNode = null;

  if (isSearching) {
    searchContent = (
      <div className="space-y-2">
        {SEARCH_SKELETON_KEYS.map((key) => (
          <Skeleton className="h-20 w-full" key={key} />
        ))}
      </div>
    );
  } else if (searchResults.length > 0) {
    searchContent = (
      <div className="max-h-80 space-y-2 overflow-y-auto">
        {searchResults.map((result) => (
          <SearchResultItem
            isAdded={
              recentlyAdded.has(result.id) ||
              currentCategoryFavorites.some((f) => f.apiId === result.id)
            }
            isAdding={addingId === result.id}
            key={result.id}
            onAdd={() => handleAdd(result)}
            result={result}
          />
        ))}
      </div>
    );
  } else if (trimmedQuery.length >= 2) {
    searchContent = (
      <p className="py-4 text-center text-muted-foreground text-sm">
        No results found for "{searchQuery}"
      </p>
    );
  } else if (showQueryHint) {
    searchContent = (
      <p className="py-4 text-center text-muted-foreground text-sm">
        Type at least 2 characters to search
      </p>
    );
  }

  let favoritesContent: ReactNode = null;

  if (isLoading) {
    favoritesContent = (
      <div className="space-y-4">
        {FAVORITES_SKELETON_KEYS.map((key) => (
          <Skeleton className="h-24 w-full" key={key} />
        ))}
      </div>
    );
  } else if (favorites.length === 0) {
    favoritesContent = (
      <p className="py-8 text-center text-muted-foreground">
        No favorites added yet. Search and add some above!
      </p>
    );
  } else {
    favoritesContent = (
      <div className="space-y-6">
        {CATEGORY_ORDER.map((category) => {
          const type = favoriteTypesByKey.get(category);
          if (!type) {
            return null;
          }

          const categoryFavorites = favoritesByType[type.id];
          if (!categoryFavorites || categoryFavorites.length === 0) {
            return null;
          }

          const config = CATEGORY_CONFIG[category];
          const typeName = type.namePlural ?? type.name ?? "Favorites";

          return (
            <div className="space-y-3" key={category}>
              <div className="flex items-center gap-2">
                <Icon className="size-5" icon={config.icon} />
                <h4 className="font-medium">{typeName}</h4>
                <span className="text-muted-foreground text-sm">
                  ({categoryFavorites.length})
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {categoryFavorites.map((fav) => (
                  <FavoriteItem
                    favorite={fav}
                    isRemoving={removingId === fav.id}
                    key={fav.id}
                    onRemove={() => handleRemove(fav)}
                    typeConfig={config}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-bold text-2xl">Favorites</h2>
        <p className="text-muted-foreground">
          Add their favorite books, movies, music, and more.
        </p>
      </div>

      {/* Search Section */}
      <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
        {/* Category Selector */}
        <div className="space-y-2">
          <Label>Type of Favorite</Label>
          <Select onValueChange={handleCategoryChange} value={selectedCategory}>
            <SelectTrigger className="w-full">
              <SelectValue>
                <span className="flex items-center gap-2">
                  <Icon className="size-4" icon={categoryConfig.icon} />
                  {categoryConfig.label}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_ORDER.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  <span className="flex items-center gap-2">
                    <Icon className="size-4" icon={CATEGORY_CONFIG[cat].icon} />
                    {CATEGORY_CONFIG[cat].label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Input */}
        <div className="space-y-2">
          <Label>Search {categoryConfig.labelPlural}</Label>
          <div className="relative">
            <Icon
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              icon="ph:magnifying-glass"
            />
            <Input
              className="pl-10"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
              placeholder={categoryConfig.searchPlaceholder}
              value={searchQuery}
            />
          </div>
        </div>

        {/* Search Results */}
        {searchContent}
      </div>

      {/* Added Favorites Section */}
      <div className="space-y-6">
        <h3 className="font-semibold text-lg">Added Favorites</h3>

        {favoritesContent}
      </div>
    </div>
  );
}
