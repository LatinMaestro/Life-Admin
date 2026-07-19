import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DateField } from "@/components/date-field";
import { PrimaryButton } from "@/components/primary-button";
import { toCalendarDateValue, useHouseholdMutation } from "@/lib/api";
import { colors } from "@/lib/theme";

export default function EditOccurrenceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ occurrenceId?: string; localDate?: string }>();
  const occurrenceId = typeof params.occurrenceId === "string" ? params.occurrenceId : "invalid";
  const [date, setDate] = useState(() => params.localDate ? new Date(`${params.localDate}T00:00:00`) : new Date());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const mutate = useHouseholdMutation();

  const save = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await mutate(`/api/v1/recurrence/occurrences/${occurrenceId}`, {
        action: "reschedule",
        localDate: toCalendarDateValue(date),
      });
      router.back();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.screen}>
      <DateField label="New date" value={date} onChange={setDate} />
      <Text style={styles.help}>Only this occurrence will move. The rest of the schedule stays unchanged.</Text>
      {message ? <Text accessibilityLiveRegion="polite" style={styles.error}>{message}</Text> : null}
      <PrimaryButton busy={busy} icon="checkmark" label="Move occurrence" onPress={() => void save()} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1, gap: 16, padding: 18 },
  help: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
});
