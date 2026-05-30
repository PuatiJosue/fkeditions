export interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  city: string
  description: string
  image?: string
  bookId?: string
}

export const events: Event[] = [
  {
    id: 'dedicace-rap-kinshasa',
    title:
      "Séance dédicace — Le rap, une autre voie d'évangélisation dans la musique",
    date: '15 Juin 2024',
    time: '14h00 – 18h00',
    location: 'Centre culturel de Kinshasa',
    city: 'Kinshasa, RDC',
    description:
      'Rencontrez Fortune Khonde en personne lors de cette séance dédicace exceptionnelle. L\'auteur sera disponible pour signer votre exemplaire, répondre à vos questions et partager sa vision de la littérature et de la musique comme vecteurs d\'évangélisation.',
    bookId: 'le-rap',
  },
  {
    id: 'dedicace-rap-montreal',
    title:
      "Séance dédicace — Le rap, une autre voie d'évangélisation dans la musique",
    date: '22 Juin 2024',
    time: '16h00 – 20h00',
    location: 'Librairie Paragraphe',
    city: 'Montréal, Canada',
    description:
      'Pour la communauté congolaise et les amateurs de littérature à Montréal, une soirée unique avec Fortune Khonde. Discussion, musique live et séance de signature dans une atmosphère chaleureuse et conviviale.',
    bookId: 'le-rap',
  },
  {
    id: 'lancement-porteur',
    title: 'Lancement officiel — Porteur de promesses Vol. 1',
    date: '05 Juillet 2024',
    time: '18h00 – 21h00',
    location: 'Maison de la Culture',
    city: 'Kinshasa, RDC',
    description:
      'Célébrez avec nous le lancement du premier volume de Porteur de Promesses. Une soirée de lecture, de rencontres et de partage autour de ce nouveau titre jeunesse qui promet de marquer les esprits.',
    bookId: 'porteur-de-promesses',
  },
]
