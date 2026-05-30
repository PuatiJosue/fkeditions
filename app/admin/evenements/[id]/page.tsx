import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import EventForm from '../EventForm'

interface Props { params: Promise<{ id: string }> }

export default async function EditEvenementPage({ params }: Props) {
  const { id } = await params
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) notFound()

  const dateLocal = new Date(event.date.getTime() - event.date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-cream">Modifier l&apos;événement</h1>
        <p className="text-xs text-cream-muted mt-1">{event.title}</p>
      </div>
      <EventForm
        initial={{
          id: event.id,
          title: event.title,
          description: event.description ?? '',
          date: dateLocal,
          location: event.location ?? '',
          imageUrl: event.imageUrl ?? '',
          published: event.published,
        }}
      />
    </div>
  )
}
