/** Electron exposes the `-webkit-app-region` CSS property for draggable window
 *  regions (frameless title bars). React's CSSProperties type doesn't include
 *  it, so we augment it here. */
import 'react'

declare module 'react' {
  interface CSSProperties {
    WebkitAppRegion?: 'drag' | 'no-drag'
  }
}
