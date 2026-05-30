import { exec } from 'child_process'
import { promisify } from 'util'
import { rename, unlink } from 'fs/promises'
import { existsSync } from 'fs'

const execAsync = promisify(exec)

export async function normalizePdf(filePath: string): Promise<void> {
  const tmpPath = filePath + '.normalized.pdf'

  try {
    await execAsync(
      `gs -dBATCH -dNOPAUSE -dQUIET -dSAFER ` +
      `-sDEVICE=pdfwrite -dCompatibilityLevel=1.4 ` +
      `-dEmbedAllFonts=true -dSubsetFonts=true ` +
      `-sOutputFile="${tmpPath}" "${filePath}"`
    )

    // Remplace l'original par le fichier normalisé
    await rename(tmpPath, filePath)
  } catch {
    // Si Ghostscript échoue, on garde le fichier original
    if (existsSync(tmpPath)) await unlink(tmpPath).catch(() => {})
  }
}
