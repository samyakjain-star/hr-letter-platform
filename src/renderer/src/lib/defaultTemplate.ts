/** Default MTAP Appraisal Letter HTML — pre-loaded as the seed template.
 *  This is the FULL 3-page document (cover letter, Annexure 1 salary table,
 *  bonus & statutory note). Variables follow {{KEY}} syntax.
 *
 *  The markup is self-contained: a scoped <style> block (all selectors prefixed
 *  `appr-`) defines the A4 page sheets, salary table and footer so the same HTML
 *  renders identically in the document canvas, the template-editor preview and
 *  the generated PDF. */

import { MTAP_LOGO_DATA_URI } from './logoAsset'

const MTAP_LOGO = `<img src="${MTAP_LOGO_DATA_URI}" alt="MTAP Technologies" style="width:185px;height:auto;display:block;" />`

const FOOTER = `
  <div class="appr-footer">
    <div class="appr-bar"><span style="background:#f9a924;flex:41.7"></span><span style="background:#56b949;flex:29"></span><span style="background:#4266a4;flex:21.5"></span><span style="background:#eb2127;flex:7.6"></span></div>
    <div class="appr-finfo">
      <div class="appr-fcompany">MTAP Technologies Private Limited</div>
      <div class="appr-faddr">Ground Floor, Ambit IT Park, Ambattur Industrial Estate, Ambattur, Chennai – 600058, Tamil Nadu.</div>
      <div class="appr-fcin">CIN: U72900TN2013PTC089299; Phone: +91-80-71190000, +91-80-46808888; Website: www.mtap.in</div>
    </div>
  </div>`

const STYLES = `
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
    .appr-conf { text-align:center; margin-bottom: 26px; }
    .appr-emp { margin-bottom: 22px; }
    .appr-emp p { font-weight: 700; }
    .appr-salutation { margin-bottom: 16px; }
    .appr-para { text-align: justify; margin-bottom: 18px; }
    .appr-closing { margin-top: 28px; }
    .appr-sig-spacer { height: 54px; }
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

/** Bump when the stock template markup changes so existing assigned documents
 *  get auto-upgraded (see migrations in people.store / templates.store). */
export const APPRAISAL_TPL_REV = '5'

export const DEFAULT_APPRAISAL_HTML = `
<div class="appr-doc" data-tpl-rev="${APPRAISAL_TPL_REV}">
${STYLES}

  <!-- ───────────────────────── PAGE 1 — Cover Letter ───────────────────────── -->
  <div class="appr-page">
    <div class="appr-logo">${MTAP_LOGO}</div>
    <div class="appr-body">
      <div class="appr-ref">
        <p>Ref: PA/{{REF_NUMBER}}</p>
        <p>Date: {{DATE}}</p>
      </div>
      <p class="appr-conf">Private and Confidential</p>
      <div class="appr-emp">
        <p>Name: {{EMPLOYEE_NAME}}</p>
        <p>Employee ID: {{EMPLOYEE_ID}}</p>
      </div>
      <p class="appr-salutation">Dear {{EMPLOYEE_NAME}},</p>
      <p class="appr-para">
        Congratulations! We are happy to announce that your performance during the period under review was
        <strong>{{PERFORMANCE_RATING}}</strong>. We acknowledge your efforts to the growth of the Company and your
        compensation is being revised to&nbsp;<strong>{{NEW_CTC_FORMATTED}}/-</strong>&nbsp;per annum effective&nbsp;<strong>{{EFFECTIVE_DATE}}</strong>.
        Please find attached your revised salary details in Annexure 1.
      </p>
      <p class="appr-para">All other terms and conditions of your employment remain unaltered.</p>
      <p class="appr-para">
        Kindly note that the content of this letter is highly confidential, and we expect you to maintain the same
        with highest confidence.
      </p>
      <div class="appr-closing">
        <p>Wishing you all the best!</p>
        <div style="margin-top:14px;">
          <p><strong>For MTAP Technologies Pvt Ltd</strong></p>
          <div class="appr-sig-spacer"></div>
          <p><strong>Srinivas Chitturi</strong></p>
          <p>CEO</p>
        </div>
      </div>
    </div>
    ${FOOTER}
  </div>

  <!-- ───────────────────────── PAGE 2 — Annexure 1 ───────────────────────── -->
  <div class="appr-page">
    <div class="appr-logo">${MTAP_LOGO}</div>
    <div class="appr-body">
      <p class="appr-annex-title">Annexure 1: Compensation Details (Salary &amp; applicable benefits)</p>
      <div class="appr-emp">
        <p>Name: {{EMPLOYEE_NAME}}</p>
        <p>Employee ID: {{EMPLOYEE_ID}}</p>
      </div>
      <table class="appr-table">
        <tr class="b"><td colspan="3">Division: {{DIVISION}}</td></tr>
        <tr class="b"><td colspan="2">Designation: {{DESIGNATION}}</td><td class="num" style="text-align:left;">Grade: {{GRADE}}</td></tr>
        <tr class="b"><td>Salary Heads</td><td class="num">Monthly</td><td class="num">Annual</td></tr>

        <tr class="b"><td colspan="3">Fixed Pay</td></tr>
        <tr><td>Basic Pay</td><td class="num">{{BASIC_MONTHLY}}</td><td class="num">{{BASIC_ANNUAL}}</td></tr>
        <tr><td>HRA</td><td class="num">{{HRA_MONTHLY}}</td><td class="num">{{HRA_ANNUAL}}</td></tr>
        <tr><td>Special Allowance</td><td class="num">{{SPECIAL_ALLOWANCE_MONTHLY}}</td><td class="num">{{SPECIAL_ALLOWANCE_ANNUAL}}</td></tr>
        <tr><td>LTA</td><td class="num">{{LTA_MONTHLY}}</td><td class="num">{{LTA_ANNUAL}}</td></tr>

        <tr class="blank"><td></td><td></td><td></td></tr>
        <tr class="b"><td colspan="3">Other Reimbursements</td></tr>
        <tr><td>Vehicle Reimbursements</td><td class="num">{{VEHICLE_MONTHLY}}</td><td class="num">{{VEHICLE_ANNUAL}}</td></tr>
        <tr><td>Driver's Salary</td><td class="num">{{DRIVER_MONTHLY}}</td><td class="num">{{DRIVER_ANNUAL}}</td></tr>
        <tr><td>Telephone Reimbursement</td><td class="num">{{TELEPHONE_MONTHLY}}</td><td class="num">{{TELEPHONE_ANNUAL}}</td></tr>
        <tr><td>Food Coupon / Allowance</td><td class="num">{{FOOD_MONTHLY}}</td><td class="num">{{FOOD_ANNUAL}}</td></tr>
        <tr class="b"><td>Fixed CTC</td><td class="num">{{FIXED_CTC_MONTHLY}}</td><td class="num">{{FIXED_CTC_ANNUAL}}</td></tr>

        <tr class="blank"><td></td><td></td><td></td></tr>
        <tr class="b"><td colspan="3">Retiral Benefits</td></tr>
        <tr><td>Provident Fund</td><td class="num">{{PF_MONTHLY}}</td><td class="num">{{PF_ANNUAL}}</td></tr>
        <tr class="b"><td>Sub-Total</td><td class="num">{{SUBTOTAL_MONTHLY}}</td><td class="num">{{SUBTOTAL_ANNUAL}}</td></tr>

        <tr class="blank"><td></td><td></td><td></td></tr>
        <tr class="b"><td>Total Fixed CTC</td><td class="num">{{TOTAL_FIXED_CTC_MONTHLY}}</td><td class="num">{{TOTAL_FIXED_CTC_ANNUAL}}</td></tr>

        <tr class="blank"><td></td><td></td><td></td></tr>
        <tr class="b"><td>Net Monthly Credit before Tax</td><td class="num">{{NET_MONTHLY_CREDIT_MONTHLY}}</td><td class="num">{{NET_MONTHLY_CREDIT_ANNUAL}}</td></tr>

        <tr class="blank"><td></td><td></td><td></td></tr>
        <tr class="b"><td colspan="3">Bonus</td></tr>
        <tr><td>Performance Bonus</td><td class="num"></td><td class="num">{{PERFORMANCE_BONUS_ANNUAL}}</td></tr>
        <tr class="b"><td>Total Bonus</td><td class="num"></td><td class="num">{{TOTAL_BONUS_ANNUAL}}</td></tr>
      </table>
    </div>
    ${FOOTER}
  </div>

  <!-- ───────────────────────── PAGE 3 — Bonus & Notes ───────────────────────── -->
  <div class="appr-page">
    <div class="appr-logo">${MTAP_LOGO}</div>
    <div class="appr-body">
      <p class="appr-para">
        <strong>Performance Bonus:</strong> You will be eligible for Annual Performance Bonus which is linked to Company and
        individual performance. The bonus is paid on an annual basis and is payable at the end of the financial year.
        To be eligible for the payment of the bonus, you should be an active employee of the company on the date
        of payout and should not be servicing notice during such time.
      </p>
      <p><strong><em>Note:</em></strong></p>
      <ul class="appr-note">
        <li>Other Statutory Deductions as applicable from time to time</li>
        <li>Income Tax and Professional Tax applicable as per norm</li>
      </ul>
    </div>
    ${FOOTER}
  </div>

</div>
`
