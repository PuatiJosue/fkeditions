import EventForm from '../EventForm'

export default function NouvelEvenementPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-cream">Nouvel événement</h1>
        <p className="text-xs text-cream-muted mt-1">Créez un événement à venir</p>
      </div>
      <EventForm />
    </div>
  )
}
