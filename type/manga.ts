interface Manga {
  id: string;
  title: string;
  slug: string;
  rating: number;
  coverThumbnail: string;
  cover: string;
  authors: string[];
  artists: string[];
  platform: string;
  type: string;
  releaseDate: string;
  status: string;
  genres: string[];
  views: number;
  description: string;
}


interface MangaExtended extends Manga {
  otherTitles: string[];
}


export default Manga; export { MangaExtended };