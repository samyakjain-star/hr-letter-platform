import { describe, it, expect } from 'vitest'
import { sanitizeFilename } from '../../src/renderer/src/lib/variableResolver'

/** The exported PDF filename is built from user/template data, so it must not
 *  let that data escape the chosen folder via path separators or traversal. */
describe('PDF filename sanitization (path-traversal safe)', () => {
  it('strips path separators', () => {
    expect(sanitizeFilename('a/b\\c')).not.toMatch(/[/\\]/)
  })

  it('neutralizes parent-directory traversal', () => {
    const out = sanitizeFilename('../../etc/passwd')
    expect(out).not.toContain('..')
    expect(out).not.toMatch(/[/\\]/)
  })

  it('removes OS-reserved characters', () => {
    expect(sanitizeFilename('na:me*?"<>|.pdf')).not.toMatch(/[:*?"<>|]/)
  })

  it('leaves a normal name intact', () => {
    expect(sanitizeFilename('Samyak Jain_Appraisal Letter_2026-06-24')).toBe(
      'Samyak Jain_Appraisal Letter_2026-06-24'
    )
  })
})
