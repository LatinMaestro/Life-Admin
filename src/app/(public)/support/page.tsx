import type { Metadata } from "next";
import Link from "next/link";
import { PolicySection, PublicPolicyPage } from "@/components/public-policy-page";

export const metadata: Metadata = {
  title: "Support",
  description: "Help and support for Family Life Admin.",
};

export default function SupportPage() {
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

  return (
    <PublicPolicyPage
      title="Support"
      description="Help with signing in, household access, shared items, privacy, and account deletion."
    >
      <PolicySection title="Start here">
        <p>Refresh the app and confirm that you are signed in with the email address invited to the household. Household access may need an administrator to accept or resend an invitation.</p>
        <p>For bill and renewal reminders, always check the original provider source before taking action.</p>
      </PolicySection>
      <PolicySection title="Account deletion">
        <p>Account deletion is available from Settings. A sole household administrator must make another member an administrator first.</p>
        <p><Link className="text-primary underline" href="/account-deletion">Read the deletion instructions</Link>.</p>
      </PolicySection>
      <PolicySection title="Contact support">
        <p>
          {supportEmail
            ? <>Email <a className="text-primary underline" href={`mailto:${supportEmail}`}>{supportEmail}</a>. Do not include passwords, payment details, or private source documents.</>
            : "Use the support contact listed in the application store. Do not include passwords, payment details, or private source documents."}
        </p>
      </PolicySection>
    </PublicPolicyPage>
  );
}
