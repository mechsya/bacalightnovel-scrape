export interface Novel {
  title: string;
  author: string;
  status: string;
  genre: string;
  sinopsis: string;
  rating: number | string;
  R18: boolean;
  image: string | undefined;
  chapter: Chapter[];
}

export interface Chapter {
  title: string;
  slug: string;
  volume?: number | string | null;
  chapter: number | string | null;
  content?: string;
}
