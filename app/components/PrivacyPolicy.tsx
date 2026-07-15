import { legalConfig } from "../../lib/legal-config";
import { LegalPage, LegalSection } from "./LegalPage";

export function PrivacyPolicy() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      summary={`This Policy explains what ${legalConfig.businessName} collects, why we use it, and the choices you have when using AspirantOS.`}
    >
      <LegalSection title="1. Who operates AspirantOS">
        <p>{legalConfig.businessName} operates AspirantOS, an exam-preparation service for current affairs and static subjects. Questions about this Policy or your data can be sent to <a href={`mailto:${legalConfig.supportEmail}`}>{legalConfig.supportEmail}</a>.</p>
      </LegalSection>

      <LegalSection title="2. Data we collect">
        <p>We collect only the information needed to provide, secure, and improve the service:</p>
        <ul>
          <li><strong>Account information:</strong> email address, name, target examination, and email-verification status.</li>
          <li><strong>Optional profile information:</strong> avatar URL, biography, and city, when you choose to provide them.</li>
          <li><strong>Study activity:</strong> questions viewed, answers, retries, breakdown activity, scores, accuracy, reports, and recommendations.</li>
          <li><strong>Subscription information:</strong> trial dates, subscription status, plan eligibility, and transaction references. Payment providers process card, bank, or UPI details; we do not store complete payment credentials.</li>
          <li><strong>Security and technical information:</strong> a browser-generated device identifier, session records, IP address, browser or device user-agent, login events, and timestamps.</li>
          <li><strong>Messages:</strong> information you include when contacting support, requesting a refund, or making a privacy complaint.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Data we do not collect">
        <p>AspirantOS does not request your phone contacts, precise GPS location, camera, microphone, photographs from your device, government identity documents, or complete card, bank-account, UPI PIN, or OTP credentials. We do not sell personal data or build advertising profiles.</p>
      </LegalSection>

      <LegalSection title="4. Why we use data">
        <p>We use data to create and authenticate your account, send sign-in codes and service notices, save study progress, calculate reports, manage trials and subscriptions, provide support, prevent account sharing and abuse, investigate security incidents, correct content, and comply with legal obligations.</p>
        <p>Where the law requires consent, you may withdraw it by contacting us. Withdrawal does not affect processing that was lawful before withdrawal or information we must retain for legal or security reasons.</p>
      </LegalSection>

      <LegalSection title="5. Browser storage and cookies">
        <p>The app uses essential local storage to keep a device identifier, access token, session expiry, and basic profile state. Session storage remembers short-lived interface states such as whether a reminder was shown. These are needed for sign-in, security, and continuity.</p>
        <p>We do not currently use third-party advertising cookies or cross-site behavioural tracking. If analytics or non-essential cookies are added later, this Policy and any required consent controls will be updated first.</p>
      </LegalSection>

      <LegalSection title="6. Service providers and sharing">
        <p>We share data only where needed to run the service, follow the law, protect users, or complete a transaction. Current service providers include:</p>
        <ul>
          <li><strong>Supabase/PostgreSQL</strong> for application data and account records.</li>
          <li><strong>Upstash Redis</strong> for short-lived authenticated-session caching.</li>
          <li><strong>Google Workspace/Gmail SMTP</strong> for OTP and account email delivery.</li>
          <li><strong>Vercel</strong> for application hosting and infrastructure logs.</li>
          <li><strong>OpenAI</strong> for AI-assisted educational content and feedback. We avoid sending account passwords or payment credentials to this service.</li>
          <li><strong>Payment providers</strong>, when checkout is enabled, for payment processing, mandates, refunds, and fraud checks.</li>
        </ul>
        <p>Providers may process data in other countries under their own security and legal obligations. We do not sell or rent personal information. We may disclose limited information when required by law, a lawful authority, or to protect the service and its users.</p>
      </LegalSection>

      <LegalSection title="7. Storage, retention, and security">
        <p>Production traffic is protected with HTTPS while data travels between your browser and the service. We use hashed OTPs, access controls, device-bound sessions, limited session lifetimes, and restricted database access. No internet service can promise absolute security, but we use reasonable technical and organisational safeguards.</p>
        <p>We keep account and study records while your account is active and for a reasonable period afterward when needed for security, disputes, refunds, accounting, or law. Expired OTPs and temporary sessions are kept only as long as needed for authentication and abuse prevention. Backup copies may take additional time to expire.</p>
      </LegalSection>

      <LegalSection title="8. Your choices and rights">
        <p>You may ask to access, correct, receive a portable copy of, or delete your personal data. You may also object to or restrict certain processing and withdraw consent where applicable. Send the request from your registered email to <a href={`mailto:${legalConfig.supportEmail}`}>{legalConfig.supportEmail}</a>.</p>
        <p>We may verify your identity before acting. Deleting an account may permanently remove saved progress and access. We may retain limited records when required for fraud prevention, payment disputes, tax, accounting, or another legal obligation.</p>
      </LegalSection>

      <LegalSection title="9. Children">
        <p>A minor may use AspirantOS only with the consent and supervision of a parent or legal guardian. A parent or guardian may contact us to review or request deletion of a minor&apos;s information.</p>
      </LegalSection>

      <LegalSection title="10. Changes and contact">
        <p>We may update this Policy when the service, providers, or law changes. Material changes will be shown in the app or communicated by email where appropriate, and the date at the top will be updated.</p>
        <p>Privacy and support contact: <a href={`mailto:${legalConfig.supportEmail}`}>{legalConfig.supportEmail}</a>. Grievance Officer: {legalConfig.grievanceOfficer}. Postal address: {legalConfig.businessAddress}.</p>
      </LegalSection>
    </LegalPage>
  );
}
