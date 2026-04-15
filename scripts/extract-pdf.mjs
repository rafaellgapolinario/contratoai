// Script standalone pra extrair texto de PDF (roda fora do Next.js bundle)
import { PDFParse } from 'pdf-parse'
import { readFileSync, writeFileSync } from 'fs'

const inputPath = process.argv[2]
const outputPath = process.argv[3]

if (!inputPath || !outputPath) {
  console.error('Usage: node extract-pdf.mjs <input.pdf> <output.txt>')
  process.exit(1)
}

try {
  const buf = readFileSync(inputPath)
  const parser = new PDFParse(new Uint8Array(buf))
  await parser.load()
  const data = await parser.getText()
  writeFileSync(outputPath, data?.text || '')
  console.log(`OK:${(data?.text || '').length}`)
} catch (e) {
  console.error(`ERR:${e.message}`)
  process.exit(1)
}
