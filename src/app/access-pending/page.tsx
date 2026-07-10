import { SignOutButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { LockKeyhole } from "lucide-react";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isClerkAuthenticationEnabled } from "@/lib/auth/config";

export default async function AccessPendingPage() {
  if (!isClerkAuthenticationEnabled()) {
    redirect("/");
  }

  await auth.protect();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <LockKeyhole className="h-5 w-5" aria-hidden="true" />
          </div>
          <CardTitle>Household access is not ready</CardTitle>
          <CardDescription>
            This account has not been linked to an active household member yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Ask a household admin to confirm your access, or use another account.
          </p>
          <SignOutButton redirectUrl="/sign-in">
            <button type="button" className={buttonVariants({ variant: "default" })}>
              Use another account
            </button>
          </SignOutButton>
        </CardContent>
      </Card>
    </main>
  );
}
