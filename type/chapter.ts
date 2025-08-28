interface ChapterPage {
  mangaId: string;
  chapterId: string;
  mangaName: string;
  chapterName: string;
  chapterNumber: number;
  pages: string[];
}

interface Chapter {
  id: string;
  title: string;
  number: number;
  createdAt: string;
}



export { ChapterPage, Chapter };