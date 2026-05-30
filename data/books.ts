export interface Book {
  id: string;
  title: string;
  price: number;
  coverImage: string;
  category: "Roman" | "Jeunesse" | "Essai" | "Poésie" | "Thriller" | "Fantasy";
  author: string;
  description: string;
  pages?: number;
  year?: number;
  content?: string[];
  preOrder?: boolean;
  releaseDate?: string; // ISO date string e.g. '2026-05-19'
}

export const books: Book[] = [
  {
    id: "elles-ont-ecrit",
    title: "Elles ont écrit l'histoire et l'histoire a parlé d'elles",
    price: 5,
    coverImage: "/images/books/elles-ont-ecrit.jpg",
    category: "Roman",
    author: "FK Éditions",
    description:
      "Une célébration magnifique des femmes qui ont bouleversé le cours de l'histoire par leur courage, leur talent et leur détermination. Un hommage vibrant à travers les âges et les continents.",
    pages: 45,
    year: 2026,
    content: [
      "Chapitre I — Les pionnières",
      "Il était une fois des femmes qui refusèrent d'être effacées de l'histoire. Elles prirent la plume, levèrent la voix, traversèrent les frontières du possible pour laisser une empreinte indélébile dans la mémoire collective de l'humanité.",
      "Elles ne demandèrent pas la permission d'exister. Elles existèrent. Pleinement, brillamment, courageusement. Et l'histoire, cette grande conteuse, ne put faire autrement que de parler d'elles.",
      "Chapitre II — La transmission",
      "De génération en génération, ces récits voyagèrent comme des flammes qui s'allument les unes les autres. Chaque femme qui lisait ces histoires y trouvait un miroir, une boussole, une source d'inspiration inépuisable.",
      "Car raconter l'histoire des femmes, c'est raconter l'histoire de l'humanité tout entière. C'est reconnaître que le progrès porte souvent un visage féminin, même quand l'histoire officielle s'obstine à le taire.",
    ],
  },
  {
    id: "porteur-de-promesses",
    title: "Porteur de promesses – Vol. 1",
    price: 9,
    coverImage: "/images/books/porteur-de-promesses.jpg",
    category: "Jeunesse",
    author: "Fortune Khonde & Daniela Kayiba",
    description:
      "Un voyage initiatique extraordinaire suivant un jeune héros à travers des paysages grandioses. Plein d'espoir, d'amitié et de découvertes, ce premier volume inaugure une saga jeunesse inoubliable. Une œuvre en collaboration signée Fortune Khonde et Daniela Kayiba.",
    pages: 220,
    year: 2022,
    content: [
      "Prologue",
      "Le sac sur le dos, les yeux grands ouverts sur l'horizon, Elias n'avait pas encore compris que ce matin-là allait changer sa vie pour toujours. Le soleil se levait sur les collines comme un incendie doux, teintant le ciel de nuances d'orange et d'or.",
      "Chapitre 1 — Le départ",
      "Il avait douze ans, une promesse à tenir et un chemin devant lui. La promesse venait de son père, prononcée un soir de fièvre dans une chambre qui sentait la résine de pin et la sueur. \"Tu porteras ce que je n'ai pas pu porter, fils. Tu iras là où je n'ai pas pu aller.\"",
      "Les collines l'attendaient. Les collines et tout ce qui se cache au-delà de ce que l'on connaît. Elias prit un grande inspiration, ajusta les bretelles de son sac, et fit le premier pas.",
      "Chapitre 2 — La rencontre",
      "C'est sur un pont de bois vermoulu qu'il rencontra Amara. Elle était assise sur la rambarde, les pieds dans le vide, à observer la rivière en contrebas avec une curiosité tranquille qui frappa Elias comme une évidence.",
    ],
  },
  {
    id: "le-rap",
    title: "Le rap, une autre voie d'évangélisation dans la musique",
    price: 5,
    preOrder: true,
    releaseDate: "2026-05-19",
    coverImage: "/images/books/le-rap.jpg",
    category: "Essai",
    author: "Fortune Khonde",
    description:
      "Une réflexion profonde et documentée sur le rap comme vecteur de spiritualité et de message divin. Fortune Khonde explore comment la musique urbaine peut devenir un outil d'évangélisation puissant à l'ère moderne.",
    pages: 156,
    year: 2020,
    content: [
      "Introduction",
      "Le rap est né dans les rues, porté par des voix que l'on n'écoutait pas. Mais ces voix avaient quelque chose à dire — quelque chose d'urgent, de vrai, de nécessaire. Et si, parmi ces voix, certaines portaient un message qui dépasse la simple expression artistique ?",
      "Chapitre I — Les origines du rap et la parole",
      "Avant d'être une industrie musicale, le rap était une tradition orale. Une façon de transmettre, d'enseigner, d'interpeller. Dans de nombreuses cultures africaines, le griot jouait un rôle similaire : messager, historien, prophète.",
      "Cette filiation n'est pas anodine. Elle révèle quelque chose d'essentiel sur la nature même du rap : c'est une musique de la parole. Et la parole, dans les traditions spirituelles, a toujours été sacrée.",
      "Chapitre II — Quand le message transcende le medium",
      "Des artistes comme Lecrae aux États-Unis, Pasteur Semeki en Afrique, ou les nombreux collectifs de rap chrétien qui fleurissent en République Démocratique du Congo, prouvent que le rap peut être un véhicule de foi authentique.",
      "Il ne s'agit pas de remplacer la prédication traditionnelle, mais de toucher ceux que les formes conventionnelles n'atteignent plus. La génération connectée, urbaine, en quête de sens.",
    ],
  },
];

export const getFeaturedBooks = () => books.slice(0, 3);

export const getBookById = (id: string) => books.find((b) => b.id === id);
