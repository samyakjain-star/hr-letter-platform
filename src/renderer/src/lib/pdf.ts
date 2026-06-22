/** PDF export via Chromium's native print engine (Electron printToPDF in the
 *  main process). The document is rendered exactly as it appears on screen —
 *  correct vertical centering, fonts, colours and page breaks — which a canvas
 *  rasteriser (html2canvas) cannot reliably reproduce. */

/** Clone the live document, turn field <input>s into plain text, and wrap it in
 *  a standalone HTML page with print rules (A4, no margin, one sheet per page). */
function buildPrintHtml(container: HTMLElement): string {
  const clone = container.cloneNode(true) as HTMLElement

  // Field inputs → their text values so they print as normal flowing text.
  clone.querySelectorAll<HTMLInputElement>('input.doc-field-input').forEach(input => {
    const span = document.createElement('span')
    span.textContent = input.value || ''
    input.replaceWith(span)
  })

  // Drop editor-only helpers that shouldn't print.
  clone.querySelector('#field-measure')?.remove()
  clone.querySelector('#field-styles')?.remove()

  const body = clone.innerHTML // includes .appr-doc and its scoped <style>

  return `<!doctype html><html><head><meta charset="utf-8">
<style>
  @page { size: A4; margin: 0; }
  html, body { margin: 0; padding: 0; background: #fff; }
  .appr-page { box-shadow: none !important; margin: 0 !important; page-break-after: always; }
  .appr-page:last-child { page-break-after: auto; }
</style>
</head><body>${body}</body></html>`
}

function base64ToBlob(base64: string, type: string): Blob {
  const bytes = atob(base64)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  return new Blob([arr], { type })
}

export async function generatePdf(element: HTMLElement, filename: string): Promise<void> {
  const html = buildPrintHtml(element)
  const base64 = await window.electronAPI.printToPDF(html)
  const url = URL.createObjectURL(base64ToBlob(base64, 'application/pdf'))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function generatePdfBase64(element: HTMLElement): Promise<string> {
  const html = buildPrintHtml(element)
  return window.electronAPI.printToPDF(html)
}
