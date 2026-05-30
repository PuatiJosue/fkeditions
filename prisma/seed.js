const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Admin user
  const hash = await bcrypt.hash('fkeditions2024', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'editionsfk@gmail.com' },
    update: {},
    create: {
      email: 'editionsfk@gmail.com',
      password: hash,
      name: 'Fortune Khonde',
      role: 'ADMIN',
    },
  })
  console.log('Admin:', admin.email)

  // Author
  const author = await prisma.author.upsert({
    where: { slug: 'fortune-khonde' },
    update: {},
    create: {
      slug: 'fortune-khonde',
      name: 'Fortune Khonde',
      role: 'Fondateur & Auteur',
      photo: '/images/authors/fortune-khonde.jpg',
      bio: "Fortune Khonde est le fondateur de FK Éditions, maison d'édition indépendante basée à Kinshasa. Passionné de littérature, de musique et de spiritualité, il a créé cette plateforme pour donner une voix aux auteurs et écrivains qui ont des histoires à partager. Son premier ouvrage, \"Le rap, une autre voie d'évangélisation dans la musique\", explore l'intersection entre la culture urbaine et la foi.",
      facebook: 'https://www.facebook.com/fortune.khonde.3',
      instagram: '#',
    },
  })
  console.log('Auteur:', author.name)

  // Books
  const books = [
    {
      slug: 'elles-ont-ecrit',
      title: "Elles ont écrit l'histoire et l'histoire a parlé d'elles",
      description: "Une célébration magnifique des femmes qui ont bouleversé le cours de l'histoire par leur courage, leur talent et leur détermination. Un hommage vibrant à travers les âges et les continents.",
      price: 5,
      category: 'Roman',
      type: 'EBOOK',
      pages: 45,
      year: 2026,
      coverImage: '/images/books/elles-ont-ecrit.jpg',
      published: true,
      content: [
        "Chapitre I — Les pionnières",
        "Il était une fois des femmes qui refusèrent d'être effacées de l'histoire. Elles prirent la plume, levèrent la voix, traversèrent les frontières du possible pour laisser une empreinte indélébile dans la mémoire collective de l'humanité.",
        "Elles ne demandèrent pas la permission d'exister. Elles existèrent. Pleinement, brillamment, courageusement. Et l'histoire, cette grande conteuse, ne put faire autrement que de parler d'elles.",
        "Chapitre II — La transmission",
        "De génération en génération, ces récits voyagèrent comme des flammes qui s'allument les unes les autres.",
      ],
    },
    {
      slug: 'porteur-de-promesses',
      title: 'Porteur de promesses – Vol. 1',
      description: "Un voyage initiatique extraordinaire suivant un jeune héros à travers des paysages grandioses. Plein d'espoir, d'amitié et de découvertes, ce premier volume inaugure une saga jeunesse inoubliable.",
      price: 9,
      category: 'Jeunesse',
      type: 'EBOOK',
      pages: 220,
      year: 2022,
      coverImage: '/images/books/porteur-de-promesses.jpg',
      published: true,
      authorId: author.id,
      content: [
        "Prologue",
        "Le sac sur le dos, les yeux grands ouverts sur l'horizon, Elias n'avait pas encore compris que ce matin-là allait changer sa vie pour toujours.",
        "Chapitre 1 — Le départ",
        "Il avait douze ans, une promesse à tenir et un chemin devant lui.",
        "Chapitre 2 — La rencontre",
        "C'est sur un pont de bois vermoulu qu'il rencontra Amara.",
      ],
    },
    {
      slug: 'le-rap',
      title: "Le rap, une autre voie d'évangélisation dans la musique",
      description: "Une réflexion profonde et documentée sur le rap comme vecteur de spiritualité et de message divin. Fortune Khonde explore comment la musique urbaine peut devenir un outil d'évangélisation puissant à l'ère moderne.",
      price: 5,
      category: 'Essai',
      type: 'EBOOK',
      pages: 156,
      year: 2020,
      coverImage: '/images/books/le-rap.jpg',
      published: true,
      preOrder: true,
      releaseDate: new Date('2026-05-19'),
      authorId: author.id,
      content: [
        "Introduction",
        "Le rap est né dans les rues, porté par des voix que l'on n'écoutait pas.",
        "Chapitre I — Les origines du rap et la parole",
        "Avant d'être une industrie musicale, le rap était une tradition orale.",
        "Chapitre II — Quand le message transcende le medium",
        "Des artistes comme Lecrae aux États-Unis, Pasteur Semeki en Afrique...",
      ],
    },
  ]

  for (const book of books) {
    await prisma.book.upsert({
      where: { slug: book.slug },
      update: {},
      create: book,
    })
    console.log('Livre:', book.title)
  }

  // Event: séance dédicace
  const existingEvent = await prisma.event.findFirst({
    where: { title: { contains: 'Séance dédicace' } }
  })
  if (!existingEvent) {
    await prisma.event.create({
      data: {
        title: 'Séance dédicace — FK Éditions',
        description: 'Rencontrez les auteurs de FK Éditions lors de cette séance dédicace exceptionnelle. Une occasion unique d\'échanger, de faire signer vos livres et de partager un moment privilégié avec l\'équipe éditoriale.',
        date: new Date('2026-07-01T14:00:00'),
        location: 'Kinshasa, RDC',
        published: true,
      }
    })
    console.log('Événement: Séance dédicace ajouté')
  }

  console.log('\nSeed terminé avec succès!')
  console.log('Email    : editionsfk@gmail.com')
  console.log('Password : fkeditions2024')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
