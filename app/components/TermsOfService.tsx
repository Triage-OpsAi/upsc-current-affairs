import { legalConfig } from "../../lib/legal-config";
import { LegalPage, LegalSection } from "./LegalPage";

export function TermsOfService() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      summary={`These Terms explain the rules for using ${legalConfig.businessName}, including accounts, educational content, trials, subscriptions, and payments.`}
    >
      <LegalSection title="1. Accepting these Terms">
        <p>By creating an account, starting a trial, buying a subscription, or using AspirantOS, you agree to these Terms, the Privacy Policy, and the Refund Policy. If you do not agree, do not use or purchase the service.</p>
        <p>The service is operated by {legalConfig.businessName} from {legalConfig.businessAddress}. A minor may use the service only with the consent and supervision of a parent or legal guardian.</p>
      </LegalSection>

      <LegalSection title="2. Your account">
        <p>You must provide accurate information, use an email address you control, keep OTPs and sessions private, and promptly tell us about suspected unauthorised access. Your account is personal and may not be sold, shared, transferred, or used to give others paid access.</p>
        <p>Device limits help prevent credential sharing and fraud. Legitimate device changes may trigger additional verification or a temporary security restriction.</p>
      </LegalSection>

      <LegalSection title="3. Acceptable use">
        <p>You may use AspirantOS for personal exam preparation. You must not:</p>
        <ul>
          <li>break the law, impersonate another person, or misuse another person&apos;s account;</li>
          <li>scrape, copy, republish, resell, or commercially distribute substantial platform content;</li>
          <li>bypass subscriptions, device controls, rate limits, authentication, or other safeguards;</li>
          <li>upload malware, probe for vulnerabilities, disrupt the service, or automate abusive traffic;</li>
          <li>reverse engineer protected systems except where the law expressly permits it; or</li>
          <li>use the service to harass others, commit fraud, or infringe intellectual-property or privacy rights.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Trial and paid access">
        <p>Each eligible new account receives the trial period shown at sign-up, currently seven days. The trial does not itself authorise a payment. When it ends, paid features may pause until a subscription is active, while saved progress remains linked to the account.</p>
        <p>Paid access is billed at the price, frequency, taxes, and renewal terms displayed and accepted at checkout. If you authorise recurring billing, the payment provider may issue required mandate and pre-debit notices. You may cancel future renewal through the available account or payment-mandate controls.</p>
      </LegalSection>

      <LegalSection title="5. Founding 500 offer">
        <p>The first 500 eligible account numbers may receive a promotional base price of ₹99 per month instead of ₹299. “Locked for life” means that base price remains attached to the eligible account while the service and account continue in good standing. It is not a one-time payment, free lifetime service, transferable benefit, or promise that every feature will remain unchanged.</p>
        <p>Taxes may change where legally required. Founder eligibility may be removed for fraud, duplicate accounts, payment abuse, or a material breach, but not merely because the ordinary subscription price changes.</p>
      </LegalSection>

      <LegalSection title="6. Refunds and payment disputes">
        <p>Refund eligibility is explained in the Refund Policy. Cancellation stops eligible future renewal but does not automatically reverse a completed charge. Nothing in these Terms removes rights that cannot lawfully be excluded, including remedies for unauthorised or duplicate charges.</p>
        <p>Do not send card numbers, OTPs, UPI PINs, or banking passwords to support. Payment providers, banks, and networks may apply their own processing times and dispute rules.</p>
      </LegalSection>

      <LegalSection title="7. Educational content">
        <p>AspirantOS provides educational practice and is not affiliated with UPSC or another government examination authority. Questions, summaries, AI-assisted explanations, and reports may contain errors or become outdated despite reasonable review. Verify important information against official sources.</p>
        <p>We do not guarantee selection, marks, rank, employment, or any academic or professional outcome.</p>
      </LegalSection>

      <LegalSection title="8. Intellectual property">
        <p>The software, design, branding, question presentation, explanations, and original compilations belong to {legalConfig.businessName} or its licensors. We grant you a limited, personal, revocable, non-exclusive, and non-transferable right to use them while your access is valid.</p>
        <p>You keep ownership of information you submit. You allow us to process it only as needed to operate, secure, and improve the service under the Privacy Policy.</p>
      </LegalSection>

      <LegalSection title="9. Availability and changes">
        <p>We may maintain systems, fix or replace inaccurate questions, add or remove features, and change reasonable technical requirements. We aim to keep the service available but do not promise uninterrupted or error-free operation.</p>
        <p>Material changes affecting paid access will be communicated reasonably. We will not retroactively remove an already accepted refund right or valid founder-price eligibility.</p>
      </LegalSection>

      <LegalSection title="10. Suspension and termination">
        <p>You may stop using the service and request account deletion through <a href={`mailto:${legalConfig.supportEmail}`}>{legalConfig.supportEmail}</a>. Deletion may permanently remove study history and does not by itself cancel an external payment mandate, which must also be cancelled with the payment provider.</p>
        <p>We may restrict, suspend, or terminate access for fraud, security threats, unlawful conduct, abusive automation, chargeback abuse, serious account sharing, or another material breach. Where reasonable, we will provide notice and a way to contact support. Rights and payment obligations that arose before termination continue where applicable.</p>
      </LegalSection>

      <LegalSection title="11. Limitation of liability">
        <p>To the maximum extent permitted by law, AspirantOS is provided on an “as available” basis. We are not liable for indirect, incidental, special, or consequential loss, lost opportunities, or examination outcomes caused by reliance on educational content or service interruption.</p>
        <p>Nothing here excludes liability or remedies that cannot legally be excluded, including liability for fraud, wilful misconduct, unauthorised charges, deficient services, or rights under the Consumer Protection Act, 2019.</p>
      </LegalSection>

      <LegalSection title="12. Governing law and disputes">
        <p>These Terms are governed by the laws of India. Subject to mandatory consumer jurisdiction, courts at {legalConfig.jurisdictionCity} will have jurisdiction. Eligible consumers may also approach a Consumer Commission or another competent statutory authority.</p>
      </LegalSection>

      <LegalSection title="13. Complaints and contact">
        <p>Send questions or complaints from your registered email to <a href={`mailto:${legalConfig.supportEmail}`}>{legalConfig.supportEmail}</a>. Grievance Officer: {legalConfig.grievanceOfficer}. We aim to acknowledge consumer complaints within 48 hours and resolve them within one month.</p>
      </LegalSection>

      <LegalSection title="14. Changes to these Terms">
        <p>We may update these Terms for legal, security, payment, or service changes. Material updates will be communicated reasonably and the “Last updated” date will change. Continuing to use the service after the effective date means you accept the revised Terms.</p>
      </LegalSection>
    </LegalPage>
  );
}
