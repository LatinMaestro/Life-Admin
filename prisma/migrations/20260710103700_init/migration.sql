-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('clerk');

-- CreateEnum
CREATE TYPE "HouseholdRole" AS ENUM ('household_admin', 'household_member');

-- CreateEnum
CREATE TYPE "HouseholdMemberStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('pending', 'accepted', 'expired', 'revoked');

-- CreateEnum
CREATE TYPE "InboxStatus" AS ENUM ('new', 'needs_review', 'linked', 'archived');

-- CreateEnum
CREATE TYPE "InboxCategory" AS ENUM ('school', 'appointment', 'renewal', 'household_admin', 'shopping', 'other');

-- CreateEnum
CREATE TYPE "InboxDestination" AS ENUM ('task', 'reminder', 'bill_or_renewal', 'shopping_list', 'source_reference', 'none');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('low', 'normal', 'high');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('open', 'done', 'archived');

-- CreateEnum
CREATE TYPE "TaskStage" AS ENUM ('capture', 'action', 'review', 'done');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('scheduled', 'done', 'archived');

-- CreateEnum
CREATE TYPE "ReminderCadence" AS ENUM ('once', 'weekly', 'monthly', 'custom');

-- CreateEnum
CREATE TYPE "ShoppingListStatus" AS ENUM ('active', 'archived');

-- CreateEnum
CREATE TYPE "BillOrRenewalType" AS ENUM ('bill', 'renewal');

-- CreateEnum
CREATE TYPE "BillOrRenewalStatus" AS ENUM ('upcoming', 'needs_review', 'scheduled', 'done', 'archived');

-- CreateEnum
CREATE TYPE "SourceReferenceKind" AS ENUM ('source_link', 'source_document_reference', 'source_image_reference', 'source_email_reference', 'source_crop_reference');

-- CreateEnum
CREATE TYPE "SourceReviewStatus" AS ENUM ('needs_review', 'confirmed', 'linked', 'archived');

-- CreateEnum
CREATE TYPE "SourceSensitivity" AS ENUM ('standard', 'sensitive');

-- CreateEnum
CREATE TYPE "CommentEntityType" AS ENUM ('inbox_item', 'task', 'reminder', 'shopping_list', 'shopping_list_item', 'bill_or_renewal', 'source_reference');

-- CreateEnum
CREATE TYPE "ActivityEntityType" AS ENUM ('household', 'member', 'inbox_item', 'task', 'reminder', 'shopping_list', 'shopping_list_item', 'bill_or_renewal', 'source_reference', 'comment');

-- CreateEnum
CREATE TYPE "ActivityEventType" AS ENUM ('created', 'updated', 'assigned', 'completed', 'reopened', 'archived', 'commented', 'linked_source', 'changed_status');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "authProvider" "AuthProvider",
    "authSubject" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Household" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Australia/Brisbane',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Household_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HouseholdMember" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "HouseholdRole" NOT NULL,
    "status" "HouseholdMemberStatus" NOT NULL DEFAULT 'active',
    "displayName" TEXT NOT NULL,
    "initials" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HouseholdMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "invitedEmail" TEXT NOT NULL,
    "role" "HouseholdRole" NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'pending',
    "createdByUserId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InboxItem" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "InboxStatus" NOT NULL DEFAULT 'new',
    "category" "InboxCategory" NOT NULL DEFAULT 'other',
    "priority" "Priority" NOT NULL DEFAULT 'normal',
    "suggestedDestination" "InboxDestination" NOT NULL DEFAULT 'none',
    "routingReason" TEXT,
    "triageSteps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "assignedMemberId" TEXT,
    "createdByMemberId" TEXT NOT NULL,
    "sourceReferenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InboxItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'open',
    "stage" "TaskStage" NOT NULL DEFAULT 'capture',
    "priority" "Priority" NOT NULL DEFAULT 'normal',
    "dueAt" TIMESTAMP(3),
    "checklist" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "assignedMemberId" TEXT,
    "createdByMemberId" TEXT NOT NULL,
    "sourceReferenceId" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "remindAt" TIMESTAMP(3),
    "status" "ReminderStatus" NOT NULL DEFAULT 'scheduled',
    "cadence" "ReminderCadence" NOT NULL DEFAULT 'once',
    "linkedEntityType" "ActivityEntityType",
    "linkedEntityId" TEXT,
    "assignedMemberId" TEXT,
    "createdByMemberId" TEXT NOT NULL,
    "recurrenceRuleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurrenceRule" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "byDay" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecurrenceRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShoppingList" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ShoppingListStatus" NOT NULL DEFAULT 'active',
    "createdByMemberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShoppingList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShoppingListItem" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "shoppingListId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "notes" TEXT,
    "quantity" TEXT,
    "category" TEXT,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "assignedMemberId" TEXT,
    "createdByMemberId" TEXT NOT NULL,
    "checkedByMemberId" TEXT,
    "checkedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShoppingListItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillOrRenewal" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "provider" TEXT,
    "type" "BillOrRenewalType" NOT NULL,
    "status" "BillOrRenewalStatus" NOT NULL DEFAULT 'upcoming',
    "dueAt" TIMESTAMP(3),
    "renewalAt" TIMESTAMP(3),
    "reminderWindow" TEXT,
    "nextStep" TEXT,
    "reviewChecklist" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "assignedMemberId" TEXT,
    "createdByMemberId" TEXT NOT NULL,
    "sourceReferenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillOrRenewal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillReminder" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "billOrRenewalId" TEXT NOT NULL,
    "remindAt" TIMESTAMP(3) NOT NULL,
    "status" "ReminderStatus" NOT NULL DEFAULT 'scheduled',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceReference" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" "SourceReferenceKind" NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT,
    "externalRef" TEXT,
    "reviewStatus" "SourceReviewStatus" NOT NULL DEFAULT 'needs_review',
    "sensitivity" "SourceSensitivity" NOT NULL DEFAULT 'standard',
    "handlingNotes" TEXT,
    "createdByMemberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SourceReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "entityType" "CommentEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdByUserId" TEXT,
    "createdByMemberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityEvent" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actorMemberId" TEXT,
    "entityType" "ActivityEntityType" NOT NULL,
    "entityId" TEXT,
    "eventType" "ActivityEventType" NOT NULL,
    "summary" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HouseholdSettings" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "defaultTimezone" TEXT NOT NULL DEFAULT 'Australia/Brisbane',
    "dashboardPreferences" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HouseholdSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_authProvider_authSubject_key" ON "User"("authProvider", "authSubject");

-- CreateIndex
CREATE INDEX "HouseholdMember_householdId_role_idx" ON "HouseholdMember"("householdId", "role");

-- CreateIndex
CREATE INDEX "HouseholdMember_userId_idx" ON "HouseholdMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HouseholdMember_householdId_userId_key" ON "HouseholdMember"("householdId", "userId");

-- CreateIndex
CREATE INDEX "Invitation_householdId_status_idx" ON "Invitation"("householdId", "status");

-- CreateIndex
CREATE INDEX "Invitation_invitedEmail_idx" ON "Invitation"("invitedEmail");

-- CreateIndex
CREATE INDEX "InboxItem_householdId_status_idx" ON "InboxItem"("householdId", "status");

-- CreateIndex
CREATE INDEX "InboxItem_householdId_priority_idx" ON "InboxItem"("householdId", "priority");

-- CreateIndex
CREATE INDEX "InboxItem_assignedMemberId_idx" ON "InboxItem"("assignedMemberId");

-- CreateIndex
CREATE INDEX "Task_householdId_status_idx" ON "Task"("householdId", "status");

-- CreateIndex
CREATE INDEX "Task_householdId_dueAt_idx" ON "Task"("householdId", "dueAt");

-- CreateIndex
CREATE INDEX "Task_assignedMemberId_idx" ON "Task"("assignedMemberId");

-- CreateIndex
CREATE INDEX "Reminder_householdId_status_idx" ON "Reminder"("householdId", "status");

-- CreateIndex
CREATE INDEX "Reminder_householdId_remindAt_idx" ON "Reminder"("householdId", "remindAt");

-- CreateIndex
CREATE INDEX "Reminder_assignedMemberId_idx" ON "Reminder"("assignedMemberId");

-- CreateIndex
CREATE INDEX "RecurrenceRule_householdId_idx" ON "RecurrenceRule"("householdId");

-- CreateIndex
CREATE INDEX "ShoppingList_householdId_status_idx" ON "ShoppingList"("householdId", "status");

-- CreateIndex
CREATE INDEX "ShoppingListItem_householdId_checked_idx" ON "ShoppingListItem"("householdId", "checked");

-- CreateIndex
CREATE INDEX "ShoppingListItem_shoppingListId_idx" ON "ShoppingListItem"("shoppingListId");

-- CreateIndex
CREATE INDEX "ShoppingListItem_assignedMemberId_idx" ON "ShoppingListItem"("assignedMemberId");

-- CreateIndex
CREATE INDEX "BillOrRenewal_householdId_status_idx" ON "BillOrRenewal"("householdId", "status");

-- CreateIndex
CREATE INDEX "BillOrRenewal_householdId_dueAt_idx" ON "BillOrRenewal"("householdId", "dueAt");

-- CreateIndex
CREATE INDEX "BillOrRenewal_householdId_renewalAt_idx" ON "BillOrRenewal"("householdId", "renewalAt");

-- CreateIndex
CREATE INDEX "BillOrRenewal_assignedMemberId_idx" ON "BillOrRenewal"("assignedMemberId");

-- CreateIndex
CREATE INDEX "BillReminder_householdId_status_idx" ON "BillReminder"("householdId", "status");

-- CreateIndex
CREATE INDEX "BillReminder_householdId_remindAt_idx" ON "BillReminder"("householdId", "remindAt");

-- CreateIndex
CREATE INDEX "BillReminder_billOrRenewalId_idx" ON "BillReminder"("billOrRenewalId");

-- CreateIndex
CREATE INDEX "SourceReference_householdId_reviewStatus_idx" ON "SourceReference"("householdId", "reviewStatus");

-- CreateIndex
CREATE INDEX "SourceReference_householdId_sensitivity_idx" ON "SourceReference"("householdId", "sensitivity");

-- CreateIndex
CREATE INDEX "Comment_householdId_entityType_entityId_idx" ON "Comment"("householdId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "Comment_createdByMemberId_idx" ON "Comment"("createdByMemberId");

-- CreateIndex
CREATE INDEX "ActivityEvent_householdId_createdAt_idx" ON "ActivityEvent"("householdId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityEvent_householdId_entityType_entityId_idx" ON "ActivityEvent"("householdId", "entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "HouseholdSettings_householdId_key" ON "HouseholdSettings"("householdId");

-- AddForeignKey
ALTER TABLE "HouseholdMember" ADD CONSTRAINT "HouseholdMember_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseholdMember" ADD CONSTRAINT "HouseholdMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboxItem" ADD CONSTRAINT "InboxItem_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboxItem" ADD CONSTRAINT "InboxItem_assignedMemberId_fkey" FOREIGN KEY ("assignedMemberId") REFERENCES "HouseholdMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboxItem" ADD CONSTRAINT "InboxItem_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "HouseholdMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboxItem" ADD CONSTRAINT "InboxItem_sourceReferenceId_fkey" FOREIGN KEY ("sourceReferenceId") REFERENCES "SourceReference"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedMemberId_fkey" FOREIGN KEY ("assignedMemberId") REFERENCES "HouseholdMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "HouseholdMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_sourceReferenceId_fkey" FOREIGN KEY ("sourceReferenceId") REFERENCES "SourceReference"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_assignedMemberId_fkey" FOREIGN KEY ("assignedMemberId") REFERENCES "HouseholdMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "HouseholdMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_recurrenceRuleId_fkey" FOREIGN KEY ("recurrenceRuleId") REFERENCES "RecurrenceRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurrenceRule" ADD CONSTRAINT "RecurrenceRule_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingList" ADD CONSTRAINT "ShoppingList_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingList" ADD CONSTRAINT "ShoppingList_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "HouseholdMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_shoppingListId_fkey" FOREIGN KEY ("shoppingListId") REFERENCES "ShoppingList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_assignedMemberId_fkey" FOREIGN KEY ("assignedMemberId") REFERENCES "HouseholdMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "HouseholdMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_checkedByMemberId_fkey" FOREIGN KEY ("checkedByMemberId") REFERENCES "HouseholdMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillOrRenewal" ADD CONSTRAINT "BillOrRenewal_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillOrRenewal" ADD CONSTRAINT "BillOrRenewal_assignedMemberId_fkey" FOREIGN KEY ("assignedMemberId") REFERENCES "HouseholdMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillOrRenewal" ADD CONSTRAINT "BillOrRenewal_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "HouseholdMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillOrRenewal" ADD CONSTRAINT "BillOrRenewal_sourceReferenceId_fkey" FOREIGN KEY ("sourceReferenceId") REFERENCES "SourceReference"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillReminder" ADD CONSTRAINT "BillReminder_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillReminder" ADD CONSTRAINT "BillReminder_billOrRenewalId_fkey" FOREIGN KEY ("billOrRenewalId") REFERENCES "BillOrRenewal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceReference" ADD CONSTRAINT "SourceReference_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceReference" ADD CONSTRAINT "SourceReference_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "HouseholdMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "HouseholdMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityEvent" ADD CONSTRAINT "ActivityEvent_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityEvent" ADD CONSTRAINT "ActivityEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityEvent" ADD CONSTRAINT "ActivityEvent_actorMemberId_fkey" FOREIGN KEY ("actorMemberId") REFERENCES "HouseholdMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseholdSettings" ADD CONSTRAINT "HouseholdSettings_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

