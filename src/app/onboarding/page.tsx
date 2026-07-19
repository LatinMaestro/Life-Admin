import { SignOutButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Home, Users } from "lucide-react";
import { redirect } from "next/navigation";
import {
  acceptOnboardingInvitationAction,
  createFirstHouseholdAction,
} from "@/app/onboarding/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isClerkAuthenticationEnabled } from "@/lib/auth/config";
import { getCurrentHouseholdOnboardingState } from "@/lib/server/household-onboarding";

type OnboardingPageProps = {
  searchParams: Promise<{ create?: string; join?: string }>;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  if (!isClerkAuthenticationEnabled()) redirect("/");

  await auth.protect();
  const [state, query] = await Promise.all([
    getCurrentHouseholdOnboardingState(),
    searchParams,
  ]);

  if (state.status === "ready") redirect("/");

  const hasError = Boolean(query.create || query.join);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            {state.status === "invited" ? (
              <Users className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Home className="h-5 w-5" aria-hidden="true" />
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Family Life Admin</p>
            <h1 className="text-xl font-semibold">Welcome, {state.displayName}</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {state.status === "invited"
                ? `Join ${state.invitation?.householdName}`
                : "Create your household"}
            </CardTitle>
            <CardDescription>
              {state.status === "invited"
                ? "Your family has invited you to its shared household workspace."
                : "This is the private space your family will share."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasError ? (
              <p className="text-sm text-destructive" role="alert">
                We could not complete that setup. Check the details and try again.
              </p>
            ) : null}

            {state.status === "invited" ? (
              <form action={acceptOnboardingInvitationAction}>
                <Button type="submit" className="w-full">Join household</Button>
              </form>
            ) : (
              <form action={createFirstHouseholdAction} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="householdName" className="text-sm font-medium">
                    Household name
                  </label>
                  <input
                    id="householdName"
                    name="householdName"
                    autoComplete="organization"
                    minLength={2}
                    maxLength={80}
                    placeholder="The Taylor household"
                    required
                    className="flex min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <Button type="submit" className="w-full">Create household</Button>
              </form>
            )}

            <SignOutButton redirectUrl="/sign-in">
              <button
                type="button"
                className={buttonVariants({ variant: "outline" }) + " w-full"}
              >
                Use another account
              </button>
            </SignOutButton>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
