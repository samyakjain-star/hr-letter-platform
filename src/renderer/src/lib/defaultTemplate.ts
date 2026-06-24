/** Default MTAP Appraisal Letter HTML — the FULL 3-page document (cover letter,
 *  Annexure 1 salary table, bonus & statutory note). Variables follow {{KEY}}.
 *
 *  Brand chrome (logo, footer, scoped styles, page/wrap helpers) is shared via
 *  templateShared so every stock letter renders with an identical frame. */

import { page, wrapDoc, STOCK_TPL_REV } from './templateShared'

/** Kept in sync with the shared rev so assigned appraisal docs auto-upgrade
 *  (see migrations in people.store / templates.store). */
export const APPRAISAL_TPL_REV = STOCK_TPL_REV

const PAGE_1 = page(`
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
      </div>`)

const PAGE_2 = page(`
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
      </table>`)

const PAGE_3 = page(`
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
      </ul>`)

export const DEFAULT_APPRAISAL_HTML = wrapDoc(`${PAGE_1}\n${PAGE_2}\n${PAGE_3}`)
