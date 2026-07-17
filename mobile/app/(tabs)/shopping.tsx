import { Alert } from "react-native";
import { useState } from "react";

import { ActionButton } from "@/components/action-button";
import { PageTitle, Row, Screen, Section, StatusView } from "@/components/ui";
import { useApiResource, useHouseholdMutation } from "@/lib/api";
import type { ShoppingResponse } from "@/lib/contracts";

export default function ShoppingScreen() {
  const state = useApiResource<ShoppingResponse>("/api/v1/shopping");
  const mutate = useHouseholdMutation();
  const [busyId, setBusyId] = useState<string | null>(null);
  const lists = state.data?.lists ?? [];
  const items = state.data?.items ?? [];

  const toggle = async (id: string, checked: boolean) => {
    setBusyId(id);
    try {
      await mutate(`/api/v1/shopping/items/${id}`, { checked });
      await state.refresh();
    } catch (error) {
      Alert.alert("Could not update", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Screen refreshing={state.loading} onRefresh={() => void state.refresh()}>
      <PageTitle title="Shopping" subtitle="The household lists, kept together." />
      <StatusView {...state} empty={Boolean(state.data) && lists.length === 0} onRetry={() => void state.refresh()} />
      {lists.map((list) => {
        const listItems = items.filter((item) => item.shoppingListId === list.id);
        return (
          <Section key={list.id} title={list.name}>
            {listItems.length === 0 ? <Row title="Nothing needed" /> : null}
            {listItems.map((item) => (
              <Row
                key={item.id}
                title={item.label}
                detail={item.notes}
                meta={item.quantity ? `Quantity: ${item.quantity}` : item.category}
                trailing={
                  <ActionButton
                    busy={busyId === item.id}
                    icon={item.checked ? "arrow-undo" : "checkmark"}
                    label={item.checked ? `Put ${item.label} back` : `Check off ${item.label}`}
                    onPress={() => void toggle(item.id, !item.checked)}
                    selected={item.checked}
                  />
                }
              />
            ))}
          </Section>
        );
      })}
    </Screen>
  );
}
