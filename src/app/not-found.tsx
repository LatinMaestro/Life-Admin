import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Page not found</CardTitle>
        <CardDescription>This placeholder route is not part of the current app foundation.</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/" className={buttonVariants({ variant: "default" })}>
          Back to dashboard
        </Link>
      </CardContent>
    </Card>
  );
}
