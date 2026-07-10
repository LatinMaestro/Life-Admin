import "server-only";

import { auth } from "@clerk/nextjs/server";
import type { AuthSession } from "@/lib/auth/session";
import { getPrismaClient } from "@/lib/server/prisma";

export async function getClerkAuthSession(): Promise<AuthSession | null> {
  const { userId: clerkSubject } = await auth();

  if (!clerkSubject) {
    return null;
  }

  const user = await getPrismaClient().user.findUnique({
    where: {
      authProvider_authSubject: {
        authProvider: "clerk",
        authSubject: clerkSubject,
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      displayName: user.name,
    },
  };
}
