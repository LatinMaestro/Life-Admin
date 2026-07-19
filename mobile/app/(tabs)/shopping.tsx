import { Alert, Pressable, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

import { ActionButton } from "@/components/action-button";
import { PrimaryButton } from "@/components/primary-button";
import { PageTitle, Row, Screen, Section, StatusView } from "@/components/ui";
import { useApiResource, useHouseholdMutation } from "@/lib/api";
import type { ShoppingResponse } from "@/lib/contracts";
import { colors } from "@/lib/theme";

export default function ShoppingScreen() {
  const router = useRouter();
  const state = useApiResource<ShoppingResponse>("/api/v1/shopping");
  const mutate = useHouseholdMutation();
  const [busyId, setBusyId] = useState<string | null>(null);
  const lists = (state.data?.lists ?? []).filter((list) => list.status === "active");
  const items = state.data?.items ?? [];
  const hasLists = lists.length > 0;

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
      <PrimaryButton
        label={hasLists ? "Add item" : "Create your first list"}
        onPress={() => router.push(hasLists ? "/new-shopping-item" : "/new-shopping-list")}
      />
      {hasLists ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/new-shopping-list")}
          style={styles.newList}
        >
          <Text style={styles.newListText}>New list</Text>
        </Pressable>
      ) : null}
      <StatusView {...state} empty={Boolean(state.data) && !hasLists} onRetry={() => void state.refresh()} />
      {lists.map((list) => {
        const listItems = items.filter((item) => item.shoppingListId === list.id);
        return (
          <Section
            key={list.id}
            title={list.name}
            action={
              <ActionButton
                icon="chevron-forward"
                label={`Open ${list.name}`}
                onPress={() => router.push({
                  pathname: "/item-detail",
                  params: { entityType: "shopping_list", itemId: list.id },
                })}
              />
            }
          >
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

const styles = StyleSheet.create({
  newList: {
    alignItems: "center",
    alignSelf: "flex-start",
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  newListText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700",
  },
});
