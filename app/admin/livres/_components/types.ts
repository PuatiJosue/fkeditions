export interface Author {
  id: string
  name: string
}

export interface BookData {
  id?: string; slug: string; title: string; description: string; content: string
  price: string; pricePhysical: string; priceAudio: string; category: string; type: string; stock: string; year: string
  pages: string; audioDuration: string; coverImage: string; pdfFile: string; epubFile: string; audioFile: string
  published: boolean
  preOrder: boolean; releaseDate: string; authorId: string; coAuthors: string
  isMagazine: boolean; tier: string
  featuredName: string; featuredImage: string; featuredEvent: string
}

export const CATEGORIES = ['Roman', 'Jeunesse', 'Essai', 'Poésie', 'Thriller', 'Fantasy', 'Biographie', 'Portrait', 'Histoire', 'Géographie', 'Politique', 'Pratique', 'Cuisine', 'Éducation', 'Spiritualité', 'Magazine', 'Autre']
