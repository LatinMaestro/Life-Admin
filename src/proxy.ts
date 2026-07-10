import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const demoProxy = () => NextResponse.next();
const clerkProxy =
  process.env.FAMILY_LIFE_ADMIN_AUTH_MODE === "clerk"
    ? clerkMiddleware(async (auth, request) => {
        const pathname = request.nextUrl.pathname;
        const isPublic =
          pathname.startsWith("/sign-in") || pathname.startsWith("/__clerk");

        if (isPublic) {
          return NextResponse.next();
        }

        await auth.protect();
      })
    : null;

export default clerkProxy ?? demoProxy;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
