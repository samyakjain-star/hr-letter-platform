/** Stock MTAP letter templates seeded into the app. Each is built from the
 *  shared brand chrome (templateShared) so every letter renders with the same
 *  A4 frame, logo and footer as the appraisal letter.
 *
 *  Per-employee values use {{VARIABLE}} syntax. {{EMPLOYEE_NAME}},
 *  {{EMPLOYEE_ID}}, {{DATE}}, {{DESIGNATION}}, {{DIVISION}}, {{GRADE}}, {{EMAIL}}
 *  auto-fill from the person record; salary rows reuse the calculator's
 *  {{*_MONTHLY}}/{{*_ANNUAL}} names so the Salary Calculator fills them too. */

import type { Template } from '../types'
import { page, wrapDoc } from './templateShared'
import { extractVariables } from './variableResolver'
import { DEFAULT_APPRAISAL_HTML } from './defaultTemplate'

const SAVED_AT = new Date().toISOString().split('T')[0]

function tpl(id: string, name: string, subject: string, html: string): Template {
  return {
    id,
    name,
    currentVersion: 1,
    versions: [{ version: 1, savedAt: SAVED_AT, subject, html, variables: extractVariables(html) }]
  }
}

/* ── Relieving Letter ──────────────────────────────────────────────────── */
const RELIEVING_HTML = wrapDoc(page(`
      <p class="appr-ref">{{DATE}}</p>
      <p class="appr-ref">Ref: {{REF_NUMBER}}</p>
      <p class="appr-title">TO WHOMSOEVER IT MAY CONCERN</p>
      <p class="appr-para">This is to certify that <strong>{{EMPLOYEE_NAME}}</strong> Employee ID: {{EMPLOYEE_ID}} was employed in our organization from {{EMPLOYMENT_START}} to {{EMPLOYMENT_END}}. Pursuant to {{PRONOUN_HIS_HER}} request, {{PRONOUN_HE_SHE}} was relieved of {{PRONOUN_HIS_HER}} duties with effect from the closing hours on {{RELIEVING_DATE}}. At the time of relieving {{PRONOUN_HIS_HER}} designation was {{DESIGNATION}}.</p>
      <p class="appr-closing">Yours Sincerely,</p>
      <div class="appr-sign-block">
        <p class="appr-sign-line">For MTAP Technologies Private Limited</p>
        <div class="appr-sig-spacer"></div>
        <p class="appr-sign-line"><strong>Srinivas Chitturi</strong></p>
        <p class="appr-sign-line">CEO</p>
      </div>`))

/* ── PIP Closure Letter ────────────────────────────────────────────────── */
const PIP_HTML = wrapDoc(page(`
      <p class="appr-title">PIP Closure Letter</p>
      <p class="appr-emp"><strong>To:</strong> {{EMPLOYEE_NAME}} ({{EMPLOYEE_ID}})</p>
      <p class="appr-emp"><strong>From:</strong> HR</p>
      <p class="appr-emp"><strong>Date:</strong> {{DATE}}</p>
      <p class="appr-para"><strong>Performance Improvement Plan (PIP) Successful Completion</strong></p>
      <p class="appr-para">This letter confirms that you have successfully met the terms of your Performance Improvement Plan dated {{PIP_DATE}}.</p>
      <p class="appr-para">MTAP expects you to maintain an acceptable level of performance at all times. A decrease in Performance, after successfully completing the improvement plan, may result in taking disciplinary Action up to and including termination. A copy of this document will be placed in your personnel file.</p>
      <p class="appr-para">We are confident that you will be able to sustain these levels of performance and therefore meet or exceed the performance expectations for your position. We wish you all the very best as you continue to grow in MTAP.</p>
      <div class="appr-sign-block">
        <p class="appr-sign-line">Employee's Signature ______________________</p>
        <p class="appr-sign-line">Date _________________</p>
        <p class="appr-sign-line">HR Signature: ______________________</p>
        <p class="appr-sign-line">Date: {{HR_SIGN_DATE}}</p>
      </div>`))

/* ── Internship Completion Certificate ─────────────────────────────────── */
const INTERN_COMPLETION_HTML = wrapDoc(page(`
      <p class="appr-ref">{{DATE}}</p>
      <p class="appr-title">CERTIFICATE OF INTERNSHIP COMPLETION</p>
      <p class="appr-para">This is to certify that {{TITLE_MR_MS}} {{INTERN_NAME}} has successfully completed {{PRONOUN_HIS_HER}} Internship in the {{DEPARTMENT}} Department at MTAP Technologies Private Limited for the period {{INTERNSHIP_START}} – {{INTERNSHIP_END}}.</p>
      <p class="appr-para">We found {{PRONOUN_HIM_HER}} extremely inquisitive and hard working. {{PRONOUN_HE_SHE}} demonstrated a good learning attitude, adaptability, and willingness to take ownership of assigned tasks. {{PRONOUN_HIS_HER}} overall contribution and engagement with the team was satisfactory, and {{PRONOUN_HE_SHE}} has gained a strong foundational understanding of end-to-end digital marketing execution.</p>
      <p class="appr-para">During {{PRONOUN_HIS_HER}} tenure {{PRONOUN_HIS_HER}} conduct was good. We wish {{PRONOUN_HIM_HER}} all the very best for future endeavors.</p>
      <p class="appr-closing">Yours Sincerely,</p>
      <div class="appr-sign-block">
        <p>For MTAP Technologies Private Limited.</p>
        <div class="appr-sig-spacer"></div>
        <p class="appr-sign-line"><strong>Srinivas Chitturi</strong></p>
        <p>CEO</p>
      </div>`))

/* ── Internship Offer Letter ───────────────────────────────────────────── */
const INTERN_OFFER_HTML = wrapDoc([
  page(`
      <p class="appr-ref">{{DATE}}</p>
      <p class="appr-title">INTERNSHIP LETTER</p>
      <div class="appr-addr">
        <p>{{INTERN_NAME}}</p>
        <p>{{ADDRESS_LINE_1}}</p>
        <p>{{ADDRESS_LINE_2}}</p>
        <p>{{ADDRESS_LINE_3}}</p>
        <p>Contact No: {{CONTACT_NUMBER}}</p>
        <p>Email Id: {{EMAIL}}</p>
      </div>
      <p class="appr-salutation">Dear {{INTERN_NAME}},</p>
      <p class="appr-para">On behalf of MTAP Technologies, I am excited to outspread an offer to you for an internship position for our {{DEPARTMENT}} Department.</p>
      <p class="appr-terms-title">Terms and Conditions:</p>
      <ol class="appr-list">
        <li><span class="appr-list-title">Period of Consultancy:</span> {{INTERNSHIP_START}} to {{INTERNSHIP_END}}.<br>Renewal shall depend on the absolute need for continuance and satisfactory performance of your Services.</li>
        <li><span class="appr-list-title">Workdays/Hours:</span><br>Your working days will be {{WORKDAYS_PER_WEEK}} days in a week. You shall provide your services from our {{WORK_LOCATION}} office.</li>
        <li><span class="appr-list-title">Confidentiality of Information:</span><br>You shall not, at any time, disclose to anyone any information, know-how, knowledge, data, methods, plans etc., of the company. This agreement shall be effective as of the first day of your consultation with the Company.</li>
      </ol>`),
  page(`
      <p class="appr-para">We wish you a successful internship. Welcome to our team.</p>
      <p class="appr-closing">With warm regards,</p>
      <p>For MTAP Technologies Pvt Ltd.</p>
      <div class="appr-sig-spacer"></div>
      <div class="appr-sign-block">
        <p><strong>Srinivas Chitturi</strong></p>
        <p>CEO</p>
      </div>
      <p class="appr-para">Please sign the duplicate copy of this letter and return it to us as a token of your acceptance by {{ACCEPTANCE_DATE}}. I accept the Letter of Internship and have read and understood the T&amp;C</p>
      <p class="appr-para">Agreed and accepted by,</p>
      <div class="appr-sign-block">
        <p class="appr-sign-line">Consultant Name:</p>
        <p class="appr-sign-line">Signature:</p>
        <p class="appr-sign-line">Date:</p>
      </div>`)
].join('\n'))

/* ── Offer Letter ──────────────────────────────────────────────────────── */
const OFFER_HTML = wrapDoc([
  page(`
      <p class="appr-title">OFFER LETTER</p>
      <p class="appr-emp">{{EMPLOYEE_NAME}}</p>
      <p class="appr-addr">{{WORK_LOCATION}}</p>
      <p class="appr-ref">{{DATE}}</p>
      <p class="appr-salutation">Dear {{EMPLOYEE_NAME}},</p>
      <p class="appr-para">Congratulations! We are pleased to offer you the position of {{POSITION}} with MTAP Technologies.</p>
      <p class="appr-para"><strong>Compensation:</strong> Your annual compensation will be Rs.{{CTC_AMOUNT}}/- per annum [{{CTC_IN_WORDS}}]. This has been detailed in the Compensation Details annexed (Annexure 1) to this letter.</p>
      <p class="appr-para"><strong>Joining Date:</strong> Your employment with the Company shall commence on or before {{JOINING_DATE}}.</p>
      <p class="appr-para"><strong>Work Location:</strong> Your current location of employment shall be {{WORK_LOCATION}}, India. However, MTAP reserves the right to transfer/utilize your services at any time to any of its unit(s)/ department(s) or office(s), work sites, or associated or affiliated companies in India, or outside India, on the terms and conditions as applicable to you at the time of transfer.</p>
      <p class="appr-para"><strong>Verification:</strong> This Offer is subject to positive reference check and background verification.</p>
      <p class="appr-para"><strong>Acceptance:</strong> Your formal acceptance of these terms &amp; conditions should be confirmed by countersigning &amp; returning the enclosed copy of this letter</p>
      <p class="appr-para">Looking forward to having you on board!</p>
      <div class="appr-sign-block">
        <p class="appr-closing">For MTAP Technologies Private Limited</p>
        <div class="appr-sig-spacer"></div>
        <p class="appr-sign-line"><strong>Srinivas Chitturi</strong></p>
        <p class="appr-sign-line">CEO</p>
      </div>
      <p class="appr-note"><strong>Note:</strong> Detailed appointment letter will be issued on the date of joining.</p>
      <p class="appr-note"><strong>Encl:</strong> Annexure A – Compensation Details</p>`),
  page(`
      <p class="appr-annex-title">Annexure A: Compensation Details (Salary &amp; applicable benefits)</p>
      <p class="appr-emp"><strong>Name:</strong> {{EMPLOYEE_NAME}}</p>
      <p class="appr-para"><strong>a) Remuneration</strong></p>
      <p class="appr-emp">Division &amp; Subdivision: {{DIVISION}}</p>
      <p class="appr-emp">Designation: {{DESIGNATION}}</p>
      <table class="appr-table">
        <tr class="b"><td>Salary Heads</td><td class="num">Monthly</td><td class="num">Annual</td></tr>
        <tr class="b"><td colspan="3">Fixed Pay</td></tr>
        <tr><td>Basic Pay</td><td class="num">{{BASIC_MONTHLY}}</td><td class="num">{{BASIC_ANNUAL}}</td></tr>
        <tr><td>HRA</td><td class="num">{{HRA_MONTHLY}}</td><td class="num">{{HRA_ANNUAL}}</td></tr>
        <tr><td>Special Allowance</td><td class="num">{{SPECIAL_ALLOWANCE_MONTHLY}}</td><td class="num">{{SPECIAL_ALLOWANCE_ANNUAL}}</td></tr>
        <tr><td>Statutory Allowance</td><td class="num">{{STATUTORY_MONTHLY}}</td><td class="num">{{STATUTORY_ANNUAL}}</td></tr>
        <tr class="b"><td>Fixed CTC</td><td class="num">{{FIXED_CTC_MONTHLY}}</td><td class="num">{{FIXED_CTC_ANNUAL}}</td></tr>
        <tr class="blank"><td></td><td></td><td></td></tr>
        <tr class="b"><td colspan="3">Retiral Benefits</td></tr>
        <tr><td>Provident Fund</td><td class="num">{{PF_MONTHLY}}</td><td class="num">{{PF_ANNUAL}}</td></tr>
        <tr class="b"><td>Sub-Total</td><td class="num">{{SUBTOTAL_MONTHLY}}</td><td class="num">{{SUBTOTAL_ANNUAL}}</td></tr>
        <tr class="b"><td>Total CTC</td><td class="num">{{TOTAL_CTC_MONTHLY}}</td><td class="num">{{TOTAL_CTC_ANNUAL}}</td></tr>
        <tr class="b"><td>Net Monthly Credit before Tax</td><td class="num">{{NET_MONTHLY_CREDIT_MONTHLY}}</td><td class="num">{{NET_MONTHLY_CREDIT_ANNUAL}}</td></tr>
      </table>
      <p class="appr-para"><strong>b) Retirals</strong></p>
      <ul class="appr-bullets">
        <li>You will participate in the company Provident Fund Scheme as applicable to your category of employees.</li>
        <li>You will be entitled to gratuity as per the provisions of the Gratuity Act 1972.</li>
      </ul>
      <p class="appr-para"><strong>c) Applicable tax would be borne by the employee.</strong></p>
      <p class="appr-note">Note –</p>
      <ul class="appr-bullets">
        <li>It is expected that individual compensation package would not be shared with other employees.</li>
        <li>The above compensation structure is subject to change without affecting emoluments adversely.</li>
      </ul>
      <div class="appr-sign-block">
        <p class="appr-sign-line">Accepted</p>
        <div class="appr-sig-spacer"></div>
        <p class="appr-sign-line">{{EMPLOYEE_NAME}}</p>
      </div>`),
  page(`
      <p class="appr-terms-title">Its mandate to submit the below mentioned documents at the time of your joining.</p>
      <ol class="appr-list">
        <li>Three passport size photographs and two stamp size photographs</li>
        <li>Educational Certificates (photocopy for submission)
          <ul class="appr-bullets">
            <li>10th Mark Sheet</li>
            <li>12th Mark Sheet</li>
            <li>UG provisional Certificate - degree certificate or mark sheets, provisional valid only till 6 months</li>
            <li>PG provisional Certificate - degree certificate or mark sheets, provisional valid only till 6 months</li>
          </ul>
        </li>
        <li>Last three month's pay slip</li>
        <li>Relieving letter/Service certificate from the last three employers as per applicability.</li>
        <li>Identity Proof: (Kindly provide below mentioned documents)
          <ul class="appr-bullets">
            <li>Valid Indian Passport (Kindly sign the affidavit, if you do not have a passport).</li>
            <li>Pan Card*</li>
            <li>Voters Identity Card</li>
            <li>Driving License</li>
            <li>Bank Passbook with attested customer photograph</li>
            <li>Aadhaar*</li>
          </ul>
        </li>
        <li>Address Proof: (Kindly provide below mentioned documents)
          <ul class="appr-bullets">
            <li>Valid Indian Passport</li>
            <li>Aadhaar Card*</li>
            <li>Voters Identity Card</li>
            <li>Telephone bill</li>
            <li>Ration card</li>
            <li>Electricity bill</li>
          </ul>
        </li>
        <li>PF &amp; UAN Account No with the last employer as per applicability</li>
        <li>If Applicable Under ESI: One Post Card Size photo with nominee.</li>
        <li>PAN Card and Aadhaar*</li>
      </ol>
      <p class="appr-note"><strong>Note:</strong> 1. "Kindly bring the Original certificates for validation at the time of joining"</p>
      <p class="appr-note">2. * - Star mark indicate mandatory document</p>`)
].join('\n'))

/* ── Contract Letter ───────────────────────────────────────────────────── */
const CONTRACT_HTML = wrapDoc([
  page(`
      <p class="appr-title">CONTRACT LETTER</p>
      <p class="appr-ref">{{DATE}}</p>
      <p class="appr-ref">Ref: {{REF_NUMBER}}</p>
      <div class="appr-addr">
        <p>{{CONSULTANT_NAME}}</p>
        <p>{{ADDRESS_LINE_1}}</p>
        <p>{{ADDRESS_LINE_2}}</p>
        <p>{{ADDRESS_LINE_3}}</p>
        <p>{{ADDRESS_LINE_4}}</p>
        <p>Contact No: {{CONTACT_NUMBER}}</p>
        <p>Email Id: {{EMAIL}}</p>
      </div>
      <p class="appr-salutation">Dear {{CONSULTANT_NAME}},</p>
      <p class="appr-para">It has been decided to use your services as {{ROLE}} for a fixed period of six months. During this period, you will be performing your services as Customer Support Associate exclusively for MTAP Technologies Pvt. Ltd.</p>
      <p class="appr-terms-title">Terms and Conditions:</p>
      <ol class="appr-list">
        <li><span class="appr-list-title">Period of Consultancy:</span> {{CONTRACT_START}} to {{CONTRACT_END}}<br>Renewal shall depend on the absolute need for continuance and satisfactory performance of your Services.</li>
        <li><span class="appr-list-title">Fees / Rate:</span>
          <ul class="appr-bullets">
            <li>Fees will be paid on a monthly basis.</li>
            <li>The payment shall be calculated &amp; becomes payable based on the time sheet inputs produced by you.</li>
            <li>For this period, you will be paid a fixed amount of {{MONTHLY_FEE}}/month.</li>
            <li>Statutory deductions such as TDS as applicable would be made while disbursing the payment to you.</li>
          </ul>
        </li>
        <li><span class="appr-list-title">Workdays/Hours:</span> All our operations function 24x7, 365 days in a calendar year. Your working hours, number of working days in a week, weekly - off will depend upon the process requirements. You may be required to work in shifts and/or in extended working hours, as permitted by law. The company reserves the right to alter/modify its working hours.</li>
      </ol>`),
  page(`
      <ol class="appr-list" start="4">
        <li><span class="appr-list-title">Work Location:</span> Your current location of work shall be {{WORK_LOCATION}}, India. However, Company reserves the right to transfer/utilize your services at any time to any of its unit(s)/ department(s) or office(s), work sites, or associated or affiliated companies in India, or outside India, on the terms and conditions as applicable to you at the time of transfer or you may be deployed at the client site permanently.</li>
        <li><span class="appr-list-title">Notice &amp; Termination:</span> This agreement can be terminated by either party by giving {{NOTICE_PERIOD}} notice.</li>
        <li><span class="appr-list-title">Confidentiality of Information:</span> You shall not, at any time, disclose to anyone any information, know-how, knowledge, data, methods, plans etc., of the company. This agreement shall be effective as of the first day of your consultation with the Company. The Confidentiality obligation shall survive during the Term and for 2 years after the Termination of the Engagement Letter.</li>
        <li><span class="appr-list-title">Exclusivity:</span> Consultant agrees and acknowledges that during the Term of the Engagement Letter, Consultant is in contract/Agreement with the Company/MTAP and shall not render services to or for any third parties or direct or indirect competitors of the Company/MTAP in full-time/part-time work. Breach of this provision shall be considered a material breach under this Engagement Letter. In the event of a breach of this Section by the Consultant, Agreement shall automatically stand terminated with immediate effect without any further liability to the Company/MTAP.</li>
        <li><span class="appr-list-title">Ownership of Intellectual Property Rights:</span> Company shall have complete ownership on all the data, (Confidential or Intellectual Property or Proprietary), in which ever form, shared by the Company pursuant to the terms of this Engagement Letter. All deliverables and related documents shall be sole and exclusive property of the Company ("Deliverables"). Consultant has no ownership rights in or to Company information or data. The copyright in all Deliverables remains the property of Company. Consultant shall, at no additional charge or fee, assist and cooperate with Company, and execute all appropriate documents, to perfect Company's right in the Deliverables. Consultant shall acquire from its agents, such assignments, rights, and covenants, as to assure that Company shall receive all rights provided for in this Section. Under no circumstances will Consultant or agents or any third party have any claim to copyright or ownership of any intellectual property rights in any deliverable.</li>
      </ol>`),
  page(`
      <ol class="appr-list" start="9">
        <li><span class="appr-list-title">Warranties:</span> Consultant represents and warrants that it has the full capacity, power, and authority to enter into this Agreement and has all necessary licenses and permits to carry out and perform all its duties and obligations as contemplated herein, as per applicable laws. Consultant represents and warrants on the accuracy and authenticity of the deliverables and warrants that the Deliverables provided under the Agreement shall not violate or breach any third-party Intellectual Property Rights.</li>
        <li>Company shall engage any other third party or service providers for receiving similar services, during the term of the Engagement Letter.</li>
        <li><span class="appr-list-title">Indemnification:</span> Consultant shall indemnify and hold harmless Company from any and all damages or claims arising out (i) breach of applicable law by Consultant or (ii) any breach of the contractual obligations by the Consultant including but not limited to, Confidentiality, indemnity obligations or Representations and Warranties (iii) any death or damage to the property or person due to negligence or misconduct of Consultant or its agents or (iv) any Intellectual Property infringement by Consultant or agents in provision of Services under this Engagement Letter.</li>
        <li><span class="appr-list-title">Limitation of Liability:</span> To the maximum extent permitted by applicable law and except in cases of intentional material breach of Confidentiality or breach of Indemnity obligations or Intellectual property Rights or Representation or warranty, neither party nor its affiliates will be liable for any incidental, indirect, special, consequential, or punitive cost, expense, loss or damage of any kind, arising in connection with this Engagement Letter, even if advised of the possibility of such damages or losses or if such possibility was reasonably foreseeable.</li>
        <li>Any dispute between the parties shall be governed under laws of India, without regard to the conflict of laws principles and shall be under exclusive jurisdiction of courts of Chennai, Tamil Nadu, India.</li>
      </ol>
      <p class="appr-para">This period of contract is purely for a fixed period and the Consultant and the Company are independent contractors and does not confer upon you any right to claim employment with MTAP. There is no agency or partnership or joint venture or other relationship between the parties as a result of execution of this Engagement Letter.</p>
      <p class="appr-para">To give effect to this contract, you need to accept this Agreement and the T&amp;C herein and also execute our standard Proprietary Information and Inventions Engagement Letter. Your contract with us will be governed by the terms and conditions of the organization and you shall adhere to the policies and practices of the Company.</p>
      <div class="appr-closing">
        <p>With warm regards,</p>
        <p>For MTAP Technologies Pvt Ltd.</p>
        <div class="appr-sig-spacer"></div>
        <div class="appr-sign-block">
          <p><strong>Srinivas Chitturi</strong></p>
          <p>CEO</p>
        </div>
      </div>
      <p class="appr-para">Please sign the duplicate copy of this letter and return it to us as a token of your acceptance.</p>
      <p class="appr-para">I accept the Letter of Contract and have read and understood the T&amp;C</p>
      <div class="appr-sign-block">
        <p>Agreed and accepted by,</p>
        <p class="appr-sign-line">Consultant Name:</p>
        <p class="appr-sign-line">Signature:</p>
        <p class="appr-sign-line">Date:</p>
      </div>`)
].join('\n'))

/* ── Exit NDA / Declaration ────────────────────────────────────────────── */
const EXIT_NDA_HTML = wrapDoc([
  page(`
      <p class="appr-title">DECLARATION</p>
      <p class="appr-para">Declaration: -</p>
      <p class="appr-para">In line with the proprietary information and inventions agreement signed by me on {{AGREEMENT_DATE}}, I hereby agree as follows: -</p>
      <ol class="appr-list">
        <li><span class="appr-list-title">RECOGNITION OF COMPANY'S RIGHTS; NONDISCLOSURE:</span> At all times during the term of my employment and thereafter, I will hold in strictest confidence and will not disclose, use, lecture upon or publish any of the Company's Proprietary Information (defined below), unless an officer of the Company expressly authorizes such in writing. I hereby assign to the Company any rights I may have or acquire in such Proprietary Information and recognize that all Proprietary Information shall be the sole property of the Company and its assigns and the Company and its assigns shall be the sole owner of all trade secret rights, patent rights, copyrights, mask work rights and all other rights throughout the world (collectively, "Proprietary Rights") in connection therewith.
          <p class="appr-para">The term "Proprietary Information" shall mean trade secrets, confidential knowledge, data or any other proprietary information of the Company. By way of illustration but not limitation, "Proprietary Information "includes (a) trade secrets, inventions, mask works, ideas, processes, formulas, source and object codes, data, power points, excel sheets, programs, other works of authorship, know-how, improvements, discoveries, developments, designs and techniques (here in after collectively referred to as "Inventions"); and (b) information regarding plans for research, development, new products, marketing and selling, business plans, budgets and unpublished financial statements, licenses, prices and costs, suppliers and customers; and information regarding the skills and compensation of other employees of the Company, Marketing Techniques, access to client information etc.,</p>
        </li>
        <li><span class="appr-list-title">THIRD PARTY INFORMATION:</span> I understand, in addition, that the Company has received and in the future will receive from third parties confidential or proprietary information ("Third Party Information") subject to a duty on the Company's part to maintain the confidentiality of such information and to use it only for certain limited purposes. During the term of my employment and thereafter, I will hold Third Party Information in the strictest confidence and will not disclose (to anyone other than Company personnel who need to know such information in connection with their work for the Company) or use, except in connection with my work for the Company, Third Party Information unless expressly authorized by an officer of the Company in writing.</li>
        <li><span class="appr-list-title">RETURN OF COMPANY DOCUMENTS:</span> In line with the paragraph 10 of the proprietary information and inventions agreement, I confirm that I am not in possession of any drawings, notes, memoranda, specifications, devices, formulas, PPTs, excel sheets containing information and other documents, together with all copies thereof, and any other material containing or disclosing any Company Inventions, Third Party Information or Proprietary Information of the Company.
          <p class="appr-para">I further confirm that I have not transferred or caused to transfer any company related information as stated above to any disk or removable storage media and hereby provide a right to the company to enforce appropriate legal proceedings for any breach of the foregoing covenants by way of injunction, specific performance or other equitable relief, without bond and without prejudice to any other rights and remedies that the Company may have for a breach of the covenants under the Proprietary information and inventions agreement executed by me.</p>
        </li>
      </ol>`),
  page(`
      <ol class="appr-list" start="4">
        <li>Consequent to my resignation and in consideration of MTAP providing me the formal relieving letter, I declare and affirm that, for a period of not less than 12 months from the date of my relief, I shall not use the mail IDs/ addresses / contact numbers of the existing / past / clients in the pipeline of MTAP , to correspond / meet / call ,directly or through third party either to solicit business / seek work assignment / direct employment or other pecuniary benefits either for monetary gains or otherwise.</li>
      </ol>
      <p class="appr-terms-title">TO BE FILLED BY EMPLOYEE:</p>
      <p class="appr-para">Since I have resigned from the services of the company:</p>
      <ol class="appr-list">
        <li>I would like to withdraw/transfer Provident Fund Contribution amount.</li>
        <li>Regarding my Final Settlement payments:
          <ol type="a" class="appr-list">
            <li>I agree that in the event of non-submission of Investment proofs, income tax will be Deducted in the full &amp; final settlement as per Income tax rules.</li>
            <li>Please furnish your address and email id for further communication:</li>
          </ol>
        </li>
      </ol>
      <p class="appr-para">Address: _______________________________________________________________</p>
      <p class="appr-para">City: ______________________ State: ______________________ Pin Code: ______________________</p>
      <p class="appr-para">Email id: _______________________________________________________________</p>
      <p class="appr-para">I hereby confirm the above information is correct and have read the information in this form.</p>
      <div class="appr-sign-block">
        <p class="appr-emp">Emp Name: {{EMPLOYEE_NAME}}&nbsp;&nbsp;&nbsp;&nbsp;Emp id: {{EMPLOYEE_ID}}</p>
        <p class="appr-sign-line">Employee Signature: __________________________&nbsp;&nbsp;&nbsp;&nbsp;Date: __________________</p>
      </div>`),
  page(`
      <p class="appr-terms-title">For Official use only:</p>
      <table class="appr-table">
        <tr><td class="b">Particulars</td><td class="b">Please specify</td></tr>
        <tr><td>Type of Separation</td><td>Resignation / Transfer / Termination / Asked to leave / Expiry of Contract / Other</td></tr>
        <tr><td>Exit Form submitted date</td><td class="blank">&nbsp;</td></tr>
        <tr><td>Relieving letter issued date</td><td class="blank">&nbsp;</td></tr>
      </table>
      <p class="appr-terms-title">HRA Department:</p>
      <table class="appr-table">
        <tr><td>HRA Name &amp; Emp id</td><td class="blank">&nbsp;</td></tr>
        <tr><td>HRA Designation</td><td class="blank">&nbsp;</td></tr>
        <tr><td>HRA Signature</td><td class="blank">&nbsp;</td></tr>
        <tr><td>Date</td><td class="blank">&nbsp;</td></tr>
      </table>`)
].join('\n'))

/* ── Appointment Letter ────────────────────────────────────────────────── */
const APPOINTMENT_HTML = wrapDoc([
  page(`
      <p class="appr-ref">{{DATE}}</p>
      <p class="appr-ref">Ref: {{REF_NUMBER}}</p>
      <p class="appr-title">APPOINTMENT LETTER</p>
      <p class="appr-salutation">{{EMPLOYEE_NAME}}</p>
      <p class="appr-salutation">Dear {{EMPLOYEE_NAME}},</p>
      <p class="appr-para">Congratulations! Further to your application for employment with us, and the subsequent selection process, we are delighted to appoint you as {{DESIGNATION}} ({{GRADE}}) with MTAP Technologies.</p>
      <p class="appr-para">Your Total CTC Salary will be {{CTC_AMOUNT}}/- per annum [{{CTC_IN_WORDS}}]. This has been detailed in the Compensation Details annexed (Annexure 1) to this letter. For the purpose of clarification, your compensation details and related figures are dependent on your business vertical and job band within the Company.</p>
      <p class="appr-para">The terms &amp; conditions of our Offer of Employment to you are as follows:</p>
      <ol class="appr-list">
        <li><span class="appr-list-title">Date of Commencement of Employment:</span> Your employment with the Company shall commence on {{JOINING_DATE}}.</li>
        <li><span class="appr-list-title">Location:</span> Your current location of employment shall be {{WORK_LOCATION}}. However, MTAP reserves the right to transfer/utilize your services at any time to any of its unit(s)/ department(s) or office(s), work sites, or associated or affiliated companies in India, or outside India, on the terms and conditions as applicable to you at the time of transfer.
          <p class="appr-para">For the purpose of this agreement, "Affiliate" means any entity that controls, is controlled by, or is under common control with the First Party. For purposes of this Agreement, "control" means possessing, directly or indirectly, the power to direct or cause the direction of the management, policies or operations of an entity, whether through ownership of voting securities, by contract or otherwise.</p>
        </li>
        <li><span class="appr-list-title">Health Insurance Plan - Group Health Insurance Scheme:</span> You will be eligible to participate in a Group Health Insurance Scheme. You will be covered under the Standard Plan and as per your Job level confirmed in this offer. The Standard Plan provides you and your family i.e., your spouse and two children up to the age of 18 years with a cover of Rs. 1,50,000 per annum.</li>
        <li><span class="appr-list-title">Group Life Insurance &amp; Personnel Accident Coverage Scheme:</span> You will be covered under the Group Life Insurance Scheme, that provides you with a total life insurance cover of Rs. 1,500,000 of which Rs. 1,000,000 is covered towards natural death, and additional Rs. 5,00,000 towards an accidental death.</li>
      </ol>`),
  page(`
      <ol class="appr-list" start="5">
        <li><span class="appr-list-title">Probationary Period and Confirmation as a Permanent Employee:</span> You will be on probation for a period of six months from the date of joining the company and you will be appraised for satisfactory performance for which MTAP would confirm you. This confirmation will be communicated to you in writing, and you will be deemed to continue on probation till such time. If your performance is found unsatisfactory, MTAP may extend the probation period. If your performance is still found unsatisfactory, MTAP shall be entitled to terminate your services forthwith.</li>
        <li><span class="appr-list-title">Working Hours:</span> All our operations function 24x7, 365 days in a calendar year. Your working hours, number of working days in a week, weekly - off will depend upon the process requirements. You may be required to work in shifts and/or in extended working hours, as permitted by law. The company reserves the right to alter/modify its working hours. In case you absent yourself from duty for 3 days or more or extend leave at your own and without consent of management beyond originally granted leave, you shall be deemed to have left and relinquished your service. Such automatic relinquishment of the contract of employment shall be deemed as repudiation of the contract of employment by you, and not as a termination of the service by the company. In such case the Company will initiate necessary action as per its policy, in that regard.</li>
        <li><span class="appr-list-title">Leave:</span> MTAP provides for Earned (Privilege) Leave and Casual leave and as per the policies of the company. Leaves will be credited on the 1st of the subsequent month.</li>
        <li><span class="appr-list-title">Increments &amp; Promotions:</span> Your growth and increase in salary will depend solely on your performance and contribution to the Company. Salary increases are normally given on an annual basis and will be based on MTAP's Compensation &amp; Promotion Policy.</li>
        <li><span class="appr-list-title">Notice Period:</span> During probation, your services can be terminated with 15 days notice or salary in lieu thereof on either side. On confirmation or as a regular employee, your services can be terminated with 30 days notice or salary in lieu thereof on either side. MTAP reserves the right, if it is in the interest of business and current assignment, to ask you to serve your notice period. In case the management at your request accepts a shorter period of notice, you shall be entitled to receive your salary only for the actual number of days worked. The company reserves the right to terminate your services, for any act of misconduct, poor performance and high level of incompetency. This will be applicable during or after your training period. You will be subject to disciplinary action leading to termination, without notice or compensation.</li>
      </ol>`),
  page(`
      <ol class="appr-list" start="10">
        <li><span class="appr-list-title">Background Verification:</span> Your employment will be subject to clearance of a Background Verification/ Reference Check/ Criminal Check/ any other test specified by the client and genuineness of documents or information provided by you, which is including and not limited to your education (10th standard to post graduation, or as applicable), your prior employment and residence address. The background check is in line with MTAP's background Verification policy. You are being appointed on the presumption that you have no criminal background as per the law of the land and the particulars furnished by you in your application/resume and joining documents are correct and complete. A specially appointed agency will conduct internal and external background Verification. Normally, such checks are completed within one month of joining. If the background check/ referrals reveals unfavourable results and are not true and complete, you are liable to disciplinary action including termination of service without notice. You will be required to sign a standard Proprietary Information and Inventions agreement on joining. Your employment with us will be governed by the terms and conditions of the organization.</li>
      </ol>
      <p class="appr-para">This offer of employment and its annexures constitutes the entire agreement between you and the Company regarding the terms of your employment and it is the complete, final, and exclusive embodiment of your agreement with regard to this subject matter and supersedes any other promises, warranties, representations or agreements, whether written or oral. It is entered into without reliance on any promise or representation other than those expressly contained herein, and it cannot be modified or amended except in writing signed by an authorized officer of the Company.</p>
      <p class="appr-para">This agreement shall be governed by the laws of India and you hereby agree to the exclusive jurisdiction of the courts in Chennai, India.</p>
      <p class="appr-para">As a token of your acceptance of this agreement, kindly sign the duplicate copy.</p>
      <p class="appr-para">We welcome you to the MTAP family and wish you a rewarding career over the years to come.</p>
      <p class="appr-closing">Yours sincerely,</p>
      <div class="appr-sig-spacer"></div>
      <div class="appr-sign-block">
        <p class="appr-sign-line"><strong>Srinivas Chitturi</strong></p>
        <p class="appr-sign-line">CEO</p>
      </div>
      <p class="appr-para">Encl: Annexure A – Compensation Details / Annexure B – Other Benefits / Annexure C – Terms &amp; Conditions</p>`),
  page(`
      <p class="appr-annex-title">Annexure A: Compensation Details (Salary &amp; applicable benefits)</p>
      <p class="appr-emp">Name: {{EMPLOYEE_NAME}}</p>
      <p class="appr-para"><strong>a) Remuneration</strong></p>
      <p class="appr-emp">Division &amp; Subdivision: {{DIVISION}}</p>
      <p class="appr-emp">Designation: {{DESIGNATION}} &nbsp;&nbsp; Grade : {{GRADE}}</p>
      <table class="appr-table">
        <tr class="b"><td>Salary Heads</td><td class="num">Monthly</td><td class="num">Annual</td></tr>
        <tr class="b"><td colspan="3">Fixed Pay</td></tr>
        <tr><td>Basic Pay</td><td class="num">{{BASIC_MONTHLY}}</td><td class="num">{{BASIC_ANNUAL}}</td></tr>
        <tr><td>HRA</td><td class="num">{{HRA_MONTHLY}}</td><td class="num">{{HRA_ANNUAL}}</td></tr>
        <tr><td>Special Allowance</td><td class="num">{{SPECIAL_ALLOWANCE_MONTHLY}}</td><td class="num">{{SPECIAL_ALLOWANCE_ANNUAL}}</td></tr>
        <tr><td>LTA</td><td class="num">{{LTA_MONTHLY}}</td><td class="num">{{LTA_ANNUAL}}</td></tr>
        <tr><td>Statutory Bonus</td><td class="num">{{STATUTORY_MONTHLY}}</td><td class="num">{{STATUTORY_ANNUAL}}</td></tr>
        <tr class="b"><td colspan="3">Other Reimbursements</td></tr>
        <tr><td>Vehicle Reimbursements</td><td class="num">{{VEHICLE_MONTHLY}}</td><td class="num">{{VEHICLE_ANNUAL}}</td></tr>
        <tr><td>Driver's Salary</td><td class="num">{{DRIVER_MONTHLY}}</td><td class="num">{{DRIVER_ANNUAL}}</td></tr>
        <tr><td>Telephone Reimbursement</td><td class="num">{{TELEPHONE_MONTHLY}}</td><td class="num">{{TELEPHONE_ANNUAL}}</td></tr>
        <tr><td>Food Coupon / Allowance</td><td class="num">{{FOOD_MONTHLY}}</td><td class="num">{{FOOD_ANNUAL}}</td></tr>
        <tr class="b"><td>Fixed CTC</td><td class="num">{{FIXED_CTC_MONTHLY}}</td><td class="num">{{FIXED_CTC_ANNUAL}}</td></tr>
        <tr class="b"><td colspan="3">Retiral Benefits</td></tr>
        <tr><td>Provident Fund</td><td class="num">{{PF_MONTHLY}}</td><td class="num">{{PF_ANNUAL}}</td></tr>
        <tr class="b"><td>Sub-Total</td><td class="num">{{SUBTOTAL_MONTHLY}}</td><td class="num">{{SUBTOTAL_ANNUAL}}</td></tr>
        <tr class="b"><td>Total Fixed CTC</td><td class="num">{{TOTAL_FIXED_CTC_MONTHLY}}</td><td class="num">{{TOTAL_FIXED_CTC_ANNUAL}}</td></tr>
        <tr class="b"><td>Net Monthly Credit before Tax</td><td class="num">{{NET_MONTHLY_CREDIT_MONTHLY}}</td><td class="num">{{NET_MONTHLY_CREDIT_ANNUAL}}</td></tr>
      </table>
      <p class="appr-para"><strong>b) Retirals</strong></p>
      <ol class="appr-list" type="i">
        <li>You will participate in the company Provident Fund Scheme as applicable to your category of employees.</li>
        <li>You will be entitled to gratuity as per the provisions of the Gratuity Act 1972.</li>
      </ol>
      <p class="appr-para"><strong>c) Other Reimbursements:</strong> LTA, Vehicle Maintenance Reimbursement, Driver's Salary Reimbursement, Telephone Reimbursement will be exempted under Tax to the limit of bills submitted. Voluntary Provident Fund (VPF) is an employee option and if opted for, will appear as a deduction on the payslip. Deduction opted can be to a maximum of 15% of basic. Food coupons can be opted by the employees and the same will be exempted for Tax Deduction of Sodexo will appear under deductions in the payslip. Those who do not opt for Food coupons will be taxed accordingly.</p>
      <p class="appr-para"><strong>e) Applicable tax would be borne by the employee.</strong></p>
      <p class="appr-note">Note –</p>
      <ol class="appr-list" type="i">
        <li>It is expected that individual compensation package would not be shared with other employees.</li>
        <li>The above compensation structure is subject to change without affecting emoluments adversely.</li>
      </ol>`),
  page(`
      <p class="appr-annex-title">Terms and Conditions of Employment</p>
      <ol class="appr-list">
        <li>You shall not divulge, communicate or pass on any information, know-how, knowledge, data, methods, plans etc., of the company, directly or indirectly which you may come to possess as a result of your employment with the company to any outsider or anyone not employed by the company. This Agreement shall be effective as of the first day of your employment with the Company, and in the instance of your separation from the company, it will remain in effect for five years from your last working date.</li>
        <li>During your employment with the company, you shall not carry on any employment elsewhere, business, profession or calling of your own, either part time or otherwise. You will also not engage in any commercial activity.</li>
        <li>You shall not accept any offer of appointment / engagement / work assignment from any of the existing or past clients of MTAP, either during the course of your employment with us or up to a period of one year from the date of your separation from MTAP, without the prior written permission of the competent authority.</li>
        <li>You will be required to declare any direct relatives who may be working with MTAP or any of its subsidiary, group, and affiliate companies, direct or indirect competitors. If any of your direct relatives are offered by MTAP, or any of its subsidiary, group, affiliate companies, you would be required to voluntarily declare the same as and when an offer of employment is made to them. Direct relatives include spouse, brother, sister and children.</li>
        <li>You shall not download any unauthorized information, documents, graphics, etc, that you may gain access to, during the course of your work. You will be held solely liable for such acts and the Company shall stand absolved of the same.</li>
        <li>You shall not use your e-mail IDs / addresses / contact numbers to correspond with the existing / past / pipeline clients of MTAP., either to solicit business for personal gain or as an agent of any other company/ firm / organization, for a period of twelve months from the date of your relieving.</li>
        <li>You are liable to not join any of our competitors including its associate companies or sister concerns for two years with effect from your date of joining. If you fail to adhere to the same, you and the company which you join will be liable for such non-conformance.</li>
        <li>You shall not communicate, in any manner, any information regarding your remuneration /terms of employment to any other employee of the company except your immediate superior and/or concerned person(s) of the HR department.</li>
        <li>You shall be governed by the policies and procedures of the company, service rules and regulations being in force, or introduced/ amended later. All policy documents are available in our portal https://mtappl.zinghr.com. In this regard, an undertaking confirming that you have read and understood the policies will be taken, at the time of joining.</li>
        <li>Your offer is subject to you being medically fit at the time of joining the Company or at the request by the client/ management. Upon request, you are required to contact a registered medical practitioner and obtain a Medical Fitness Certificate which needs to be submitted at the time of joining/upon request. If you are found medically unfit to carry on the duties of your current role, this offer will stand withdrawn. The decision of the company will be final.</li>
        <li>You shall communicate any change with regard to your expected date of Joining. The HR team will give you a letter confirming the change of date.</li>
        <li>You shall declare to the Human Resources team if you are a foreign national or a non-resident Indian. You will be obligated to conform to all the statutory laws that govern a foreign national or a non-resident Indian.</li>
      </ol>`),
  page(`
      <p class="appr-para">Our offer to you as a {{DESIGNATION}} is conditional upon your having fully completed your graduation, without any active backlog papers and with a pass percentage of 60%. These eligibility criteria for the Role have already been clearly communicated to you. You will produce all marks sheets and other relevant documents, at least till the penultimate semester. All these proofs will need to be submitted on the day of joining. Further, you should have been declared as passed by the relevant examination authority. The determination of the adequacy or authenticity of all or any of the proofs and any condonation of delay in submission of the same will be at the Company's discretion.</p>
      <p class="appr-para">You shall be required to sign certain mandatory agreements, including but not limited to the Confidentiality, Intellectual Property Rights, the Code of Business Conduct and Ethics and your employment shall be governed by all the rules and regulations, as amended from time to time, of the Company as applicable to your category of employees.</p>
      <p class="appr-para">Furthermore, the Company has various human resources and administration policies and procedures. The Company reserves the right to vary these policies at any time in its absolute discretion. While these policies do not form part of your contract of employment, you are required to abide by all applicable policies.</p>
      <p class="appr-para">In case of defiance of the terms and conditions set herein, the Company shall have all rights to take appropriate disciplinary action against you, in its sole discretion.</p>
      <p class="appr-para">I hereby acknowledge and agree to abide by all internal policies of the Company.</p>
      <p class="appr-sign-line">Signature and Date</p>`),
  page(`
      <p class="appr-annex-title">Its mandate to submit the below mentioned documents at the time of your joining.</p>
      <ol class="appr-list">
        <li>Three passport size photographs and two stamp size photographs</li>
        <li>Educational Certificates (photocopy for submission)
          <ul class="appr-bullets">
            <li>10th Mark Sheet</li>
            <li>12th Mark Sheet</li>
            <li>UG provisional Certificate - degree certificate or mark sheets, provisional valid only till 6 months</li>
            <li>PG provisional Certificate - degree certificate or mark sheets, provisional valid only till 6 months</li>
          </ul>
        </li>
        <li>Last three month's pay slip</li>
        <li>Relieving letter/Service certificate from the last three employers as per applicability.</li>
        <li>Identity Proof: (Kindly provide below mentioned documents)
          <ul class="appr-bullets">
            <li>Valid Indian Passport (Kindly sign the affidavit, if you do not have a passport).</li>
            <li>Pan Card*</li>
            <li>Voters Identity Card</li>
            <li>Driving License</li>
            <li>Bank Passbook with attested customer photograph</li>
            <li>Aadhaar*</li>
          </ul>
        </li>
        <li>Address Proof: (Kindly provide below mentioned documents)
          <ul class="appr-bullets">
            <li>Valid Indian Passport</li>
            <li>Aadhaar Card*</li>
            <li>Voters Identity Card</li>
            <li>Telephone bill</li>
            <li>Ration card</li>
            <li>Electricity bill</li>
          </ul>
        </li>
        <li>PF &amp; UAN Account No with the last employer as per applicability</li>
        <li>If Applicable Under ESI: One Post Card Size photo with nominee.</li>
        <li>PAN Card and Aadhar*</li>
      </ol>
      <p class="appr-note">Note: 1. "Kindly bring the Original certificates for validation at the time of joining"</p>
      <p class="appr-note">2. * - Star mark indicate mandatory document</p>`)
].join('\n'))

/** All stock templates seeded into a fresh install (and merged into existing
 *  installs that pre-date them). The appraisal letter remains first. */
export const STOCK_TEMPLATES: Template[] = [
  tpl('appraisal_letter', 'Appraisal Letter', 'Your Appraisal Letter — {{EMPLOYEE_NAME}}', DEFAULT_APPRAISAL_HTML),
  tpl('offer_letter', 'Offer Letter', 'Offer Letter — {{POSITION}} at MTAP Technologies', OFFER_HTML),
  tpl('appointment_letter', 'Appointment Letter', 'Appointment Letter — {{EMPLOYEE_NAME}}', APPOINTMENT_HTML),
  tpl('contract_letter', 'Contract Letter', 'Contract Letter — MTAP Technologies', CONTRACT_HTML),
  tpl('internship_offer_letter', 'Internship Offer Letter', 'Internship Letter — MTAP Technologies', INTERN_OFFER_HTML),
  tpl('internship_completion_letter', 'Internship Completion Letter', 'Certificate of Internship Completion — {{INTERN_NAME}}', INTERN_COMPLETION_HTML),
  tpl('relieving_letter', 'Relieving Letter', 'Relieving Letter — {{EMPLOYEE_NAME}}', RELIEVING_HTML),
  tpl('exit_nda', 'Exit NDA / Declaration', 'Exit Declaration — {{EMPLOYEE_NAME}}', EXIT_NDA_HTML),
  tpl('pip_closure_letter', 'PIP Closure Letter', 'PIP Closure — Successful Completion — {{EMPLOYEE_NAME}}', PIP_HTML)
]
