import { PageTitle, Pill, Row, Screen, Section, StatusView } from "@/components/ui";
import { useApiResource } from "@/lib/api";
import type { BootstrapResponse } from "@/lib/contracts";

export default function FamilyScreen() {
  const state = useApiResource<BootstrapResponse>("/api/v1/bootstrap");
  const members = state.data?.members ?? [];

  return (
    <Screen refreshing={state.loading} onRefresh={() => void state.refresh()}>
      <PageTitle title="Family" subtitle="People with access to this household." />
      <StatusView {...state} onRetry={() => void state.refresh()} />
      {members.length > 0 ? (
        <Section title="Members">
          {members.map((member) => (
            <Row
              key={member.id}
              title={member.displayName}
              meta={member.role === "household_admin" ? "Household admin" : "Household member"}
              trailing={member.id === state.data?.currentMember.id ? <Pill>You</Pill> : null}
            />
          ))}
        </Section>
      ) : null}
    </Screen>
  );
}
