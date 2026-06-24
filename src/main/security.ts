/** Security helpers, kept dependency-free so they can be unit-tested directly. */

/** Only https URLs may ever be handed to the OS shell (shell.openExternal) or
 *  opened in a new window. Blocks file://, custom protocol handlers, javascript:
 *  and other schemes that an injected link could abuse. */
export function isSafeExternalUrl(url: string): boolean {
  return typeof url === 'string' && /^https:\/\//i.test(url.trim())
}
