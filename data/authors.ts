export interface Author {
  id: string;
  name: string;
  role: string;
  photo: string;
  bio: string;
  books: string[];
  social?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
}

export const authors: Author[] = [
  {
    id: "fortune-khonde",
    name: "Fortune Khonde",
    role: "Fondateur & Auteur",
    photo: "/images/authors/fortune-khonde.jpg",
    bio: "Fortune Khonde incarne un leadership multidimensionnel au service de Dieu et de la société. Président-fondateur de Water of Life Mission, il dirige ce ministère évangélique avec une vision claire : œuvrer sans relâche pour le salut des âmes et la propagation de la Parole. Sur le plan professionnel, il s'appuie sur une solide expertise en finance et en banque pour conseiller les porteurs de projets en tant que consultant en entrepreneuriat. Acteur majeur du monde du livre, il est à la tête de la maison FK EDITIONS depuis 6 ans, où il conjugue ses casquettes d'auteur et d'éditeur pour propulser de nouveaux talents et diffuser des ouvrages de qualité. Passionné par le sport et la musique, Fortune Khonde allie discipline, créativité et foi pour impacter sa génération sur tous les fronts.",
    books: ["le-rap"],
    social: {
      facebook: "https://www.facebook.com/fortune.khonde.3",
      instagram: "#",
    },
  },
];
