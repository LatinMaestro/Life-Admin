import type { Metadata } from "next";
import Link from "next/link";
import { PolicySection, PublicPolicyPage } from "@/components/public-policy-page";

export const metadata: Metadata = {
  alternates: { canonical: "/account-deletion" },
  title: "Delete account",
  description: "Delete a Family Life Admin account and associated personal information.",
};

export default async function AccountDeletionPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const { deleted } = await searchParams;

  return (
    <PublicPolicyPage
      title={deleted === "true" ? "Account deleted" : "Delete your account"}
      description={
        deleted === "true"
          ? "Your sign-in has been removed and your household profile has been anonymized."
          : "You can permanently remove your sign-in and personal account profile."
      }
    >
      {deleted === "true" ? (
        <p>You no longer have access to Family Life Admin. Shared household history may retain a non-identifying former-member label.</p>
      ) : (
        <>
          <PolicySection title="Before deletion">
            <p>Deletion removes your Clerk sign-in and anonymizes your personal profile and household memberships.</p>
            <p>Shared tasks, comments, and activity may remain so other household members keep necessary household history, but they will no longer identify you.</p>
            <p>If you are the only administrator of a household, appoint another administrator first.</p>
          </PolicySection>
          <PolicySection title="Delete in the app">
            <p>Sign in, open Settings, choose Delete account, and type DELETE to confirm.</p>
            <p><Link className="text-primary underline" href="/settings#delete-account">Open account settings</Link>.</p>
          </PolicySection>
        </>
      )}
    </PublicPolicyPage>
  );
}
