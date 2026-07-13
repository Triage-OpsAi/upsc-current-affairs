import { LegalPage, LegalSection } from "../components/LegalPage";
import { legalConfig } from "../../lib/legal-config";

export const metadata = {
  title: "Terms and Conditions | AspirantOS",
  description: "Terms governing AspirantOS trials, subscriptions, accounts, and educational content.",
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms and Conditions"
      summary={`These Terms govern access to ${legalConfig.businessName}, including the seven-day trial, paid subscriptions, current-affairs questions, guided breakdowns, and performance reports.`}
    >
      <LegalSection title="1. Agreement and operator">
        <p>By creating an account, starting a trial, purchasing a subscription, or using the service, you agree to these Terms and the Refund Policy. The service is operated by {legalConfig.businessName} from {legalConfig.businessAddress}. If you do not agree, do not use or purchase the service.</p>
      </LegalSection>

      <LegalSection title="2. Eligibility and account security">
        <p>You must be legally capable of entering a contract in India. A minor may use the service only with the consent and supervision of a parent or legal guardian. You must provide accurate account information, protect OTP access, and use only your own account.</p>
        <p>Accounts are personal and may be subject to disclosed device limits. We may temporarily restrict an account to prevent credential sharing, fraud, scraping, payment abuse, or unauthorised access. We will not use these controls to remove statutory consumer remedies.</p>
      </LegalSection>

      <LegalSection title="3. Seven-day free trial">
        <p>Each eligible new account receives one seven-day trial beginning when the account is created. The trial includes question, breakdown, archive, and report access. Unless checkout clearly states otherwise and you give explicit consent to a recurring payment mandate, creating a trial does not itself authorise a debit.</p>
        <p>When the trial ends, question and breakdown access is paused unless a paid plan is active. Saved scores, attempts, and profile history remain associated with the account.</p>
      </LegalSection>

      <LegalSection title="4. Subscription, renewal, and cancellation">
        <p>Paid access is billed monthly at the price shown and affirmatively accepted at checkout. Any taxes or compulsory charges must be shown before payment. If recurring billing is selected, the payment service provider may send the pre-debit notice required under the applicable RBI e-mandate framework.</p>
        <p>You may cancel future renewal through the cancellation method shown in your account or payment mandate. Cancellation stops future eligible renewals but does not automatically refund a payment already processed. Access normally continues through the paid billing period, unless a refund reverses that payment.</p>
      </LegalSection>

      <LegalSection title="5. Founding 500 price">
        <p>The first 500 eligible account numbers may receive a promotional price of ₹99 per month instead of the standard ₹299 per month. “Locked for life” means the ₹99 monthly base price remains attached to that eligible account for as long as the service and that account continue to exist and remain in good standing. It does not mean a one-time payment, perpetual free service, transferability, or a guarantee that every feature will remain unchanged.</p>
        <p>Government-imposed taxes or charges may be added or changed where legally required. Founder eligibility may be removed only for fraud, duplicate accounts, payment abuse, or a material breach of these Terms—not merely because the ordinary price changes.</p>
      </LegalSection>

      <LegalSection title="6. Educational content and no result guarantee">
        <p>The service provides educational practice material and is not affiliated with UPSC or any government examination authority. Questions, current-affairs summaries, and AI-assisted explanations are reviewed and updated on a best-efforts basis, but may contain errors or become outdated. The service does not guarantee examination selection, marks, rank, or any professional outcome.</p>
      </LegalSection>

      <LegalSection title="7. Acceptable use">
        <p>You may use the service for personal exam preparation. You must not reproduce or commercially distribute substantial content, scrape the platform, bypass access controls, reverse engineer protected systems, interfere with other users, upload malicious material, or use the service unlawfully.</p>
      </LegalSection>

      <LegalSection title="8. Intellectual property">
        <p>The platform design, software, question presentation, explanations, branding, and original compilations belong to {legalConfig.businessName} or its licensors. Your subscription grants a limited, revocable, non-transferable right to use them personally during an active trial or paid period.</p>
      </LegalSection>

      <LegalSection title="9. Service availability and content changes">
        <p>We may correct questions, replace inaccurate content, maintain systems, and improve features. When previously attempted questions are materially replaced, we may preserve the original score and display a content-change notice. We will not deliberately withhold information or misrepresent the nature, price, or availability of the service.</p>
      </LegalSection>

      <LegalSection title="10. Suspension and termination">
        <p>We may suspend or terminate access for fraud, security threats, unlawful use, chargeback abuse, serious account sharing, or material breach. Where reasonable, we will provide notice and an opportunity to contact support. Termination does not remove payment, refund, or consumer rights that already accrued.</p>
      </LegalSection>

      <LegalSection title="11. Liability and mandatory rights">
        <p>To the maximum extent permitted by law, the service is provided on an availability basis and indirect or consequential losses are excluded. Nothing in these Terms excludes liability or remedies that cannot lawfully be excluded, including remedies for deficient services, unfair trade practices, unauthorised charges, fraud, wilful misconduct, or rights under the Consumer Protection Act, 2019.</p>
      </LegalSection>

      <LegalSection title="12. Complaints and grievance officer">
        <p>Send complaints from your registered email to <a href={`mailto:${legalConfig.supportEmail}`}>{legalConfig.supportEmail}</a>. Grievance Officer: {legalConfig.grievanceOfficer}. We aim to acknowledge consumer complaints within 48 hours and resolve them within one month, in line with the Consumer Protection (E-Commerce) Rules, 2020.</p>
      </LegalSection>

      <LegalSection title="13. Governing law and disputes">
        <p>These Terms are governed by Indian law. Subject to applicable consumer jurisdiction and other mandatory law, courts at {legalConfig.jurisdictionCity} will have jurisdiction. Nothing here prevents an eligible consumer from approaching a Consumer Commission or another competent statutory forum.</p>
      </LegalSection>

      <LegalSection title="14. Changes to these Terms">
        <p>We may update these Terms for legal, security, or service changes. Material changes will be communicated reasonably before taking effect. Changes will not retroactively remove an already accepted refund right or founder-price eligibility.</p>
      </LegalSection>

      <LegalSection title="Official legal references">
        <ul>
          <li><a href="https://www.indiacode.nic.in/bitstream/123456789/15256/1/eng201935.pdf" target="_blank" rel="noreferrer">Consumer Protection Act, 2019 — India Code</a></li>
          <li><a href="https://consumeraffairs.nic.in/sites/default/files/E%20commerce%20rules.pdf" target="_blank" rel="noreferrer">Consumer Protection (E-Commerce) Rules, 2020</a></li>
          <li><a href="https://consumeraffairs.nic.in/sites/default/files/The%20Guidelines%20for%20Prevention%20and%20Regulation%20of%20Dark%20Patterns%2C%202023.pdf" target="_blank" rel="noreferrer">Guidelines for Prevention and Regulation of Dark Patterns, 2023</a></li>
        </ul>
      </LegalSection>
    </LegalPage>
  );
}
