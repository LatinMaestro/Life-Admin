import type { PropsWithChildren, ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/lib/theme";

export function Screen({
  children,
  refreshing = false,
  onRefresh,
}: PropsWithChildren<{ refreshing?: boolean; onRefresh?: () => void }>) {
  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.screen}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.titleBlock}>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function Section({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>
        {title}
      </Text>
      <View style={styles.list}>{children}</View>
    </View>
  );
}

export function Row({
  title,
  detail,
  meta,
  trailing,
}: {
  title: string;
  detail?: string | null;
  meta?: string | null;
  trailing?: ReactNode;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        {detail ? <Text style={styles.rowDetail}>{detail}</Text> : null}
        {meta ? <Text style={styles.rowMeta}>{meta}</Text> : null}
      </View>
      {trailing}
    </View>
  );
}

export function CountTile({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.countTile}>
      <Text style={styles.count}>{value}</Text>
      <Text style={styles.countLabel}>{label}</Text>
    </View>
  );
}

export function StatusView({
  loading,
  error,
  errorCode,
  onRetry,
  empty,
}: {
  loading: boolean;
  error: string | null;
  errorCode?: string | null;
  onRetry: () => void;
  empty?: boolean;
}) {
  if (loading) {
    return (
      <View accessibilityLabel="Loading" style={styles.state}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.stateText}>Loading your household...</Text>
      </View>
    );
  }

  if (error) {
    const accessPending = errorCode === "household_access_required";
    return (
      <View style={styles.state}>
        <Text accessibilityRole="header" style={styles.stateTitle}>
          {accessPending ? "Household access needed" : "Could not load"}
        </Text>
        <Text style={styles.stateText}>
          {accessPending
            ? "Your account is signed in but is not connected to an active household yet."
            : error}
        </Text>
        {!accessPending ? (
          <Pressable accessibilityRole="button" onPress={onRetry} style={styles.button}>
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  if (empty) {
    return (
      <View style={styles.state}>
        <Text style={styles.stateText}>Nothing here right now.</Text>
      </View>
    );
  }

  return null;
}

export function Pill({ children }: PropsWithChildren) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillText}>{children}</Text>
    </View>
  );
}

export const uiStyles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  linkRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    minHeight: 58,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  linkText: { color: colors.text, flex: 1, fontSize: 16, fontWeight: "600" },
  linkHint: { color: colors.muted, fontSize: 20 },
});

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  screen: { gap: 28, paddingBottom: 32, paddingHorizontal: 18, paddingTop: 14 },
  titleBlock: { gap: 4 },
  title: { color: colors.text, fontSize: 28, fontWeight: "700" },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 21 },
  section: { gap: 10 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  list: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 12,
    minHeight: 66,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowText: { flex: 1, gap: 3 },
  rowTitle: { color: colors.text, fontSize: 16, fontWeight: "600" },
  rowDetail: { color: colors.muted, fontSize: 14, lineHeight: 19 },
  rowMeta: { color: colors.primary, fontSize: 13, fontWeight: "600" },
  countTile: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 92,
    padding: 14,
    width: "47%",
  },
  count: { color: colors.text, fontSize: 28, fontWeight: "700" },
  countLabel: { color: colors.muted, fontSize: 14, marginTop: 4 },
  state: { alignItems: "center", gap: 12, paddingHorizontal: 24, paddingVertical: 44 },
  stateTitle: { color: colors.text, fontSize: 20, fontWeight: "700", textAlign: "center" },
  stateText: { color: colors.muted, fontSize: 15, lineHeight: 22, textAlign: "center" },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    minHeight: 46,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  pill: {
    alignSelf: "flex-start",
    backgroundColor: "#E6F0EA",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  pillText: { color: colors.primary, fontSize: 12, fontWeight: "700" },
});
