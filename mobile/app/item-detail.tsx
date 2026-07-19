import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/primary-button";
import { PageTitle, Pill, Row, Screen, Section, StatusView } from "@/components/ui";
import { formatDate, useApiResource } from "@/lib/api";
import type { ItemDetailResponse, ItemEntityType } from "@/lib/contracts";
import { colors } from "@/lib/theme";

const entityTypes = new Set<ItemEntityType>([
  "inbox_item",
  "task",
  "reminder",
  "shopping_list",
  "bill_or_renewal",
  "source_reference",
]);

export default function ItemDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    entityType?: string;
    itemId?: string;
  }>();
  const entityType = entityTypes.has(params.entityType as ItemEntityType)
    ? (params.entityType as ItemEntityType)
    : "task";
  const itemId = typeof params.itemId === "string" ? params.itemId : "invalid";
  const state = useApiResource<ItemDetailResponse>(
    `/api/v1/items/${entityType}/${itemId}`,
  );

  if (!state.data) {
    return (
      <Screen>
        <PageTitle title="Item details" />
        <StatusView {...state} onRetry={() => void state.refresh()} />
      </Screen>
    );
  }

  const { item, comments, activity } = state.data;

  return (
    <Screen refreshing={state.loading} onRefresh={() => void state.refresh()}>
      <View style={styles.heading}>
        <PageTitle title={item.title} subtitle={item.description ?? undefined} />
        <Pill>{item.status.replaceAll("_", " ")}</Pill>
      </View>

      <Section title="Details">
        {item.assignedTo ? <Row title="Assigned to" meta={item.assignedTo} /> : null}
        {item.details.map((detail) => (
          <Row
            key={detail.label}
            title={detail.label}
            meta={detail.value && detail.value.includes("T")
              ? formatDate(detail.value)
              : detail.value}
          />
        ))}
        {item.source ? (
          <Row
            title="Original source"
            detail={item.source.label}
            trailing={item.source.url ? (
              <Pressable
                accessibilityLabel="Open original source"
                accessibilityRole="link"
                onPress={() => void Linking.openURL(item.source!.url!)}
                style={styles.sourceButton}
              >
                <Ionicons color={colors.primary} name="open-outline" size={21} />
              </Pressable>
            ) : null}
          />
        ) : null}
      </Section>

      {item.entityType === "inbox_item" && item.status !== "linked" ? (
        <PrimaryButton
          icon="checkmark"
          label="Sort inbox item"
          onPress={() =>
            router.push({
              pathname: "/route-inbox",
              params: { itemId: item.id },
            })
          }
        />
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={() =>
          router.push({
            pathname: "/edit-item",
            params: { entityType: item.entityType, itemId: item.id },
          })
        }
        style={styles.editButton}
      >
        <Ionicons color={colors.primary} name="create-outline" size={20} />
        <Text style={styles.editText}>Edit item</Text>
      </Pressable>

      <PrimaryButton
        icon="add"
        label="Add comment"
        onPress={() =>
          router.push({
            pathname: "/new-comment",
            params: { entityType: item.entityType, entityId: item.id },
          })
        }
      />

      <Section title="Comments">
        {comments.length === 0 ? <Row title="No comments yet" /> : null}
        {comments.map((comment) => (
          <Row
            key={comment.id}
            title={comment.body}
            detail={comment.author}
            meta={formatDate(comment.createdAt)}
          />
        ))}
      </Section>

      {activity.length > 0 ? (
        <Section title="History">
          {activity.map((event) => (
            <Row
              key={event.id}
              title={event.summary}
              meta={formatDate(event.createdAt)}
            />
          ))}
        </Section>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { alignItems: "flex-start", gap: 10 },
  editButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 48,
  },
  editText: { color: colors.primary, fontSize: 16, fontWeight: "700" },
  sourceButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
});
