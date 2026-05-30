# Architecture — FK Éditions

Plateforme de vente de livres numériques et d'abonnements à une revue littéraire.  
Développée avec **Next.js 16 (App Router)**, **Prisma + MySQL**, **NextAuth**, **PayPal** et **Resend**.

---

## Table des matières

1. [Stack technique](#1-stack-technique)
2. [Structure des dossiers](#2-structure-des-dossiers)
3. [Base de données](#3-base-de-données)
4. [Authentification et sécurité](#4-authentification-et-sécurité)
5. [Pages publiques](#5-pages-publiques)
6. [Panel admin](#6-panel-admin)
7. [API Routes](#7-api-routes)
8. [Flux de paiement](#8-flux-de-paiement)
9. [Upload de fichiers](#9-upload-de-fichiers)
10. [Composants réutilisables](#10-composants-réutilisables)
11. [Librairies utilitaires](#11-librairies-utilitaires)
12. [Variables d'environnement](#12-variables-denvironnement)
13. [Commandes utiles](#13-commandes-utiles)

---

## 1. Stack technique

| Technologie | Rôle |
|---|---|
| **Next.js 16** | Framework React — App Router, Server Components, API Routes |
| **TypeScript** | Typage statique |
| **Tailwind CSS** | Styles utilitaires, thème personnalisé (dark/gold/cream) |
| **Prisma v5** | ORM — communique avec la base de données |
| **MySQL** | Base de données relationnelle |
| **NextAuth v4** | Authentification (sessions JWT, login/register) |
| **PayPal Orders API v2** | Paiements internationaux (livres + abonnements) |
| **Resend** | Envoi d'emails (confirmation, mot de passe oublié) |
| **bcryptjs** | Hashage des mots de passe |

---

## 2. Structure des dossiers

```
FKEdition/
│
├── app/                        ← Toutes les pages et API (Next.js App Router)
│   ├── page.tsx                ← Page d'accueil
│   ├── layout.tsx              ← Layout global (Navbar, Footer, Providers)
│   ├── middleware.ts           ← Garde de sécurité (auth + rôles)
│   │
│   ├── livres/                 ← Catalogue + détail d'un livre
│   ├── bibliotheque/           ← Mes livres achetés (privé)
│   ├── revue/                  ← Page abonnement à la revue
│   ├── auteurs/                ← Liste des auteurs
│   ├── evenements/             ← Événements littéraires
│   ├── compte/                 ← Profil utilisateur
│   ├── login/ register/        ← Connexion / Inscription
│   ├── forgot-password/        ← Mot de passe oublié
│   ├── reset-password/         ← Réinitialisation du mot de passe
│   ├── contact/                ← Formulaire de contact
│   │
│   ├── admin/                  ← Panel d'administration (rôle ADMIN requis)
│   │   ├── page.tsx            ← Tableau de bord (stats + graphique)
│   │   ├── livres/             ← Gestion des livres
│   │   ├── auteurs/            ← Gestion des auteurs
│   │   ├── revue/              ← Gestion des numéros de revue
│   │   ├── commandes/          ← Validation des commandes Mobile Money
│   │   ├── utilisateurs/       ← Gestion des comptes utilisateurs
│   │   ├── evenements/         ← Gestion des événements
│   │   ├── newsletter/         ← Export des abonnés newsletter
│   │   └── parametres/         ← Prix des abonnements (modifiables)
│   │
│   └── api/                    ← Endpoints REST
│       ├── auth/               ← Inscription, mot de passe oublié/reset
│       ├── admin/              ← CRUD livres, auteurs, revue, commandes, settings
│       ├── checkout/           ← Paiements PayPal + Mobile Money
│       ├── download/           ← Téléchargement sécurisé des PDFs
│       ├── revue/              ← Accès aux numéros de revue selon l'abonnement
│       ├── purchases/          ← Liste des achats de l'utilisateur connecté
│       ├── settings/           ← Prix publics (sans auth, pour la page revue)
│       ├── contact/            ← Envoi de l'email de contact
│       ├── newsletter/         ← Inscription à la newsletter
│       └── user/               ← Profil + avatar de l'utilisateur
│
├── components/                 ← Composants React réutilisables
├── lib/                        ← Fonctions utilitaires (auth, email, prisma, paypal)
├── prisma/                     ← Schéma de la base de données + seed
├── public/uploads/             ← Images uploadées (couvertures, photos auteurs)
├── private/pdfs/               ← PDFs des livres (non accessibles directement)
└── data/                       ← Données statiques de secours (legacy)
```

---

## 3. Base de données

Le schéma est défini dans `prisma/schema.prisma`. Voici chaque table et son rôle.

### `users` — Utilisateurs
Chaque personne qui crée un compte sur le site.
- `role` : `CUSTOMER` (acheteur) ou `ADMIN` (gestion complète du site)
- `password` : toujours hashé avec bcrypt, jamais stocké en clair

### `books` — Livres
Catalogue complet des livres vendus sur le site.
- `slug` : identifiant URL unique (ex: `le-rap-des-rues`) — utilisé dans les liens
- `type` : `EBOOK` (PDF téléchargeable) ou `PHYSICAL` (livre papier)
- `published` : si `false`, le livre est invisible sur le site
- `preOrder` : si `true`, le client paie maintenant mais reçoit le PDF à `releaseDate`
- `content` : extrait du livre (tableau JSON de paragraphes)
- `coAuthors` : noms des co-auteurs séparés par des virgules
- `pdfFile` : chemin vers `private/pdfs/` — jamais accessible directement par le navigateur

### `authors` — Auteurs
Profils des auteurs liés aux livres.
- `slug` : identifiant URL unique de l'auteur
- Un auteur peut avoir plusieurs livres (`books[]`)

### `purchases` — Achats de livres
Chaque transaction d'achat d'un livre.
- `paymentMethod` : `STRIPE` (ancienne méthode, non utilisée) ou `MOBILE_MONEY`
  - **Note** : PayPal est géré mais enregistré avec le champ `stripeId` (héritage du code)
- `status` : `PENDING` → en attente de validation, `COMPLETED` → validé
- `reference` : numéro unique au format `FK-0001` — généré automatiquement
- Pour Mobile Money : l'admin valide manuellement depuis `/admin/commandes`

### `subscriptions` — Abonnements à la revue
Chaque abonnement à la revue FK.
- `plan` : `mensuel`, `trimestriel`, `semestriel`, `annuel`
- `endDate` : date d'expiration — utilisée pour vérifier l'accès aux numéros
- Règle d'accès : plan `mensuel` → numéro du mois en cours seulement. Autres plans → tous les numéros publiés.

### `revue_issues` — Numéros de la revue
Chaque numéro mensuel de la revue.
- `published` : si `false`, le numéro n'est pas accessible même aux abonnés
- `pdfFile` : chemin vers `private/pdfs/revue/` — servi via API sécurisée

### `settings` — Paramètres configurables
Table clé-valeur pour les réglages que l'admin peut modifier sans toucher au code.
- Clés utilisées : `price_mensuel`, `price_trimestriel`, `price_semestriel`, `price_annuel`
- Modifiable depuis `/admin/parametres`

### `newsletter_subscribers` — Abonnés newsletter
Emails inscrits via le formulaire newsletter. Exportables en CSV depuis l'admin.

### `password_reset_tokens` — Tokens de réinitialisation
Tokens temporaires (expiration 1h) envoyés par email pour le mot de passe oublié.

### `events` — Événements
Événements littéraires affichés sur la page `/evenements`.

---

## 4. Authentification et sécurité

### NextAuth (`lib/auth.ts`)
- Stratégie : **JWT** (pas de sessions en base de données)
- Provider : `CredentialsProvider` — email + mot de passe vérifiés contre la base
- Le token JWT contient : `id`, `email`, `name`, `role`
- Le rôle est ajouté dans les callbacks `jwt` et `session` pour être accessible partout

### Middleware (`middleware.ts`)
Fichier exécuté **avant chaque requête** pour protéger les routes.

- **Routes protégées (connexion requise)** : `/bibliotheque`, `/compte`, `/admin`, `/api/admin`, `/api/download`, `/api/checkout`
- **Routes admin (rôle ADMIN requis)** : `/admin/*` et `/api/admin/*`
- Si non connecté sur une page → redirection vers `/login?callbackUrl=...`
- Si non connecté sur une API → réponse `401 Unauthorized`
- Si connecté mais pas admin → redirection vers `/login?error=admin_required`

### Mots de passe
- Hashés avec `bcryptjs` (coût 12) à l'inscription et au changement de mot de passe
- Jamais stockés en clair, jamais renvoyés dans une réponse API

---

## 5. Pages publiques

### `/` — Accueil (`app/page.tsx`)
- Sections : Hero, Livres en vedette, À propos de FK Éditions, Plans d'abonnement, Newsletter
- Les livres sont lus **en temps réel depuis la base de données** (`force-dynamic`)
- Quand l'admin publie ou modifie un livre, l'accueil se met à jour automatiquement

### `/livres` — Catalogue (`app/livres/`)
- Liste tous les livres publiés avec filtres par catégorie
- `LivresClient.tsx` : composant client qui gère la recherche et les filtres côté navigateur

### `/livres/[id]` — Détail d'un livre (`app/livres/[id]/page.tsx`)
- `[id]` = le **slug** du livre (ex: `/livres/le-rap-des-rues`)
- Affiche description, extrait, auteur(s), prix
- Intègre `CheckoutSection` pour le paiement
- Vérifie via `/api/purchases` si l'utilisateur a déjà acheté le livre → bouton "Télécharger"

### `/bibliotheque` — Mes livres (`app/bibliotheque/page.tsx`)
- Accessible uniquement aux utilisateurs connectés (middleware)
- Affiche les livres avec statut `COMPLETED` achetés par l'utilisateur
- Bouton de téléchargement → appelle `/api/download/[bookSlug]`

### `/revue` — Abonnement revue (`app/revue/page.tsx`)
- Présente les plans d'abonnement avec les prix lus depuis `/api/settings` (dynamiques)
- Si connecté + abonné actif : affiche les numéros accessibles selon le plan
- Si non abonné : affiche les plans et le formulaire de paiement

### `/auteurs` — Auteurs (`app/auteurs/page.tsx`)
- Liste des auteurs avec photo, rôle, bio courte
- Chaque carte est un lien vers le profil complet

### `/compte` — Mon profil (`app/compte/page.tsx`)
- Modification du nom, email, mot de passe
- Upload d'un avatar
- Composant `PasswordStrength` pour indiquer la force du mot de passe en temps réel

---

## 6. Panel admin

Accessible uniquement avec le rôle `ADMIN`. Navigation dans `app/admin/layout.tsx`.

### `/admin` — Tableau de bord
- Statistiques : nombre de livres, auteurs, commandes en attente, abonnés newsletter
- Graphique des ventes sur les 6 derniers mois (`RevenueChart.tsx` avec Recharts)

### `/admin/livres` — Gestion des livres
- Liste tous les livres avec statut publié/non publié
- **Créer** (`/admin/livres/nouveau`) : formulaire `BookForm.tsx`
- **Modifier** (`/admin/livres/[id]`) : même formulaire pré-rempli
- **Supprimer** : bouton dans `BookActions.tsx`
- L'upload de la couverture et du PDF se fait directement depuis le formulaire

### `/admin/auteurs` — Gestion des auteurs
- CRUD complet avec `AuthorForm.tsx`
- Upload de la photo de profil directement depuis le formulaire

### `/admin/revue` — Gestion des numéros de revue
- Créer / modifier / supprimer des numéros mensuels
- Upload du PDF du numéro directement depuis le formulaire

### `/admin/commandes` — Validation des commandes
- Affiche toutes les commandes Mobile Money en attente (`PENDING`)
- L'admin valide ou rejette chaque commande manuellement
- À la validation : statut passe à `COMPLETED`, l'utilisateur obtient l'accès au livre

### `/admin/utilisateurs` — Utilisateurs
- Liste de tous les comptes
- Possibilité de changer le rôle d'un utilisateur (`CUSTOMER` ↔ `ADMIN`) via `RoleToggle.tsx`

### `/admin/parametres` — Prix des abonnements
- 4 champs pour modifier les prix des plans (1 mois, 3 mois, 6 mois, 12 mois)
- Sauvegarde dans la table `settings` via `/api/admin/settings`
- Le changement est **immédiat** sur la page `/revue` publique

### `/admin/newsletter` — Newsletter
- Affiche le nombre d'abonnés
- Bouton pour exporter tous les emails en fichier CSV

### `/admin/evenements` — Événements
- CRUD complet pour les événements littéraires

---

## 7. API Routes

Toutes les APIs sont dans `app/api/`. Elles retournent du JSON.

### Auth
| Route | Méthode | Description |
|---|---|---|
| `/api/auth/register` | POST | Créer un compte (hash mot de passe, save en DB) |
| `/api/auth/[...nextauth]` | GET/POST | Géré automatiquement par NextAuth |
| `/api/auth/forgot-password` | POST | Génère un token, envoie email de reset |
| `/api/auth/reset-password` | POST | Vérifie le token, change le mot de passe |

### Admin — Livres
| Route | Méthode | Description |
|---|---|---|
| `/api/admin/books` | GET | Liste tous les livres |
| `/api/admin/books` | POST | Crée un livre |
| `/api/admin/books/[id]` | PUT | Modifie un livre |
| `/api/admin/books/[id]` | DELETE | Supprime un livre |
| `/api/admin/books/[id]/cover` | POST | Upload binaire de la couverture |
| `/api/admin/books/[id]/pdf` | POST | Upload binaire du PDF |

### Admin — Auteurs
| Route | Méthode | Description |
|---|---|---|
| `/api/admin/authors` | GET/POST | Liste / Créer |
| `/api/admin/authors/[id]` | PUT/DELETE | Modifier / Supprimer |
| `/api/admin/authors/[id]/photo` | POST | Upload binaire de la photo |

### Admin — Revue
| Route | Méthode | Description |
|---|---|---|
| `/api/admin/revue` | GET/POST | Liste / Créer un numéro |
| `/api/admin/revue/[id]` | PUT/DELETE | Modifier / Supprimer |
| `/api/admin/revue/[id]/pdf` | POST | Upload binaire du PDF du numéro |

### Admin — Autres
| Route | Méthode | Description |
|---|---|---|
| `/api/admin/orders` | GET | Liste des commandes |
| `/api/admin/orders/[id]` | PUT | Valider ou rejeter une commande |
| `/api/admin/settings` | GET/POST | Lire / modifier les paramètres |
| `/api/admin/users/[id]` | PUT | Changer le rôle d'un utilisateur |
| `/api/admin/newsletter/export` | GET | Exporter les emails en CSV |

### Checkout — Paiements
| Route | Méthode | Description |
|---|---|---|
| `/api/checkout/paypal/create-order` | POST | Crée une commande PayPal (livre) |
| `/api/checkout/paypal/capture-order` | POST | Capture le paiement, enregistre en DB |
| `/api/checkout/paypal/create-subscription` | POST | Crée un abonnement PayPal (revue) |
| `/api/checkout/paypal/capture-subscription` | POST | Capture l'abonnement, enregistre en DB |
| `/api/checkout/mobile-money` | POST | Crée une commande Mobile Money (PENDING) |

### Public
| Route | Méthode | Description |
|---|---|---|
| `/api/download/[bookSlug]` | GET | Sert le PDF si l'utilisateur a acheté le livre |
| `/api/revue/access` | GET | Retourne les numéros accessibles selon l'abonnement |
| `/api/revue/pdf/[id]` | GET | Sert le PDF d'un numéro de revue aux abonnés |
| `/api/purchases` | GET | Liste les achats de l'utilisateur connecté |
| `/api/settings` | GET | Retourne les prix des abonnements (public) |
| `/api/contact` | POST | Envoie l'email de contact via Resend |
| `/api/newsletter` | POST | Inscrit un email à la newsletter |
| `/api/user/profile` | PUT | Modifie le profil de l'utilisateur connecté |
| `/api/user/avatar` | POST | Upload de l'avatar utilisateur |

---

## 8. Flux de paiement

### Achat d'un livre via PayPal

```
Utilisateur clique "Payer"
        ↓
PayPalButtons → createOrder → POST /api/checkout/paypal/create-order
        ↓ retourne orderId PayPal
Utilisateur confirme sur l'interface PayPal
        ↓
onApprove → POST /api/checkout/paypal/capture-order
        ↓
PayPal confirme le paiement
        ↓
Prisma crée un Purchase (status: COMPLETED, reference: FK-XXXX)
        ↓
Redirection vers /bibliotheque
```

### Achat via Mobile Money

```
Utilisateur remplit le formulaire (opérateur + numéro)
        ↓
POST /api/checkout/mobile-money
        ↓
Prisma crée un Purchase (status: PENDING, reference: FK-XXXX)
        ↓
Email de confirmation envoyé à l'utilisateur
        ↓
L'utilisateur envoie l'argent manuellement au numéro FK
        ↓
L'admin voit la commande dans /admin/commandes
        ↓
L'admin clique "Valider" → PUT /api/admin/orders/[id]
        ↓
Status passe à COMPLETED → l'utilisateur peut télécharger
```

### Abonnement à la revue via PayPal

```
Utilisateur choisit un plan → POST /api/checkout/paypal/create-subscription
        ↓ retourne subscriptionId PayPal
Utilisateur confirme sur PayPal
        ↓
POST /api/checkout/paypal/capture-subscription
        ↓
Prisma crée une Subscription (status: COMPLETED, endDate calculée selon le plan)
        ↓
Redirection vers /revue avec les numéros débloqués
```

### Référence de paiement (FK-XXXX)
Chaque paiement reçoit un numéro unique automatique.  
Format : `FK-` + numéro à 4 chiffres (ex: `FK-0001`, `FK-0042`).  
Généré en comptant le nombre total d'achats en base + 1.

---

## 9. Upload de fichiers

### Pourquoi pas FormData ?
Next.js limite la taille des FormData à 4-10 MB par défaut. Pour des PDFs de livres (parfois 50+ MB), on utilise un **upload binaire direct** :

```
fetch('/api/admin/books/[id]/pdf', {
  method: 'POST',
  headers: { 'Content-Type': 'application/pdf' },
  body: fichier,   ← le File object directement
})
```

Côté API, le fichier est lu avec `req.arrayBuffer()` puis écrit sur le disque avec `writeFile`.

### Où sont stockés les fichiers ?

| Type de fichier | Dossier | Accessible directement ? |
|---|---|---|
| Couvertures de livres | `public/uploads/books/` | ✅ Oui (images publiques) |
| Photos d'auteurs | `public/uploads/authors/` | ✅ Oui (images publiques) |
| PDFs de livres | `private/pdfs/` | ❌ Non — servi via API |
| PDFs de revues | `private/pdfs/revue/` | ❌ Non — servi via API |

Les PDFs dans `private/` ne sont **jamais** accessibles par URL directe. Ils passent obligatoirement par `/api/download/[bookSlug]` ou `/api/revue/pdf/[id]`, qui vérifient que l'utilisateur a acheté le livre ou a un abonnement actif.

---

## 10. Composants réutilisables

| Composant | Rôle |
|---|---|
| `Navbar.tsx` | Barre de navigation principale avec liens |
| `NavbarAuth.tsx` | Partie droite de la navbar (connexion/profil) — client |
| `Footer.tsx` | Pied de page |
| `BookCard.tsx` | Carte d'un livre (image, titre, prix, bouton) |
| `AuthorCard.tsx` | Carte d'un auteur |
| `EventCard.tsx` | Carte d'un événement |
| `SectionTitle.tsx` | Titre de section avec ligne décorative |
| `CheckoutSection.tsx` | Section de paiement (tabs PayPal / Mobile Money) |
| `MobileMoneyForm.tsx` | Formulaire Mobile Money (extrait de CheckoutSection) |
| `PasswordStrength.tsx` | Indicateur de force du mot de passe + critères visuels |
| `Providers.tsx` | Wrapper NextAuth SessionProvider pour l'app entière |

---

## 11. Librairies utilitaires

### `lib/prisma.ts`
Instance unique de PrismaClient partagée dans toute l'application.  
Le pattern singleton évite de créer trop de connexions en développement.

### `lib/auth.ts`
Configuration NextAuth : provider Credentials, callbacks JWT/session, hashage bcrypt.  
Le rôle de l'utilisateur est injecté dans le token JWT à chaque connexion.

### `lib/email.ts`
Fonctions d'envoi d'email via Resend :
- `sendPasswordResetEmail` : email avec lien de réinitialisation (expire en 1h)
- `sendOrderConfirmation` : confirmation d'une commande Mobile Money
- `sendContactEmail` : transfert du message de contact à l'adresse FK

### `lib/paypal.ts`
Fonctions pour communiquer avec l'API PayPal :
- `getAccessToken()` : récupère un token OAuth2 auprès de PayPal
- `createOrder()` : crée une commande de paiement
- `captureOrder()` : confirme et encaisse le paiement

### `lib/rateLimit.ts`
Limiteur de requêtes basé sur l'IP pour protéger les APIs sensibles (inscription, mot de passe oublié) contre les abus.

---

## 12. Variables d'environnement

Fichier `.env` à la racine (ne jamais le committer sur Git).

```env
# Base de données
DATABASE_URL="mysql://user:password@host:3306/fkeditions"

# NextAuth
NEXTAUTH_SECRET="une-chaine-secrete-aleatoire-longue"
NEXTAUTH_URL="https://votre-domaine.com"

# PayPal
PAYPAL_CLIENT_ID="..."
PAYPAL_CLIENT_SECRET="..."
NEXT_PUBLIC_PAYPAL_CLIENT_ID="..."   ← utilisé côté navigateur

# Resend (emails)
RESEND_API_KEY="re_..."
RESEND_FROM="FK Éditions <noreply@votre-domaine.com>"
CONTACT_EMAIL="contact@votre-domaine.com"
```

---

## 13. Commandes utiles

```bash
# Démarrer en développement
npm run dev

# Générer le client Prisma après modification du schéma
npx prisma generate

# Appliquer les migrations (si Prisma Migrate est configuré)
npx prisma migrate dev

# Peupler la base avec les données initiales
npm run seed

# Ouvrir l'interface graphique de la base de données
npx prisma studio

# Build de production
npm run build

# Démarrer en production
npm start
```

---

*Document rédigé pour FK Éditions — Fortune Khonde, Kinshasa.*
