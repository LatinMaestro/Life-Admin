import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

import { ActionButton } from "@/components/action-button";
import { PrimaryButton } from "@/components/primary-button";
import { PageTitle, Pill, Row, Screen, Section, StatusView } from "@/components/ui";
import { formatDate, useApiResource, useHouseholdMutation } from "@/lib/api";
import type { BootstrapResponse, FamilyResponse } from "@/lib/contracts";

export default function FamilyScreen() {
  const router = useRouter();
  const state = useApiResource<BootstrapResponse>("/api/v1/bootstrap");
  const family = useApiResource<FamilyResponse>("/api/v1/family");
  const mutate = useHouseholdMutation();
  const [busyId, setBusyId] = useState<string | null>(null);
  const members = state.data?.members ?? [];
  const invitations = family.data?.invitations ?? [];
  const canManage = state.data?.capabilities.canManageMembers ?? false;

  const revoke = async (id: string) => {
    setBusyId(id);
    try {
      await mutate(`/api/v1/family/invitations/${id}`, {}, "DELETE");
      await family.refresh();
    } catch (error) {
      Alert.alert("Could not cancel invitation", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Screen
      refreshing={state.loading || family.loading}
      onRefresh={() => void Promise.all([state.refresh(), family.refresh()])}
    >
      <PageTitle title="Family" subtitle="People with access to this household." />
      {canManage ? <PrimaryButton label="Add family member" onPress={() => router.push("/invite-member")} /> : null}
      <StatusView {...state} onRetry={() => void state.refresh()} />
      {members.length > 0 ? (
        <Section title="Members">
          {members.map((member) => {
            const isCurrent = member.id === state.data?.currentMember.id;
            return (
              <Row
                key={member.id}
                title={member.displayName}
                meta={member.role === "household_admin" ? "Household admin" : "Household member"}
                trailing={
                  isCurrent ? (
                    <Pill>You</Pill>
                  ) : canManage ? (
                    <ActionButton
                      icon="settings-outline"
                      label={`Manage ${member.displayName}`}
                      onPress={() => router.push({
                        pathname: "/manage-member",
                        params: { memberId: member.id, name: member.displayName, role: member.role },
                      })}
                    />
                  ) : null
                }
              />
            );
          })}
        </Section>
      ) : null}
      {canManage && invitations.length > 0 ? (
        <Section title="Invitations">
          {invitations.map((invitation) => (
            <Row
              key={invitation.id}
              title={invitation.invitedEmail}
              detail={invitation.role === "household_admin" ? "Household admin" : "Household member"}
              meta={invitation.expiresAt ? `Expires ${formatDate(invitation.expiresAt)}` : "Pending"}
              trailing={
                <ActionButton
                  busy={busyId === invitation.id}
                  icon="close"
                  label={`Cancel invitation for ${invitation.invitedEmail}`}
                  onPress={() => void revoke(invitation.id)}
                />
              }
            />
          ))}
        </Section>
      ) : null}
    </Screen>
  );
}
