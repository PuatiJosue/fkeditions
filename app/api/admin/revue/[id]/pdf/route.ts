import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir, readFile, unlink } from 'fs/promises'
import path from 'path'
import { normalizePdf } from '@/lib/normalizePdf'
import { isS3Configured, uploadPrivateToS3, privateKey, getObjectFromS3 } from '@/lib/s3'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const { id } = await params
  const issue = await prisma.revueIssue.findUnique({ where: { id } })
  if (!issue?.pdfFile) {
    return NextResponse.json({ error: 'Aucun PDF' }, { status: 404 })
  }

  const safeName = path.basename(issue.pdfFile)
  const downloadName = `${issue.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`

  // Production : on récupère depuis S3 ; sinon (ou si absent de S3) on lit le disque.
  const s3 = await getObjectFromS3(privateKey('revues', safeName))
  if (s3) {
    return new Response(s3.buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${downloadName}"`,
        'Content-Length': s3.contentLength.toString(),
      },
    })
  }

  const filePath = path.join(process.cwd(), 'private', 'revues', safeName)
  try {
    const file = await readFile(filePath)
    return new Response(file, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${downloadName}"`,
        'Content-Length': file.length.toString(),
      },
    })
  } catch {
    return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const { id } = await params
  const buffer = Buffer.from(await req.arrayBuffer())

  if (buffer.length === 0) {
    return NextResponse.json({ error: 'Fichier vide' }, { status: 400 })
  }

  const filename = `revue-${id}-${Date.now()}.pdf`
  const dir = path.join(process.cwd(), 'private', 'revues')
  await mkdir(dir, { recursive: true })
  const fullPath = path.join(dir, filename)
  await writeFile(fullPath, buffer)
  await normalizePdf(fullPath)

  if (isS3Configured()) {
    const normalized = await readFile(fullPath)
    await uploadPrivateToS3(privateKey('revues', filename), normalized, 'application/pdf')
    await unlink(fullPath).catch(() => {})
  }

  await prisma.revueIssue.update({
    where: { id },
    data: { pdfFile: filename },
  })

  return NextResponse.json({ success: true, filename })
}
