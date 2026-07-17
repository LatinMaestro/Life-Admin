CREATE TYPE "AccountDeletionStatus" AS ENUM ('pending', 'completed', 'failed');

CREATE TABLE "AccountDeletionRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "authSubject" TEXT NOT NULL,
    "status" "AccountDeletionStatus" NOT NULL DEFAULT 'pending',
    "failureReason" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AccountDeletionRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AccountDeletionRequest_userId_status_idx"
ON "AccountDeletionRequest"("userId", "status");

CREATE INDEX "AccountDeletionRequest_authSubject_status_idx"
ON "AccountDeletionRequest"("authSubject", "status");
