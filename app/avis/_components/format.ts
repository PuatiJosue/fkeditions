/** Initiales (2 lettres) d'un nom, ou « FK » par défaut. */
export function initials(name: string | null): string {
  if (!name) return 'FK'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
}

/** Formatage relatif d'une date ISO (« il y a 3 h », sinon date complète). */
export function timeAgo(iso: string): string {
  const d = new Date(iso)
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return "à l'instant"
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`
  if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} j`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}
