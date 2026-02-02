import "server-only";

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  year?: number | null;
  imageUrl: string | null;
  externalUrl: string | null;
}

export const MAX_RESULTS = 10;
export const MIN_CUSTOM_QUERY_LENGTH = 2;
export const NO_STORE: RequestInit = { cache: "no-store" };

export const normalizeQuery = (query: string): string | null => {
  const trimmedQuery = query.trim();
  return trimmedQuery.length > 0 ? trimmedQuery : null;
};

export const parseYearFromDate = (value?: string): number | null => {
  if (!value) {
    return null;
  }

  const year = Number(value.slice(0, 4));
  return Number.isFinite(year) ? year : null;
};

export const toSlug = (value: string): string =>
  value.toLowerCase().replace(/\s+/g, "-");

export const POPULAR_BOARD_GAMES: SearchResult[] = [
  {
    id: "boardgame-catan",
    title: "Catan",
    subtitle: "Strategy • 1995",
    imageUrl: null,
    externalUrl: "https://www.catan.com/",
  },
  {
    id: "boardgame-ticket-to-ride",
    title: "Ticket to Ride",
    subtitle: "Strategy • 2004",
    imageUrl: null,
    externalUrl: "https://www.daysofwonder.com/tickettoride/",
  },
  {
    id: "boardgame-pandemic",
    title: "Pandemic",
    subtitle: "Cooperative • 2008",
    imageUrl: null,
    externalUrl: "https://www.zmangames.com/en/games/pandemic/",
  },
  {
    id: "boardgame-risk",
    title: "Risk",
    subtitle: "Strategy • 1957",
    imageUrl: null,
    externalUrl: "https://www.hasbro.com/en-us/brands/risk",
  },
  {
    id: "boardgame-monopoly",
    title: "Monopoly",
    subtitle: "Classic • 1935",
    imageUrl: null,
    externalUrl: "https://www.hasbro.com/en-us/brands/monopoly",
  },
  {
    id: "boardgame-chess",
    title: "Chess",
    subtitle: "Classic Strategy",
    imageUrl: null,
    externalUrl: "https://www.chess.com/",
  },
  {
    id: "boardgame-scrabble",
    title: "Scrabble",
    subtitle: "Word Game • 1938",
    imageUrl: null,
    externalUrl: "https://scrabble.hasbro.com/",
  },
  {
    id: "boardgame-clue",
    title: "Clue",
    subtitle: "Mystery • 1949",
    imageUrl: null,
    externalUrl: "https://www.hasbro.com/en-us/brands/clue",
  },
  {
    id: "boardgame-azul",
    title: "Azul",
    subtitle: "Tile-laying • 2017",
    imageUrl: null,
    externalUrl: "https://www.planbgames.com/en/games/azul",
  },
  {
    id: "boardgame-wingspan",
    title: "Wingspan",
    subtitle: "Engine-building • 2019",
    imageUrl: null,
    externalUrl: "https://stonemaiergames.com/games/wingspan/",
  },
  {
    id: "boardgame-codenames",
    title: "Codenames",
    subtitle: "Party • 2015",
    imageUrl: null,
    externalUrl: "https://czechgames.com/en/codenames/",
  },
  {
    id: "boardgame-splendor",
    title: "Splendor",
    subtitle: "Engine-building • 2014",
    imageUrl: null,
    externalUrl: "https://www.spacecowboys.fr/splendor",
  },
  {
    id: "boardgame-carcassonne",
    title: "Carcassonne",
    subtitle: "Tile-laying • 2000",
    imageUrl: null,
    externalUrl: "https://www.zmangames.com/en/games/carcassonne/",
  },
  {
    id: "boardgame-7-wonders",
    title: "7 Wonders",
    subtitle: "Card Drafting • 2010",
    imageUrl: null,
    externalUrl: "https://www.rprod.com/en/games/7-wonders",
  },
  {
    id: "boardgame-dominion",
    title: "Dominion",
    subtitle: "Deck-building • 2008",
    imageUrl: null,
    externalUrl: "https://www.riograndegames.com/games/dominion/",
  },
  {
    id: "boardgame-agricola",
    title: "Agricola",
    subtitle: "Worker Placement • 2007",
    imageUrl: null,
    externalUrl: "https://www.lookout-spiele.de/en/games/agricola/",
  },
  {
    id: "boardgame-terraforming-mars",
    title: "Terraforming Mars",
    subtitle: "Engine-building • 2016",
    imageUrl: null,
    externalUrl: "https://www.fryxgames.se/games/terraforming-mars/",
  },
  {
    id: "boardgame-gloomhaven",
    title: "Gloomhaven",
    subtitle: "Dungeon Crawl • 2017",
    imageUrl: null,
    externalUrl: "https://www.cephalofair.com/gloomhaven",
  },
  {
    id: "boardgame-sequence",
    title: "Sequence",
    subtitle: "Abstract • 1982",
    imageUrl: null,
    externalUrl: "https://www.goliathgames.us/sequence/",
  },
  {
    id: "boardgame-trivial-pursuit",
    title: "Trivial Pursuit",
    subtitle: "Trivia • 1981",
    imageUrl: null,
    externalUrl: "https://www.hasbro.com/en-us/brands/trivial-pursuit",
  },
];

export const POPULAR_TEAMS: SearchResult[] = [
  {
    id: "team-lakers",
    title: "Los Angeles Lakers",
    subtitle: "Basketball • NBA",
    imageUrl: null,
    externalUrl: "https://www.nba.com/lakers/",
  },
  {
    id: "team-celtics",
    title: "Boston Celtics",
    subtitle: "Basketball • NBA",
    imageUrl: null,
    externalUrl: "https://www.nba.com/celtics/",
  },
  {
    id: "team-warriors",
    title: "Golden State Warriors",
    subtitle: "Basketball • NBA",
    imageUrl: null,
    externalUrl: "https://www.nba.com/warriors/",
  },
  {
    id: "team-bulls",
    title: "Chicago Bulls",
    subtitle: "Basketball • NBA",
    imageUrl: null,
    externalUrl: "https://www.nba.com/bulls/",
  },
  {
    id: "team-knicks",
    title: "New York Knicks",
    subtitle: "Basketball • NBA",
    imageUrl: null,
    externalUrl: "https://www.nba.com/knicks/",
  },
  {
    id: "team-yankees",
    title: "New York Yankees",
    subtitle: "Baseball • MLB",
    imageUrl: null,
    externalUrl: "https://www.mlb.com/yankees",
  },
  {
    id: "team-red-sox",
    title: "Boston Red Sox",
    subtitle: "Baseball • MLB",
    imageUrl: null,
    externalUrl: "https://www.mlb.com/redsox",
  },
  {
    id: "team-dodgers",
    title: "Los Angeles Dodgers",
    subtitle: "Baseball • MLB",
    imageUrl: null,
    externalUrl: "https://www.mlb.com/dodgers",
  },
  {
    id: "team-cubs",
    title: "Chicago Cubs",
    subtitle: "Baseball • MLB",
    imageUrl: null,
    externalUrl: "https://www.mlb.com/cubs",
  },
  {
    id: "team-cowboys",
    title: "Dallas Cowboys",
    subtitle: "Football • NFL",
    imageUrl: null,
    externalUrl: "https://www.dallascowboys.com/",
  },
  {
    id: "team-patriots",
    title: "New England Patriots",
    subtitle: "Football • NFL",
    imageUrl: null,
    externalUrl: "https://www.patriots.com/",
  },
  {
    id: "team-packers",
    title: "Green Bay Packers",
    subtitle: "Football • NFL",
    imageUrl: null,
    externalUrl: "https://www.packers.com/",
  },
  {
    id: "team-49ers",
    title: "San Francisco 49ers",
    subtitle: "Football • NFL",
    imageUrl: null,
    externalUrl: "https://www.49ers.com/",
  },
  {
    id: "team-chiefs",
    title: "Kansas City Chiefs",
    subtitle: "Football • NFL",
    imageUrl: null,
    externalUrl: "https://www.chiefs.com/",
  },
  {
    id: "team-man-united",
    title: "Manchester United",
    subtitle: "Soccer • Premier League",
    imageUrl: null,
    externalUrl: "https://www.manutd.com/",
  },
  {
    id: "team-liverpool",
    title: "Liverpool FC",
    subtitle: "Soccer • Premier League",
    imageUrl: null,
    externalUrl: "https://www.liverpoolfc.com/",
  },
  {
    id: "team-real-madrid",
    title: "Real Madrid",
    subtitle: "Soccer • La Liga",
    imageUrl: null,
    externalUrl: "https://www.realmadrid.com/",
  },
  {
    id: "team-barcelona",
    title: "FC Barcelona",
    subtitle: "Soccer • La Liga",
    imageUrl: null,
    externalUrl: "https://www.fcbarcelona.com/",
  },
  {
    id: "team-chelsea",
    title: "Chelsea FC",
    subtitle: "Soccer • Premier League",
    imageUrl: null,
    externalUrl: "https://www.chelseafc.com/",
  },
  {
    id: "team-arsenal",
    title: "Arsenal FC",
    subtitle: "Soccer • Premier League",
    imageUrl: null,
    externalUrl: "https://www.arsenal.com/",
  },
  {
    id: "team-blackhawks",
    title: "Chicago Blackhawks",
    subtitle: "Hockey • NHL",
    imageUrl: null,
    externalUrl: "https://www.nhl.com/blackhawks/",
  },
  {
    id: "team-maple-leafs",
    title: "Toronto Maple Leafs",
    subtitle: "Hockey • NHL",
    imageUrl: null,
    externalUrl: "https://www.nhl.com/mapleleafs/",
  },
  {
    id: "team-bruins",
    title: "Boston Bruins",
    subtitle: "Hockey • NHL",
    imageUrl: null,
    externalUrl: "https://www.nhl.com/bruins/",
  },
  {
    id: "team-rangers",
    title: "New York Rangers",
    subtitle: "Hockey • NHL",
    imageUrl: null,
    externalUrl: "https://www.nhl.com/rangers/",
  },
];
