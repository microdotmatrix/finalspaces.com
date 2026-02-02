import {
  MAX_RESULTS,
  NO_STORE,
  normalizeQuery,
  type SearchResult,
} from "./shared";

interface ArtInstituteSearchResponse {
  data?: Array<{
    id?: number;
    title?: string;
    artist_display?: string;
    date_display?: string;
    image_id?: string;
  }>;
}

export async function searchArtworks(query: string): Promise<SearchResult[]> {
  try {
    const normalizedQuery = normalizeQuery(query);
    if (!normalizedQuery) {
      return [];
    }

    const encodedQuery = encodeURIComponent(normalizedQuery);
    const response = await fetch(
      `https://api.artic.edu/api/v1/artworks/search?q=${encodedQuery}&limit=${MAX_RESULTS}&fields=id,title,artist_display,date_display,image_id`,
      NO_STORE
    );

    if (!response.ok) {
      throw new Error("Art Institute API error");
    }

    const data = (await response.json()) as ArtInstituteSearchResponse;
    return (data.data ?? []).map((artwork, index) => {
      const subtitle = [
        artwork.artist_display || "Unknown Artist",
        artwork.date_display ? `(${artwork.date_display})` : null,
      ]
        .filter(Boolean)
        .join(" ");

      return {
        id: artwork.id ? `artwork-${artwork.id}` : `artwork-${index}`,
        title: artwork.title ?? "Untitled",
        subtitle,
        imageUrl: artwork.image_id
          ? `https://www.artic.edu/iiif/2/${artwork.image_id}/full/200,/0/default.jpg`
          : null,
        externalUrl: artwork.id
          ? `https://www.artic.edu/artworks/${artwork.id}`
          : null,
      };
    });
  } catch (error) {
    console.error("Error searching artworks:", error);
    return [];
  }
}
