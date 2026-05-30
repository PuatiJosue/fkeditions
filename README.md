# FK Éditions

Plateforme de vente de livres numériques et d'abonnements à la revue littéraire FK, basée à Kinshasa, RDC.

## Prérequis

- Node.js 18+
- MySQL 8+

## Installation

```bash
npm install
```

Copier le fichier d'environnement et remplir les variables :

```bash
cp .env.example .env
```

Appliquer le schéma en base de données :

```bash
npx prisma generate
```

Peupler la base avec les données initiales :

```bash
npm run seed
```

## Démarrer en développement

```bash
npm run dev
```

Le site est accessible sur [http://localhost:3000](http://localhost:3000).  
Le panel admin est sur [http://localhost:3000/admin](http://localhost:3000/admin).

## Build de production

```bash
npm run build
npm start
```

## Documentation

Voir [ARCHITECTURE.md](./ARCHITECTURE.md) pour l'architecture complète du projet.

## Compte admin par défaut

Email : `editionsfk@gmail.com`  
Mot de passe : à définir lors du premier déploiement.
