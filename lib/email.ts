import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

const brand = `
  <div style="text-align:center;margin-bottom:32px;">
    <span style="color:#c9a84c;font-size:24px;font-weight:bold;letter-spacing:2px;">FK</span>
    <span style="color:#f5f0e8;font-size:14px;letter-spacing:6px;margin-left:6px;">ÉDITIONS</span>
  </div>
`
const footer = `
  <hr style="border:none;border-top:1px solid #2a2a2a;margin:24px 0;" />
  <p style="color:#5a5a5a;font-size:11px;text-align:center;">
    © ${new Date().getFullYear()} FK Éditions — Kinshasa, RDC
  </p>
`
const wrap = (content: string) =>
  `<div style="background:#0d0d0d;color:#f5f0e8;font-family:Georgia,serif;padding:40px;max-width:600px;margin:0 auto;">${brand}${content}${footer}</div>`

const isResendReady = () =>
  !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_...'

export async function sendNewsletterConfirmation(email: string) {
  if (!isResendReady()) return
  await resend.emails.send({
    from: 'FK Éditions <newsletter@fk-editions.com>',
    to: email,
    subject: 'Bienvenue dans la famille FK Éditions !',
    html: wrap(`
      <h1 style="font-size:22px;color:#f5f0e8;margin-bottom:16px;">Bienvenue dans notre communauté !</h1>
      <p style="color:#a89880;font-size:14px;line-height:1.8;margin-bottom:20px;">
        Merci de vous être inscrit à la newsletter de FK Éditions.
        Vous recevrez en avant-première nos nouveautés, événements et contenus exclusifs.
      </p>
      <div style="text-align:center;margin-bottom:32px;">
        <a href="${process.env.NEXTAUTH_URL}/livres"
           style="background:#c9a84c;color:#0d0d0d;padding:12px 32px;text-decoration:none;font-size:12px;letter-spacing:3px;text-transform:uppercase;font-weight:bold;">
          Découvrir nos livres
        </a>
      </div>
    `),
  })
}

export async function sendPurchaseConfirmation(email: string, bookTitle: string, amount: number) {
  if (!isResendReady()) return
  await resend.emails.send({
    from: 'FK Éditions <commandes@fk-editions.com>',
    to: email,
    subject: `Bienvenue chez FK Éditions — ${bookTitle}`,
    html: wrap(`
      <h1 style="font-size:22px;color:#c9a84c;margin-bottom:8px;">Bienvenue chez FK ÉDITIONS !</h1>
      <p style="color:#a89880;font-size:14px;line-height:1.8;margin-bottom:24px;">
        Merci pour votre confiance. Votre achat est bien validé.<br/>
        Notre priorité est de vous offrir des lectures inspirantes et un service irréprochable.
      </p>
      <div style="background:#1a1a1a;border:1px solid #2a2a2a;padding:20px;margin-bottom:24px;">
        <p style="color:#c9a84c;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">Votre commande</p>
        <p style="color:#f5f0e8;font-size:16px;margin-bottom:4px;">${bookTitle}</p>
        <p style="color:#a89880;font-size:14px;">${amount} $ USD — Ebook (PDF)</p>
      </div>
      <p style="color:#a89880;font-size:14px;line-height:1.8;margin-bottom:24px;">
        Votre accès est maintenant actif. Connectez-vous à votre compte pour télécharger votre ebook.
      </p>
      <div style="text-align:center;margin-bottom:28px;">
        <a href="${process.env.NEXTAUTH_URL}/bibliotheque"
           style="background:#c9a84c;color:#0d0d0d;padding:12px 32px;text-decoration:none;font-size:12px;letter-spacing:3px;text-transform:uppercase;font-weight:bold;">
          Accéder à ma bibliothèque
        </a>
      </div>
      <div style="background:#1a1a1a;border:1px solid #c9a84c40;padding:16px;text-align:center;">
        <p style="color:#a89880;font-size:13px;margin:0;">
          Êtes-vous entièrement satisfait de votre expérience sur notre site ?<br/>
          <a href="mailto:editionsfk@gmail.com" style="color:#c9a84c;text-decoration:none;">Écrivez-nous</a> — votre avis compte beaucoup pour nous.
        </p>
      </div>
    `),
  })
}

export async function sendSubscriptionConfirmation(email: string, planLabel: string, amount: number, endDate: Date) {
  if (!isResendReady()) return
  const formattedEnd = endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  await resend.emails.send({
    from: 'FK Éditions <commandes@fk-editions.com>',
    to: email,
    subject: `Bienvenue chez FK Éditions — Abonnement ${planLabel}`,
    html: wrap(`
      <h1 style="font-size:22px;color:#c9a84c;margin-bottom:8px;">Bienvenue chez FK ÉDITIONS !</h1>
      <p style="color:#a89880;font-size:14px;line-height:1.8;margin-bottom:24px;">
        Merci pour votre confiance. Votre abonnement est bien validé.<br/>
        Notre priorité est de vous offrir des lectures inspirantes et un service irréprochable.
      </p>
      <div style="background:#1a1a1a;border:1px solid #c9a84c40;padding:20px;margin-bottom:24px;">
        <p style="color:#c9a84c;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">Votre abonnement</p>
        <p style="color:#f5f0e8;font-size:16px;margin-bottom:4px;">FLYSYS — Formule ${planLabel}</p>
        <p style="color:#a89880;font-size:14px;margin-bottom:4px;">${amount} $ USD</p>
        <p style="color:#c9a84c;font-size:13px;">Accès jusqu'au ${formattedEnd}</p>
      </div>
      <p style="color:#a89880;font-size:14px;line-height:1.8;margin-bottom:24px;">
        Tous les numéros publiés sont disponibles immédiatement dans votre espace abonné.
      </p>
      <div style="text-align:center;margin-bottom:28px;">
        <a href="${process.env.NEXTAUTH_URL}/flysys"
           style="background:#c9a84c;color:#0d0d0d;padding:12px 32px;text-decoration:none;font-size:12px;letter-spacing:3px;text-transform:uppercase;font-weight:bold;">
          Accéder à mes numéros
        </a>
      </div>
      <div style="background:#1a1a1a;border:1px solid #c9a84c40;padding:16px;text-align:center;">
        <p style="color:#a89880;font-size:13px;margin:0;">
          Êtes-vous entièrement satisfait de votre expérience sur notre site ?<br/>
          <a href="mailto:editionsfk@gmail.com" style="color:#c9a84c;text-decoration:none;">Écrivez-nous</a> — votre avis compte beaucoup pour nous.
        </p>
      </div>
    `),
  })
}

export async function sendPreOrderConfirmation(email: string, bookTitle: string, amount: number, releaseDate: string) {
  if (!isResendReady()) return
  const formattedDate = new Date(releaseDate).toLocaleDateString('fr-FR', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' })
  await resend.emails.send({
    from: 'FK Éditions <commandes@fk-editions.com>',
    to: email,
    subject: `Pré-commande confirmée — ${bookTitle}`,
    html: wrap(`
      <h1 style="font-size:22px;color:#f5f0e8;margin-bottom:16px;">Pré-commande confirmée !</h1>
      <div style="background:#1a1a1a;border:1px solid #c9a84c40;padding:20px;margin-bottom:24px;">
        <p style="color:#c9a84c;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">Votre pré-commande</p>
        <p style="color:#f5f0e8;font-size:16px;margin-bottom:4px;">${bookTitle}</p>
        <p style="color:#a89880;font-size:14px;margin-bottom:8px;">${amount} $ USD — Ebook (PDF)</p>
        <p style="color:#c9a84c;font-size:13px;font-weight:bold;">📅 Disponible le ${formattedDate}</p>
      </div>
      <p style="color:#a89880;font-size:14px;line-height:1.8;margin-bottom:24px;">
        Merci pour votre pré-commande ! Votre paiement a bien été reçu.
        Le <strong style="color:#f5f0e8;">${formattedDate}</strong>, votre livre sera automatiquement
        disponible dans votre bibliothèque. Vous recevrez un email de notification ce jour-là.
      </p>
      <div style="text-align:center;margin-bottom:32px;">
        <a href="${process.env.NEXTAUTH_URL}/bibliotheque"
           style="background:#c9a84c;color:#0d0d0d;padding:12px 32px;text-decoration:none;font-size:12px;letter-spacing:3px;text-transform:uppercase;font-weight:bold;">
          Voir ma bibliothèque
        </a>
      </div>
    `),
  })
}

export async function sendWelcomeEmail(email: string, name?: string) {
  if (!isResendReady()) return
  await resend.emails.send({
    from: 'FK Éditions <noreply@fk-editions.com>',
    to: email,
    subject: 'Bienvenue chez FK Éditions !',
    html: wrap(`
      <h1 style="font-size:22px;color:#c9a84c;margin-bottom:8px;">Bienvenue chez FK ÉDITIONS !</h1>
      <p style="color:#a89880;font-size:14px;line-height:1.8;margin-bottom:24px;">
        ${name ? `Bonjour ${name},<br/><br/>` : ''}
        Votre compte a bien été créé. Nous sommes ravis de vous accueillir dans la famille FK Éditions —
        la maison d'édition dédiée à la littérature africaine et aux voix d'exception.
      </p>
      <div style="background:#1a1a1a;border:1px solid #c9a84c40;padding:20px;margin-bottom:24px;">
        <p style="color:#c9a84c;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">Ce que vous pouvez faire</p>
        <p style="color:#a89880;font-size:13px;line-height:2;margin:0;">
          📚 Acheter et lire nos ebooks<br/>
          📰 S'abonner à FLYSYS<br/>
          🔖 Retrouver vos livres dans votre bibliothèque<br/>
          🎉 Découvrir nos nouveautés en avant-première
        </p>
      </div>
      <div style="text-align:center;margin-bottom:28px;">
        <a href="${process.env.NEXTAUTH_URL}/livres"
           style="background:#c9a84c;color:#0d0d0d;padding:12px 32px;text-decoration:none;font-size:12px;letter-spacing:3px;text-transform:uppercase;font-weight:bold;">
          Découvrir nos livres
        </a>
      </div>
      <p style="color:#5a5a5a;font-size:12px;text-align:center;">
        Une question ? Écrivez-nous à <a href="mailto:editionsfk@gmail.com" style="color:#c9a84c;">editionsfk@gmail.com</a>
      </p>
    `),
  })
}

export async function sendPasswordReset(email: string, token: string) {
  if (!isResendReady()) return
  const link = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
  await resend.emails.send({
    from: 'FK Éditions <noreply@fk-editions.com>',
    to: email,
    subject: 'Réinitialisation de votre mot de passe',
    html: wrap(`
      <h1 style="font-size:22px;color:#f5f0e8;margin-bottom:16px;">Réinitialiser votre mot de passe</h1>
      <p style="color:#a89880;font-size:14px;line-height:1.8;margin-bottom:24px;">
        Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous.
        Ce lien est valable pendant <strong style="color:#f5f0e8;">1 heure</strong>.
      </p>
      <div style="text-align:center;margin-bottom:24px;">
        <a href="${link}"
           style="background:#c9a84c;color:#0d0d0d;padding:12px 32px;text-decoration:none;font-size:12px;letter-spacing:3px;text-transform:uppercase;font-weight:bold;">
          Réinitialiser mon mot de passe
        </a>
      </div>
      <p style="color:#5a5a5a;font-size:12px;text-align:center;">
        Si vous n'avez pas demandé cela, ignorez cet email.
      </p>
    `),
  })
}

export async function sendContactEmail(name: string, email: string, subject: string, message: string) {
  if (!isResendReady()) return
  await resend.emails.send({
    from: 'FK Éditions <contact@fk-editions.com>',
    to: 'editionsfk@gmail.com',
    replyTo: email,
    subject: `[Contact] ${subject}`,
    html: wrap(`
      <h1 style="font-size:20px;color:#f5f0e8;margin-bottom:16px;">Nouveau message de contact</h1>
      <div style="background:#1a1a1a;border:1px solid #2a2a2a;padding:20px;margin-bottom:24px;">
        <p style="color:#c9a84c;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">Expéditeur</p>
        <p style="color:#f5f0e8;font-size:14px;margin-bottom:4px;">${name}</p>
        <p style="color:#a89880;font-size:13px;margin-bottom:4px;">${email}</p>
        <p style="color:#a89880;font-size:13px;">Sujet : ${subject}</p>
      </div>
      <div style="background:#1a1a1a;border:1px solid #2a2a2a;padding:20px;">
        <p style="color:#c9a84c;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">Message</p>
        <p style="color:#a89880;font-size:14px;line-height:1.8;white-space:pre-wrap;">${message}</p>
      </div>
    `),
  })
}
