import Link from 'next/link'

export default function Topbar({ message }: { message?: string }) {
  return (
    <div className="topbar">
      <div className="fk-container">
        <span className="topbar-tagline">
          {message || "Maison d'édition indépendante — depuis 2020 à Kinshasa"}
        </span>
        <div className="topbar-links">
          <Link href="#newsletter">✉ Newsletter</Link>
          <span className="sep"></span>
          <Link href="/contact">Contact</Link>
          <span className="sep"></span>
          <Link href="/contact#manuscrit">Soumettre un manuscrit</Link>
        </div>
      </div>
    </div>
  )
}
