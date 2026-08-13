import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'

const region = process.env.AWS_REGION
const bucket = process.env.S3_BUCKET
const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

/** Indique si S3 est configuré (toutes les variables d'env présentes). */
export function isS3Configured(): boolean {
  return Boolean(region && bucket && accessKeyId && secretAccessKey)
}

let _client: S3Client | null = null
function client(): S3Client {
  if (!_client) {
    _client = new S3Client({
      region,
      credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
    })
  }
  return _client
}

/** URL publique d'un objet stocké dans le bucket. */
export function s3PublicUrl(key: string): string {
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`
}

/**
 * Envoie un fichier vers S3 et renvoie son URL publique.
 * @param key   chemin/nom de l'objet dans le bucket (ex: "authors/abc123.jpg")
 * @param body  contenu du fichier
 * @param contentType  type MIME (ex: "image/jpeg")
 */
export async function uploadToS3(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<string> {
  if (!isS3Configured()) {
    throw new Error('S3 non configuré : vérifiez AWS_REGION, S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY.')
  }
  await client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  )
  return s3PublicUrl(key)
}

/** Construit une clé S3 privée à partir d'un sous-dossier et d'un nom de fichier. */
export function privateKey(subdir: string, filename: string): string {
  return `private/${subdir}/${filename}`
}

/**
 * Envoie un fichier PRIVÉ vers S3 (non lisible publiquement grâce à la bucket policy
 * qui n'autorise l'accès public que sur les préfixes d'images). Renvoie la clé.
 */
export async function uploadPrivateToS3(key: string, body: Buffer, contentType: string): Promise<string> {
  if (!isS3Configured()) {
    throw new Error('S3 non configuré : vérifiez AWS_REGION, S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY.')
  }
  await client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: 'private, no-cache',
    }),
  )
  return key
}

/**
 * Récupère un objet S3. Renvoie null si la clé n'existe pas (404).
 * Supporte l'en-tête Range (lecture/seek audio) : passez range = "bytes=START-END".
 */
export async function getObjectFromS3(key: string, range?: string) {
  if (!isS3Configured()) return null
  try {
    const res = await client().send(new GetObjectCommand({ Bucket: bucket, Key: key, Range: range }))
    const bytes = await res.Body!.transformToByteArray()
    // Copie dans un Buffer "non partagé" (ArrayBuffer dédié) accepté par Response/NextResponse.
    const buffer = Buffer.alloc(bytes.byteLength)
    buffer.set(bytes)
    return {
      buffer,
      contentLength: res.ContentLength ?? bytes.length,
      contentRange: res.ContentRange,
      contentType: res.ContentType,
    }
  } catch (err: unknown) {
    const e = err as { name?: string; Code?: string; $metadata?: { httpStatusCode?: number } }
    const code = e?.name ?? e?.Code
    const status = e?.$metadata?.httpStatusCode
    // Fichier absent de S3 → on renvoie null pour basculer sur le disque (rétro-compat).
    // S3 répond "AccessDenied" (403) au lieu de "NoSuchKey" (404) quand l'IAM n'a pas
    // la permission s3:ListBucket : on traite donc aussi 403 comme "non trouvé".
    if (
      code === 'NoSuchKey' || code === 'NotFound' || code === 'AccessDenied' ||
      status === 404 || status === 403
    ) {
      return null
    }
    throw err
  }
}

/**
 * Récupère un objet S3 sous forme de FLUX web (sans charger le fichier entier
 * en RAM). Indispensable pour servir de gros fichiers sur un petit serveur.
 * Renvoie null si la clé n'existe pas (404/403) pour basculer sur le disque.
 */
export async function getObjectStreamFromS3(key: string) {
  if (!isS3Configured()) return null
  try {
    const res = await client().send(new GetObjectCommand({ Bucket: bucket, Key: key }))
    return {
      stream: res.Body!.transformToWebStream(),
      contentLength: res.ContentLength,
      contentType: res.ContentType,
    }
  } catch (err: unknown) {
    const e = err as { name?: string; Code?: string; $metadata?: { httpStatusCode?: number } }
    const code = e?.name ?? e?.Code
    const status = e?.$metadata?.httpStatusCode
    if (
      code === 'NoSuchKey' || code === 'NotFound' || code === 'AccessDenied' ||
      status === 404 || status === 403
    ) {
      return null
    }
    throw err
  }
}

/** Supprime un objet du bucket (sans planter si la clé n'existe pas). */
export async function deleteFromS3(key: string): Promise<void> {
  if (!isS3Configured()) return
  try {
    await client().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
  } catch {
    // best-effort : on ignore les erreurs de suppression
  }
}
