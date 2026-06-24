/** Shared MTAP letter chrome — the logo, footer and scoped stylesheet that
 *  every stock template reuses so all letters render with an identical brand
 *  frame (A4 sheets, header logo, coloured footer bar) in the canvas, the
 *  template-editor preview and the generated PDF.
 *
 *  Bump STOCK_TPL_REV whenever this chrome or any stock template body changes,
 *  so existing installs refresh their seeded copies (see templates.store). */

import { MTAP_LOGO_DATA_URI } from './logoAsset'

/** Revision marker stamped on every stock template's root .appr-doc element. */
export const STOCK_TPL_REV = '6'

export const MTAP_LOGO = `<img src="${MTAP_LOGO_DATA_URI}" alt="MTAP Technologies" style="width:185px;height:auto;display:block;" />`

export const FOOTER = `
  <div class="appr-footer">
    <div class="appr-bar"><span style="background:#f9a924;flex:41.7"></span><span style="background:#56b949;flex:29"></span><span style="background:#4266a4;flex:21.5"></span><span style="background:#eb2127;flex:7.6"></span></div>
    <div class="appr-finfo">
      <div class="appr-fcompany">MTAP Technologies Private Limited</div>
      <div class="appr-faddr">Ground Floor, Ambit IT Park, Ambattur Industrial Estate, Ambattur, Chennai – 600058, Tamil Nadu.</div>
      <div class="appr-fcin">CIN: U72900TN2013PTC089299; Phone: +91-80-71190000, +91-80-46808888; Website: www.mtap.in</div>
    </div>
  </div>`

export const STYLES = `
  <style>
    .appr-doc, .appr-doc * { box-sizing: border-box; }
    .appr-doc { font-family: Calibri, 'Segoe UI', Arial, sans-serif; color:#111; }
    .appr-page {
      width: 210mm; min-height: 297mm; background:#fff; margin:0 auto;
      padding: 16mm 22mm 0; display:flex; flex-direction:column;
      box-shadow: 0 4px 24px rgba(0,0,0,0.18);
    }
    .appr-page + .appr-page { margin-top: 22px; }
    .appr-printing .appr-page { box-shadow:none; }
    .appr-printing .appr-page + .appr-page { margin-top: 0; }
    .appr-logo { margin-bottom: 18px; }
    .appr-body { font-size: 10.5pt; line-height: 1.55; flex: 1; }
    .appr-body p { font-size: 10.5pt; }
    .appr-ref { margin-bottom: 22px; }
    .appr-ref p { margin: 0 0 2px; }
    .appr-conf { text-align:center; margin-bottom: 26px; }
    .appr-emp { margin-bottom: 22px; }
    .appr-emp p { font-weight: 700; margin: 0 0 2px; }
    .appr-salutation { margin-bottom: 16px; }
    .appr-para { text-align: justify; margin-bottom: 18px; }
    .appr-closing { margin-top: 28px; }
    .appr-sig-spacer { height: 54px; }

    /* Generic letter helpers reused across stock templates */
    .appr-title { text-align:center; font-weight:700; text-transform:uppercase; letter-spacing:1px; font-size:12.5pt; margin: 6px 0 24px; }
    .appr-addr { line-height:1.5; margin-bottom: 18px; }
    .appr-addr p { margin: 0; }
    .appr-terms-title { font-weight:700; margin: 18px 0 10px; }
    .appr-list { margin: 0 0 16px; padding-left: 22px; }
    .appr-list > li { margin-bottom: 11px; text-align: justify; }
    .appr-list .appr-list-title { font-weight:700; }
    .appr-bullets { margin: 6px 0 14px; padding-left: 22px; list-style: disc; }
    .appr-bullets li { margin-bottom: 5px; }
    .appr-sign-block { margin-top: 26px; }
    .appr-sign-line { margin: 14px 0 4px; }

    /* Salary / compensation tables (shared with the appraisal annexure) */
    .appr-annex-title { text-align:center; font-weight:700; margin-bottom:10px; }
    .appr-table { width:100%; border-collapse:collapse; font-size:9.5pt; }
    .appr-table td { border:1px solid #000; padding:3.5px 7px; vertical-align:middle; }
    .appr-table .num { text-align:center; width:90px; }
    .appr-table .b td, .appr-table td.b { font-weight:700; }
    .appr-table .blank td { height:7px; padding:0; }
    .appr-note { margin-left:28px; font-style:italic; margin-top:6px; }
    .appr-note li { margin-bottom:3px; }

    .appr-footer { margin-top:auto; }
    .appr-bar { display:flex; height:10px; margin-top:18px; }
    .appr-bar span { flex:1; }
    .appr-finfo { text-align:center; padding:9px 0 13px; }
    .appr-fcompany { font-size:13.5pt; font-weight:700; letter-spacing:.2px; margin-bottom:3px; }
    .appr-faddr { font-size:8pt; color:#222; margin-bottom:2px; }
    .appr-fcin { font-size:8pt; color:#1565c0; }
  </style>`

/** One A4 sheet: header logo, the supplied body HTML, then the brand footer. */
export function page(bodyHtml: string): string {
  return `
  <div class="appr-page">
    <div class="appr-logo">${MTAP_LOGO}</div>
    <div class="appr-body">
${bodyHtml}
    </div>
    ${FOOTER}
  </div>`
}

/** Wrap one or more page() sheets into a complete, rev-stamped document. */
export function wrapDoc(pagesHtml: string): string {
  return `
<div class="appr-doc" data-tpl-rev="${STOCK_TPL_REV}">
${STYLES}
${pagesHtml}
</div>
`
}
