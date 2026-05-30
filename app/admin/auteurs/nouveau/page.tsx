import AuthorForm from '../AuthorForm'

export default function NouvelAuteurPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-cream">Nouvel auteur</h1>
        <p className="text-xs text-cream-muted mt-1">Remplissez le profil de l&apos;auteur</p>
      </div>
      <AuthorForm />
    </div>
  )
}
