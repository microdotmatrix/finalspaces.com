import {
  MAX_RESULTS,
  NO_STORE,
  normalizeQuery,
  type SearchResult,
} from "./shared";

interface OpenLibrarySearchResponse {
  docs?: Array<{
    key?: string;
    title?: string;
    author_name?: string[];
    first_publish_year?: number;
    cover_i?: number;
  }>;
}

export async function searchBooks(query: string): Promise<SearchResult[]> {
  try {
    const normalizedQuery = normalizeQuery(query);
    if (!normalizedQuery) {
      return [];
    }

    const encodedQuery = encodeURIComponent(normalizedQuery);
    const response = await fetch(
      `https://openlibrary.org/search.json?q=${encodedQuery}&limit=${MAX_RESULTS}&fields=key,title,author_name,first_publish_year,cover_i`,
      NO_STORE
    );

    if (!response.ok) {
      throw new Error("Open Library API error");
    }

    const data = (await response.json()) as OpenLibrarySearchResponse;
    return (data.docs ?? []).map((book, index) => ({
      id: book.key ?? `book-${index}`,
      title: book.title ?? "Untitled",
      subtitle: book.author_name?.join(", ") || "Unknown Author",
      year: book.first_publish_year ?? null,
      imageUrl: book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
        : null,
      externalUrl: book.key ? `https://openlibrary.org${book.key}` : null,
    }));
  } catch (error) {
    console.error("Error searching books:", error);
    return [];
  }
}
