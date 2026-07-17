import type { Metadata } from "next";
import { PolicySection, PublicPolicyPage } from "@/components/public-policy-page";

export const metadata: Metadata = {
  alternates: { canonical: "/privacy" },
  title: "Privacy",
  description: "How Family Life Admin handles private household information.",
};

export default function PrivacyPage() {
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

  return (
    <PublicPolicyPage
      title="Privacy policy"
      description="Family Life Admin is a private household coordination service. This policy explains what information the service handles and how it is protected."
    >
      <p className="text-muted-foreground">Effective 17 July 2026.</p>
      <PolicySection title="Information we handle">
        <p>Account information includes your name, email address, authentication identifier, and household membership.</p>
        <p>Household content includes tasks, reminders, shopping lists, inbox items, bill and renewal reminder metadata, comments, activity history, and source links or location references that household members create.</p>
        <p>The service does not provide budgeting, banking, transaction, cashflow, tax, lending, or financial analytics.</p>
      </PolicySection>
      <PolicySection title="Bills and source references">
        <p>Bill and renewal records are administrative reminders only. The service is designed not to store generated or transcribed payment routing credentials or bill-specific payment codes.</p>
        <p>Payment-related reminders direct household members to an original source link or user-confirmed source reference.</p>
      </PolicySection>
      <PolicySection title="How information is used">
        <p>Information is used to provide household coordination, enforce household access, maintain activity history, secure the service, troubleshoot faults, and meet legal obligations.</p>
        <p>Household content is not sold and is not used for advertising.</p>
      </PolicySection>
      <PolicySection title="Service providers">
        <p>Authentication, hosting, and database infrastructure are provided by contracted technology providers, currently including Clerk, Vercel, and Neon. They process information only to operate the service under their applicable terms and security controls.</p>
      </PolicySection>
      <PolicySection title="Storage and security">
        <p>Private responses are not publicly cached. Access is checked against active household membership. Sensitive server credentials are kept outside application source code.</p>
        <p>No internet service can guarantee absolute security. Report suspected unauthorized access promptly through the support contact.</p>
      </PolicySection>
      <PolicySection title="Retention and deletion">
        <p>Account information is retained while an account is active. When an account is deleted, sign-in access is removed and personal profile and membership information is anonymized. Household records contributed to a shared workspace may remain as operational history under a non-identifying former-member label.</p>
        <p>A sole household administrator must appoint another administrator before deleting their account so the remaining household is not locked out.</p>
      </PolicySection>
      <PolicySection title="Your choices">
        <p>You can review and correct household information in the app. You can delete your account from Settings or use the account-deletion page on this website.</p>
      </PolicySection>
      <PolicySection title="Children">
        <p>The service is intended for household administration by people permitted to create an account. It is not directed to children for independent account creation.</p>
      </PolicySection>
      <PolicySection title="Contact">
        <p>
          {supportEmail
            ? <>Privacy questions can be sent to <a className="text-primary underline" href={`mailto:${supportEmail}`}>{supportEmail}</a>.</>
            : "Privacy questions can be sent using the support contact published with the application."}
        </p>
      </PolicySection>
    </PublicPolicyPage>
  );
}
