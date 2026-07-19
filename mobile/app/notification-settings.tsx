import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { PageTitle, Row, Screen, Section, StatusView } from "@/components/ui";
import { useApiResource, useHouseholdMutation } from "@/lib/api";
import type { NotificationPreferencesResponse } from "@/lib/contracts";
import {
  disablePushNotifications,
  enablePushNotifications,
} from "@/lib/notifications";
import { colors } from "@/lib/theme";

export default function NotificationSettingsScreen() {
  const state = useApiResource<NotificationPreferencesResponse>("/api/v1/notifications/preferences");
  const mutate = useHouseholdMutation();
  const [saving, setSaving] = useState(false);
  const preference = state.data?.preference;

  const update = async (body: Record<string, boolean>) => {
    setSaving(true);
    try {
      await mutate("/api/v1/notifications/preferences", body, "PATCH");
      await state.refresh();
    } catch (error) {
      Alert.alert("Could not update notifications", message(error));
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async () => {
    setSaving(true);
    try {
      if (preference?.enabled) {
        await disablePushNotifications(mutate);
      } else {
        await enablePushNotifications(mutate);
      }
      await state.refresh();
    } catch (error) {
      Alert.alert("Could not update notifications", message(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen refreshing={state.loading} onRefresh={() => void state.refresh()}>
      <PageTitle
        title="Notifications"
        subtitle="Choose the household reminders you want on this device."
      />
      <StatusView {...state} onRetry={() => void state.refresh()} />
      {preference ? (
        <>
          <Section title="On this device">
            <Row
              title={preference.enabled ? "Notifications on" : "Notifications off"}
              detail={preference.enabled
                ? `Quiet from ${preference.quietStart} to ${preference.quietEnd}`
                : "Nothing is sent until you choose to enable notifications."}
              trailing={(
                <Switch
                  accessibilityLabel="Allow notifications on this device"
                  disabled={saving}
                  onValueChange={() => void toggleEnabled()}
                  value={preference.enabled}
                />
              )}
            />
          </Section>

          {preference.enabled ? (
            <>
              <Section title="Remind me about">
                <PreferenceSwitch label="Tasks" field="tasksEnabled" value={preference.tasksEnabled} saving={saving} onChange={update} />
                <PreferenceSwitch label="Reminders" field="remindersEnabled" value={preference.remindersEnabled} saving={saving} onChange={update} />
                <PreferenceSwitch label="Bills" field="billsEnabled" value={preference.billsEnabled} saving={saving} onChange={update} />
                <PreferenceSwitch label="Renewals" field="renewalsEnabled" value={preference.renewalsEnabled} saving={saving} onChange={update} />
                <PreferenceSwitch label="Items ready to review" field="intakeEnabled" value={preference.intakeEnabled} saving={saving} onChange={update} />
              </Section>
              <Section title="Lock screen">
                <Row
                  title="Show item names"
                  detail="Off keeps notification text general for privacy."
                  trailing={(
                    <Switch
                      accessibilityLabel="Show item names in notifications"
                      disabled={saving}
                      onValueChange={(value) => void update({ showPreview: value })}
                      value={preference.showPreview}
                    />
                  )}
                />
              </Section>
            </>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

function PreferenceSwitch({
  field,
  label,
  onChange,
  saving,
  value,
}: {
  field: "tasksEnabled" | "remindersEnabled" | "billsEnabled" | "renewalsEnabled" | "intakeEnabled";
  label: string;
  onChange: (body: Record<string, boolean>) => Promise<void>;
  saving: boolean;
  value: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        accessibilityLabel={label}
        disabled={saving}
        onValueChange={(next) => void onChange({ [field]: next })}
        value={value}
      />
    </View>
  );
}

function message(error: unknown) {
  return error instanceof Error ? error.message : "Please try again.";
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    minHeight: 56,
    paddingHorizontal: 16,
  },
  label: { color: colors.text, flex: 1, fontSize: 16, fontWeight: "600" },
});
