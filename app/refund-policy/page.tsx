import { LegalPage, LegalSection } from "../components/LegalPage";
import { legalConfig } from "../../lib/legal-config";

export const metadata = {
  title: "Refund Policy | AspirantOS",
  description: "Refund eligibility and request process for AspirantOS monthly subscriptions.",
};

export default function RefundPolicyPage() {
  return (
    <LegalPage
      eyebrow="Payments"
      title="Refund and Cancellation Policy"
      summary="Refunds are available for a narrow introductory period: a request must be made within seven calendar days of payment, and that payment must be the account’s first or second paid monthly subscription charge."
    >
      <LegalSection title="Policy at a glance">
        <div className="rounded-xl border border-cyan-200/20 bg-cyan-300/[.06] p-4">
          <p><strong className="text-white">Eligible:</strong> first or second paid monthly charge + request received within 7 calendar days of that charge.</p>
          <p><strong className="text-white">Not eligible under the voluntary policy:</strong> requests after the 7-day request window, and every third or later monthly charge.</p>
        </div>
      </LegalSection>

      <LegalSection title="1. Free trial">
        <p>The seven-day trial does not require a subscription payment unless you separately complete checkout and explicitly authorise payment. Because no fee is charged for the free trial itself, there is no trial fee to refund.</p>
      </LegalSection>

      <LegalSection title="2. Introductory refund eligibility">
        <p>A paid subscription charge qualifies for a voluntary refund only when both conditions below are satisfied:</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7 text-zinc-400">
          <li>The charge is the first or second successful monthly subscription payment ever processed for that account; and</li>
          <li>We receive the refund request no later than seven calendar days after the timestamp of that specific payment.</li>
        </ol>
        <p>Each of the first two monthly payments has its own seven-day request window. Usage of questions or breakdowns during that period does not by itself remove this stated introductory refund right.</p>
      </LegalSection>

      <LegalSection title="3. Payments that are non-refundable">
        <p>Under this voluntary policy, the third monthly payment and all later monthly payments are non-refundable. The first or second payment also becomes non-refundable when its seven-calendar-day request window expires. We do not provide partial or prorated refunds for unused days after cancellation.</p>
        <p>This limitation does not override the mandatory exceptions in section 6 below or any remedy that cannot lawfully be excluded.</p>
      </LegalSection>

      <LegalSection title="4. Cancellation is different from a refund">
        <p>You may cancel future renewal using the cancellation facility made available through your account or payment mandate. Cancellation prevents future eligible debits but does not reverse an already completed payment. Unless a refund is approved, paid access continues until the end of the current billing period.</p>
      </LegalSection>

      <LegalSection title="5. How to request a refund">
        <p>Email <a href={`mailto:${legalConfig.supportEmail}`}>{legalConfig.supportEmail}</a> from the email registered to your account. Include your account email, payment date, amount, transaction or payment ID, and the reason for the request. Do not send card numbers, OTPs, UPI PINs, or banking passwords.</p>
        <p>We aim to acknowledge a consumer complaint within 48 hours and resolve it within one month. If approved, the refund will be initiated to the original payment method within a reasonable period, subject to payment-provider and banking timelines.</p>
      </LegalSection>

      <LegalSection title="6. Mandatory and error-related exceptions">
        <p>Regardless of the voluntary time limits above, we will investigate and provide the remedy required by applicable law or payment-network rules for matters such as duplicate billing, an unauthorised transaction, a charge processed after an effective cancellation, a payment collected without valid consent, or a material failure to provide the paid service due to our deficiency.</p>
        <p>Nothing in this Policy limits rights under the Consumer Protection Act, 2019, the Consumer Protection (E-Commerce) Rules, 2020, RBI requirements applicable to recurring payments, or a consumer commission’s lawful order.</p>
      </LegalSection>

      <LegalSection title="7. Founder pricing after a refund">
        <p>A valid refund does not by itself transfer or sell a Founding 500 place. Founder-price eligibility remains attached to the original eligible account, subject to the Terms and Conditions. Paid access may pause when the refunded payment is reversed and will resume only after a valid paid subscription is active.</p>
      </LegalSection>

      <LegalSection title="8. Chargebacks and disputed payments">
        <p>Please contact us first so we can investigate promptly. We may temporarily restrict paid access while a chargeback or payment dispute is pending. We will not penalise a consumer merely for exercising a lawful dispute or statutory remedy, but fraudulent or abusive disputes may lead to account action.</p>
      </LegalSection>

      <LegalSection title="9. Contact and escalation">
        <p>Grievance Officer: {legalConfig.grievanceOfficer}. Email: <a href={`mailto:${legalConfig.supportEmail}`}>{legalConfig.supportEmail}</a>. Business address: {legalConfig.businessAddress}. Consumers may also use any competent consumer redressal forum available under applicable law.</p>
      </LegalSection>

      <LegalSection title="Official legal references">
        <ul>
          <li><a href="https://consumeraffairs.nic.in/sites/default/files/E%20commerce%20rules.pdf" target="_blank" rel="noreferrer">Consumer Protection (E-Commerce) Rules, 2020</a></li>
          <li><a href="https://www.indiacode.nic.in/bitstream/123456789/15256/1/eng201935.pdf" target="_blank" rel="noreferrer">Consumer Protection Act, 2019</a></li>
          <li><a href="https://www.rbi.org.in/scripts/bs_circularindexdisplay.aspx/Scripts/BS_CircularIndexDisplay.aspx?Id=12722" target="_blank" rel="noreferrer">RBI recurring e-mandate framework reference</a></li>
        </ul>
      </LegalSection>
    </LegalPage>
  );
}
