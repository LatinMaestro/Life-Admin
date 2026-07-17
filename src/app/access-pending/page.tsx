import { SignOutButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { LockKeyhole } from "lucide-react";
import { redirect } from "next/navigation";
import { acceptHouseholdInvitationAction } from "@/app/(workspace)/family/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isClerkAuthenticationEnabled } from "@/lib/auth/config";

type AccessPendingPageProps = {
  searchParams: Promise<{ join?: string }>;
};

export default async function AccessPendingPage({ searchParams }: AccessPendingPageProps) {
  if (!isClerkAuthenticationEnabled()) {
    redirect("/");
  }

  await auth.protect();
  const { join } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <LockKeyhole className="h-5 w-5" aria-hidden="true" />
          </div>
          <CardTitle>Join your household</CardTitle>
          <CardDescription>
            If a family admin invited this email, you can join now.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {join === "error" ? (
            <p className="text-sm text-destructive" role="alert">
              We could not find an active invitation for this account.
            </p>
          ) : null}
          <form action={acceptHouseholdInvitationAction}>
            <Button type="submit" className="w-full">Join household</Button>
          </form>
          <SignOutButton redirectUrl="/sign-in">
            <button type="button" className={buttonVariants({ variant: "outline" }) + " w-full"}>
              Use another account
            </button>
          </SignOutButton>
        </CardContent>
      </Card>
    </main>
  );
}
