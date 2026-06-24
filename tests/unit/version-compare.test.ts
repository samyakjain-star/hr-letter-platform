import { describe, it, expect } from 'vitest'
import { isNewer } from '../../src/main/ipc/updater.ipc'

/** The update check must never claim an update when there isn't one (which
 *  would push users to re-download), and must catch real upgrades. */
describe('Update version comparison', () => {
  it('detects a genuinely newer version', () => {
    expect(isNewer('1.0.1', '1.0.0')).toBe(true)
    expect(isNewer('1.1.0', '1.0.9')).toBe(true)
    expect(isNewer('2.0.0', '1.9.9')).toBe(true)
  })

  it('does not flag same or older versions', () => {
    expect(isNewer('1.0.0', '1.0.0')).toBe(false)
    expect(isNewer('1.0.0', '1.0.1')).toBe(false)
    expect(isNewer('1.0.9', '1.1.0')).toBe(false)
  })

  it('handles differing segment counts safely', () => {
    expect(isNewer('1.0.0.1', '1.0.0')).toBe(true)
    expect(isNewer('1.0', '1.0.0')).toBe(false)
  })
})
