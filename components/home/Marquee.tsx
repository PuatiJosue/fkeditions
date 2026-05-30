const items = [
  'Littérature',
  'Récit',
  'Essai',
  'Témoignage',
  'Poésie',
  'Histoire',
  'Jeunesse',
  'Spiritualité',
]

export default function Marquee() {
  const renderGroup = () => (
    <span>
      {items.map((item, i) => (
        <span key={i}>
          {item}&nbsp;<em className="star">✦</em>&nbsp;
        </span>
      ))}
    </span>
  )

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {renderGroup()}
        {renderGroup()}
      </div>
    </div>
  )
}
