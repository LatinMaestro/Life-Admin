import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { Home, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isClerkAuthenticationEnabled } from "@/lib/auth/config";

export default function SignInPage() {
  const clerkEnabled = isClerkAuthenticationEnabled();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Family Life Admin</p>
            <h1 className="text-xl font-semibold">Your household workspace</h1>
          </div>
        </div>

        {clerkEnabled ? (
          <SignIn
            path="/sign-in"
            routing="path"
            fallbackRedirectUrl="/"
            withSignUp={false}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Sign-in is not active</CardTitle>
              <CardDescription>This preview is using the shared household demo.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/" className={buttonVariants({ variant: "default" })}>
                <Home className="h-4 w-4" aria-hidden="true" />
                Open household
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
