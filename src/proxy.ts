import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const demoProxy = () => NextResponse.next();

export default process.env.FAMILY_LIFE_ADMIN_AUTH_MODE === "clerk"
  ? clerkMiddleware()
  : demoProxy;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
