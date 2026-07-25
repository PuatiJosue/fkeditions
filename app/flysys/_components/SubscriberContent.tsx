import SectionTitle from '@/components/ui/SectionTitle'
import { MONTHS_FR } from '@/lib/constants'
import type { RevueIssue } from '../_data'

export type RevueAccess = {
  hasAccess: boolean
  subscription: { plan: string; endDate: string } | null
  issues: RevueIssue[]
}

/** Section « Mes contenus disponibles » affichée aux abonnés actifs. */
export default function SubscriberContent({ access }: { access: RevueAccess }) {
  return (
    <div className="mt-20">
      <div className="mb-8 text-center">
        <SectionTitle label="Mon abonnement" center />
        <h2 className="font-serif text-2xl text-cream mt-3">Mes contenus disponibles</h2>
        {access.subscription && access.subscription.plan !== 'admin' && access.subscription.endDate && (
          <p className="text-xs text-cream-muted mt-2">
            Abonnement actif jusqu&apos;au <span className="text-gold">{new Date(access.subscription.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </p>
        )}
      </div>
      {access.issues.length === 0 ? (
        <div className="text-center py-12 bg-dark-3 border border-dark-4">
          <p className="text-cream-muted text-sm">Aucun numéro disponible pour le moment. Revenez bientôt !</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {access.issues.map((issue) => (
            <div key={issue.id} className="bg-dark-3 border border-dark-4 overflow-hidden flex flex-col">
              <div className="bg-gold px-5 py-4">
                <p className="text-xs text-dark/70 uppercase tracking-widest font-semibold">{MONTHS_FR[issue.month]} {issue.year}</p>
                <h3 className="font-serif text-base text-dark font-bold leading-snug mt-0.5">{issue.title}</h3>
              </div>
              <div className="p-5 flex flex-col flex-1 gap-4">
                {issue.description && <p className="text-xs text-cream-muted leading-relaxed line-clamp-3">{issue.description}</p>}
                <div className="mt-auto">
                  {issue.pdfFile || issue.epubFile ? (
                    <a href={`/flysys/${issue.id}/lire`} className="block w-full text-center bg-gold hover:bg-gold-light text-dark font-semibold py-2.5 text-xs uppercase tracking-widest transition-colors">Consulter</a>
                  ) : (
                    <div className="block w-full text-center border border-dark-4 text-cream-muted py-2.5 text-xs uppercase tracking-widest">Bientôt disponible</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
