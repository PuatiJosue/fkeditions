import Link from 'next/link'
import { Section, P, BulletList, accentLink } from './_components/legal'

export const metadata = { title: 'Conditions Générales de Vente — FK Éditions' }

export default function CGVPage() {
  return (
    <>
      <section className="fk-section" style={{ paddingTop: 'clamp(60px, 8vh, 100px)', paddingBottom: 'clamp(32px, 4vh, 48px)' }}>
        <div className="fk-container" style={{ maxWidth: 880 }}>
          <span className="kicker">Légal</span>
          <h1 className="section-title" style={{ marginTop: 16 }}>
            Conditions générales de <em className="serif-i">vente</em>
          </h1>
          <p style={{ marginTop: 16, fontSize: 13, color: 'var(--ink-mute)' }}>
            Dernière mise à jour : mai 2026
          </p>
        </div>
      </section>

      <section className="fk-section" style={{ paddingTop: 0 }}>
        <div className="fk-container" style={{ maxWidth: 880 }}>
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 48, display: 'flex', flexDirection: 'column', gap: 48 }}>
            <Section id="1" title="Vendeur">
              <P>
                FK Éditions est une maison d&apos;édition indépendante fondée par{' '}
                <strong style={{ color: 'var(--ink)' }}>Fortune Khonde</strong>, basée à{' '}
                <strong style={{ color: 'var(--ink)' }}>
                  Gombe, Avenue du 24 Novembre, Kinshasa, République Démocratique du Congo
                </strong>
                .
              </P>
              <ul style={{ marginTop: 16, paddingLeft: 24, borderLeft: '2px solid var(--accent-soft)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>Email : <a href="mailto:editionsfk@gmail.com" style={accentLink}>editionsfk@gmail.com</a></li>
                <li>Téléphone : <a href="tel:+243829082048" style={accentLink}>+243 829 082 048</a></li>
                <li>Site web : <Link href="/" style={accentLink}>fk-editions.com</Link></li>
              </ul>
            </Section>

            <Section id="2" title="Produits proposés">
              <P>FK Éditions propose les produits et services suivants :</P>
              <BulletList
                items={[
                  ['Livres numériques (ebooks)', 'fichiers PDF téléchargeables après achat'],
                  ['Livres physiques', 'expédiés à Kinshasa et environs'],
                  ['Abonnements FLYSYS', "accès à l'exclusivité des contenus en ligne pendant 1 mois (formules Standard, Premium ou FLYSYS X)"],
                ]}
              />
            </Section>

            <Section id="3" title="Commande et paiement">
              <P>
                Toute commande est soumise à la création d&apos;un compte sur le site et à la validation
                du paiement. Deux méthodes de paiement sont acceptées :
              </P>
              <BulletList
                items={[
                  ['PayPal', 'paiement sécurisé en ligne, accès immédiat après confirmation'],
                  ['Mobile Money (M-Pesa, Airtel Money, Orange Money)', "disponible à Kinshasa. L'accès est activé sous 24h après validation manuelle par FK Éditions."],
                ]}
              />
              <P style={{ marginTop: 16 }}>
                Chaque commande reçoit une référence unique au format{' '}
                <span style={{ color: 'var(--accent)', fontWeight: 600, fontFamily: 'var(--mono)' }}>FK-XXXX</span>
                . Conservez cette référence pour tout suivi de commande.
              </P>
            </Section>

            <Section id="4" title="Livraison des produits numériques">
              <P>
                Les ebooks et numéros de revue sont disponibles immédiatement après confirmation du
                paiement (PayPal) ou sous 24h (Mobile Money). Ils sont accessibles depuis votre
                espace personnel <Link href="/bibliotheque" style={accentLink}>Ma bibliothèque</Link>.
              </P>
              <P style={{ marginTop: 12 }}>
                En cas de pré-commande, le fichier sera disponible à la date de sortie annoncée sur
                la page du livre.
              </P>
            </Section>

            <Section id="5" title="Politique de remboursement">
              <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--line)', padding: 20, borderLeft: '3px solid var(--accent)' }}>
                <p style={{ fontSize: 15, color: 'var(--ink)', fontWeight: 500, lineHeight: 1.6 }}>
                  Les ventes de produits numériques (ebooks, abonnements revue) sont définitives et
                  ne donnent pas droit à un remboursement.
                </p>
                <p style={{ marginTop: 10, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                  En validant votre achat, vous acceptez que la livraison du contenu numérique
                  commence immédiatement et renoncez à tout droit de rétractation applicable aux
                  produits dématérialisés.
                </p>
              </div>
              <P style={{ marginTop: 16 }}>
                Exception : en cas d&apos;erreur technique avérée (fichier illisible, accès non
                accordé après paiement confirmé), contactez-nous à{' '}
                <a href="mailto:editionsfk@gmail.com" style={accentLink}>editionsfk@gmail.com</a>{' '}
                dans les 48h. Chaque cas sera traité individuellement.
              </P>
            </Section>

            <Section id="6" title="Propriété intellectuelle">
              <P>
                Tous les contenus vendus sur FK Éditions (textes, images, fichiers PDF) sont
                protégés par le droit d&apos;auteur. L&apos;achat d&apos;un livre numérique accorde
                une licence personnelle non-exclusive et non-transférable. Toute reproduction,
                redistribution ou revente est strictement interdite.
              </P>
            </Section>

            <Section id="7" title="Données personnelles">
              <P>
                FK Éditions collecte uniquement les données nécessaires au traitement des commandes
                (nom, email, téléphone pour Mobile Money). Ces données ne sont jamais vendues ni
                partagées avec des tiers à des fins commerciales. Pour toute demande de suppression
                de compte ou de données, écrivez à{' '}
                <a href="mailto:editionsfk@gmail.com" style={accentLink}>editionsfk@gmail.com</a>.
              </P>
            </Section>

            <Section id="8" title="Contact et litiges">
              <P>
                Pour toute réclamation ou question relative à une commande, contactez-nous en
                priorité par email à{' '}
                <a href="mailto:editionsfk@gmail.com" style={accentLink}>editionsfk@gmail.com</a>{' '}
                ou par téléphone au{' '}
                <a href="tel:+243829082048" style={accentLink}>+243 829 082 048</a>
                . Nous nous engageons à répondre dans un délai de 48 heures ouvrables.
              </P>
            </Section>
          </div>

          <div style={{ marginTop: 56, paddingTop: 28, borderTop: '1px solid var(--line)' }}>
            <Link href="/" className="link-arrow" style={{ display: 'inline-flex' }}>
              ← Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
