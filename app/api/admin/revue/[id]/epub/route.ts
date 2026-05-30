import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import JSZip from 'jszip'
import { isS3Configured, uploadPrivateToS3, uploadToS3, privateKey } from '@/lib/s3'

async function extractCoverFromEpub(buffer: Buffer): Promise<{ data: Buffer; ext: string } | null> {
  try {
    const zip = await JSZip.loadAsync(buffer)

    const containerXml = await zip.file('META-INF/container.xml')?.async('string')
    if (!containerXml) return null

    const rootfilePath = containerXml.match(/full-path="([^"]+)"/)?.[1]
    if (!rootfilePath) return null

    const opfContent = await zip.file(rootfilePath)?.async('string')
    if (!opfContent) return null

    const baseDir = rootfilePath.includes('/')
      ? rootfilePath.substring(0, rootfilePath.lastIndexOf('/') + 1)
      : ''

    // Find cover image id from metadata
    const coverMetaId = opfContent.match(/<meta\b[^>]*\bname="cover"[^>]*\bcontent="([^"]+)"/)?.[1]
      ?? opfContent.match(/<meta\b[^>]*\bcontent="([^"]+)"[^>]*\bname="cover"/)?.[1]

    // Find cover image href from manifest
    let coverHref: string | null = null

    if (coverMetaId) {
      // Find by id reference
      for (const m of opfContent.matchAll(/<item\b([^>]*)\/?\>/g)) {
        const attrs = m[1]
        const idMatch = attrs.match(/\bid="([^"]+)"/)
        const hrefMatch = attrs.match(/\bhref="([^"]+)"/)
        if (idMatch?.[1] === coverMetaId && hrefMatch) {
          coverHref = hrefMatch[1]
          break
        }
      }
    }

    if (!coverHref) {
      // Find by properties="cover-image"
      for (const m of opfContent.matchAll(/<item\b([^>]*)\/?\>/g)) {
        const attrs = m[1]
        if (/\bproperties="[^"]*cover-image/.test(attrs)) {
          coverHref = attrs.match(/\bhref="([^"]+)"/)?.[1] ?? null
          break
        }
      }
    }

    if (!coverHref) return null

    const coverPath = baseDir + coverHref
    const coverFile = zip.file(coverPath)
    if (!coverFile) return null

    const data = Buffer.from(await coverFile.async('arraybuffer'))
    const ext = coverHref.split('.').pop()?.toLowerCase() ?? 'jpg'
    return { data, ext }
  } catch {
    return null
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

  const filename = `revue-${id}-${Date.now()}.epub`

  if (isS3Configured()) {
    // Fichier payant : stocké en privé sur S3.
    await uploadPrivateToS3(privateKey('revues', filename), buffer, 'application/epub+zip')
  } else {
    const dir = path.join(process.cwd(), 'private', 'revues')
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, filename), buffer)
  }

  // Extract and save cover image automatically (image publique)
  let coverImage: string | undefined
  const cover = await extractCoverFromEpub(buffer)
  if (cover) {
    const ct = cover.ext === 'png' ? 'image/png' : cover.ext === 'webp' ? 'image/webp' : 'image/jpeg'
    if (isS3Configured()) {
      coverImage = await uploadToS3(`revues/covers/revue-${id}-cover.${cover.ext}`, cover.data, ct)
    } else {
      const coverDir = path.join(process.cwd(), 'public', 'images', 'revues')
      await mkdir(coverDir, { recursive: true })
      const coverFilename = `revue-${id}-cover.${cover.ext}`
      await writeFile(path.join(coverDir, coverFilename), cover.data)
      coverImage = `/images/revues/${coverFilename}`
    }
  }

  await prisma.revueIssue.update({
    where: { id },
    data: { epubFile: filename, ...(coverImage ? { coverImage } : {}) },
  })

  return NextResponse.json({ success: true, filename, coverImage })
}
