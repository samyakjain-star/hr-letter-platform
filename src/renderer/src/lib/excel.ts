import * as XLSX from 'xlsx'

export type ExcelRow = Record<string, string>

export function detectEmailColumn(headers: string[]): string | null {
  for (const h of headers) {
    if (/^email$/i.test(h.trim())) return h
  }
  for (const h of headers) {
    if (h.toLowerCase().includes('email') || h.toLowerCase().includes('mail')) return h
  }
  return null
}

export function parseExcel(file: File): Promise<{ headers: string[]; rows: ExcelRow[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const buf = event.target?.result as ArrayBuffer
        if (!buf) { reject(new Error('Failed to read file')); return }

        const wb = XLSX.read(buf, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        if (!ws) { resolve({ headers: [], rows: [] }); return }

        const raw = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '' })
        if (raw.length === 0) { resolve({ headers: [], rows: [] }); return }

        const rawHeaders = raw[0] as string[]
        const headers = rawHeaders.map(h =>
          String(h ?? '').trim().replace(/\s+/g, '_')
        )

        const rows: ExcelRow[] = []
        for (let i = 1; i < raw.length; i++) {
          const rawRow = raw[i] as string[]
          if (!rawRow.some(c => String(c ?? '').trim())) continue
          const row: ExcelRow = {}
          headers.forEach((h, j) => { if (h) row[h] = String(rawRow[j] ?? '').trim() })
          rows.push(row)
        }
        resolve({ headers, rows })
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Failed to parse Excel file'))
      }
    }
    reader.onerror = () => reject(new Error('FileReader error'))
    reader.readAsArrayBuffer(file)
  })
}
