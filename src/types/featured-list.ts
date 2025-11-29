export interface FeaturedList {
  id: string;
  title: string;
  description: string | null;
  is_published: boolean; // ← Backend field name
  created_at: string;
  updated_at: string;
  ownerId: string; // ← Backend field name
  _count: {
    movies: number;
  };
  movies?: FeaturedListMovie[];
}

export interface FeaturedListMovie {
  id: string;
  movie_id: number;
  display_order: number;
  added_at: string;
  movie: {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string | null;
    vote_average: number | null;
  };
}

export interface CreateFeaturedListDto {
  title: string;
  description?: string;
  movie_ids: number[];
}

export interface UpdateFeaturedListDto {
  title?: string;
  description?: string;
  is_published?: boolean; // ← Backend field name
  movie_ids?: number[];
}
