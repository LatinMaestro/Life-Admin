import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isPublicRequestPath } from "@/lib/request-boundary";

const demoProxy = () => NextResponse.next();
const clerkProxy =
  process.env.FAMILY_LIFE_ADMIN_AUTH_MODE === "clerk"
    ? clerkMiddleware(
        async (auth, request) => {
          if (isPublicRequestPath(request.nextUrl.pathname)) {
            return NextResponse.next();
          }

          await auth.protect();
        },
        { signInUrl: "/sign-in" },
      )
    : null;

export default clerkProxy ?? demoProxy;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
