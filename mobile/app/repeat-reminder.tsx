import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActionButton } from "@/components/action-button";
import { DateField } from "@/components/date-field";
import { PrimaryButton } from "@/components/primary-button";
import { Row, Section, StatusView } from "@/components/ui";
import { formatDate, toCalendarDateValue, useApiResource, useHouseholdMutation } from "@/lib/api";
import type { RecurrenceResponse } from "@/lib/contracts";
import { colors } from "@/lib/theme";

const frequencyChoices = [
  ["daily", "Daily"],
  ["weekly", "Weekly"],
  ["monthly", "Monthly"],
  ["yearly", "Yearly"],
  ["custom", "Custom"],
] as const;
const weekdays = [
  ["MO", "Mon"], ["TU", "Tue"], ["WE", "Wed"], ["TH", "Thu"],
  ["FR", "Fri"], ["SA", "Sat"], ["SU", "Sun"],
] as const;

export default function RepeatReminderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ reminderId?: string; date?: string; title?: string }>();
  const reminderId = typeof params.reminderId === "string" ? params.reminderId : "invalid";
  const state = useApiResource<RecurrenceResponse>(`/api/v1/recurrence?reminderId=${reminderId}`);
  const mutate = useHouseholdMutation();
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly" | "yearly" | "custom">("weekly");
  const [interval, setInterval] = useState("1");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startsOn, setStartsOn] = useState(() => params.date ? new Date(params.date) : new Date());
  const [endsOn, setEndsOn] = useState<Date | null>(null);
  const [limit, setLimit] = useState("12");
  const [localTime, setLocalTime] = useState("09:00");
  const [monthEndPolicy, setMonthEndPolicy] = useState<"clamp" | "skip" | "last_day">("clamp");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const create = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await mutate("/api/v1/recurrence", {
        reminderId,
        frequency,
        interval: Number(interval),
        byDay: selectedDays,
        startsOn: toCalendarDateValue(startsOn),
        endsOn: endsOn ? toCalendarDateValue(endsOn) : null,
        occurrenceLimit: limit ? Number(limit) : null,
        localTime,
        monthEndPolicy,
      }, "POST");
      await state.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const changeState = async (action: "pause" | "resume" | "end") => {
    const run = async () => {
      if (!state.data?.series) return;
      setBusy(true);
      try {
        await mutate(`/api/v1/recurrence/${state.data.series.id}`, { action });
        await state.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Please try again.");
      } finally {
        setBusy(false);
      }
    };
    if (action === "end") {
      Alert.alert("End this repeat schedule?", "Future occurrences will be cancelled.", [
        { text: "Cancel", style: "cancel" },
        { text: "End schedule", style: "destructive", onPress: () => void run() },
      ]);
    } else {
      await run();
    }
  };

  const skip = (id: string, localDate: string) => {
    Alert.alert("Skip this occurrence?", formatDate(localDate) ?? localDate, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Skip",
        onPress: () => void (async () => {
          setBusy(true);
          try {
            await mutate(`/api/v1/recurrence/occurrences/${id}`, { action: "skip" });
            await state.refresh();
          } catch (error) {
            setMessage(error instanceof Error ? error.message : "Please try again.");
          } finally {
            setBusy(false);
          }
        })(),
      },
    ]);
  };

  if (!state.data) {
    return <SafeAreaView edges={["bottom"]} style={styles.safeArea}><StatusView {...state} onRetry={() => void state.refresh()} /></SafeAreaView>;
  }

  const series = state.data.series;
  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.form}>
        <View style={styles.intro}>
          <Text accessibilityRole="header" style={styles.title}>{params.title ?? "Repeat reminder"}</Text>
          <Text style={styles.help}>Set the schedule once. Individual dates can still be moved or skipped.</Text>
        </View>

        {series ? (
          <>
            <Section title="Schedule">
              <Row title={label(series.frequency)} detail={series.interval > 1 ? `Every ${series.interval} intervals` : null} meta={label(series.state)} />
              <Row title="Starts" meta={formatDate(series.startsOn)} />
              {series.endsOn ? <Row title="Ends" meta={formatDate(series.endsOn)} /> : null}
            </Section>
            <View style={styles.actions}>
              {series.state !== "ended" ? (
                <Pressable
                  accessibilityRole="button"
                  disabled={busy}
                  onPress={() => void changeState(series.state === "paused" ? "resume" : "pause")}
                  style={styles.outlineButton}
                >
                  <Text style={styles.outlineText}>{series.state === "paused" ? "Resume" : "Pause"}</Text>
                </Pressable>
              ) : null}
              {series.state !== "ended" ? (
                <Pressable accessibilityRole="button" disabled={busy} onPress={() => void changeState("end")} style={styles.dangerButton}>
                  <Text style={styles.dangerText}>End schedule</Text>
                </Pressable>
              ) : null}
            </View>
            <Section title="Occurrences">
              {series.occurrences.map((occurrence) => (
                <Row
                  key={occurrence.id}
                  title={formatDate(occurrence.localDate) ?? occurrence.localDate}
                  meta={label(occurrence.state)}
                  trailing={occurrence.state === "scheduled" ? (
                    <View style={styles.rowActions}>
                      <ActionButton
                        icon="calendar-outline"
                        label="Move occurrence"
                        onPress={() => router.push({
                          pathname: "/edit-occurrence",
                          params: { occurrenceId: occurrence.id, localDate: occurrence.localDate },
                        })}
                      />
                      <ActionButton icon="play-skip-forward-outline" label="Skip occurrence" onPress={() => skip(occurrence.id, occurrence.localDate)} />
                    </View>
                  ) : null}
                />
              ))}
            </Section>
          </>
        ) : (
          <>
            <Choice label="Repeats" value={frequency} onChange={(value) => setFrequency(value as typeof frequency)} choices={frequencyChoices} />
            <Text style={styles.label}>Every</Text>
            <TextInput accessibilityLabel="Repeat interval" keyboardType="number-pad" onChangeText={setInterval} style={styles.input} value={interval} />
            {(frequency === "weekly" || frequency === "custom") ? (
              <Choice label="Days" value={selectedDays} onChangeMany={setSelectedDays} choices={weekdays} />
            ) : null}
            <DateField label="Starts" value={startsOn} onChange={setStartsOn} />
            <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: Boolean(endsOn) }} onPress={() => setEndsOn(endsOn ? null : startsOn)} style={styles.checkbox}>
              <View style={[styles.box, endsOn && styles.boxChecked]} />
              <Text style={styles.checkboxText}>Set an end date</Text>
            </Pressable>
            {endsOn ? <DateField label="Ends" value={endsOn} onChange={setEndsOn} /> : null}
            <Text style={styles.label}>Maximum occurrences</Text>
            <TextInput accessibilityLabel="Maximum occurrences" keyboardType="number-pad" onChangeText={setLimit} style={styles.input} value={limit} />
            <Text style={styles.label}>Reminder time</Text>
            <TextInput accessibilityLabel="Reminder time" keyboardType="numbers-and-punctuation" onChangeText={setLocalTime} placeholder="09:00" style={styles.input} value={localTime} />
            {(frequency === "monthly" || frequency === "yearly") ? (
              <Choice label="Short months" value={monthEndPolicy} onChange={(value) => setMonthEndPolicy(value as typeof monthEndPolicy)} choices={[
                ["clamp", "Last valid day"], ["skip", "Skip month"], ["last_day", "Always month end"],
              ]} />
            ) : null}
            {message ? <Text accessibilityLiveRegion="polite" style={styles.error}>{message}</Text> : null}
            <PrimaryButton busy={busy} disabled={!interval || !limit || (frequency === "weekly" && selectedDays.length === 0)} icon="checkmark" label="Start repeating" onPress={() => void create()} />
          </>
        )}
        {message && series ? <Text accessibilityLiveRegion="polite" style={styles.error}>{message}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Choice({ label: title, value, onChange, onChangeMany, choices }: {
  label: string;
  value: string | string[];
  onChange?: (value: string) => void;
  onChangeMany?: (value: string[]) => void;
  choices: ReadonlyArray<readonly [string, string]>;
}) {
  const values = Array.isArray(value) ? value : [value];
  return <View style={styles.field}><Text style={styles.label}>{title}</Text><View style={styles.choices}>{choices.map(([key, text]) => {
    const selected = values.includes(key);
    return <Pressable accessibilityRole={onChangeMany ? "checkbox" : "radio"} accessibilityState={onChangeMany ? { checked: selected } : { checked: selected }} key={key} onPress={() => onChangeMany ? onChangeMany(selected ? values.filter((item) => item !== key) : [...values, key]) : onChange?.(key)} style={[styles.choice, selected && styles.choiceSelected]}><Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{text}</Text></Pressable>;
  })}</View></View>;
}

function label(value: string) {
  return value.replaceAll("_", " ").replace(/^./, (character) => character.toUpperCase());
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  form: { gap: 16, padding: 18 },
  intro: { gap: 6 },
  title: { color: colors.text, fontSize: 22, fontWeight: "700" },
  help: { color: colors.muted, fontSize: 15, lineHeight: 21 },
  field: { gap: 8 },
  label: { color: colors.text, fontSize: 15, fontWeight: "700" },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  choice: { borderColor: colors.border, borderRadius: 8, borderWidth: 1, justifyContent: "center", minHeight: 44, paddingHorizontal: 13 },
  choiceSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  choiceText: { color: colors.text, fontSize: 14, fontWeight: "600" },
  choiceTextSelected: { color: "#FFFFFF" },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, color: colors.text, fontSize: 16, minHeight: 52, padding: 14 },
  checkbox: { alignItems: "center", flexDirection: "row", gap: 10, minHeight: 44 },
  box: { borderColor: colors.border, borderRadius: 4, borderWidth: 2, height: 22, width: 22 },
  boxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxText: { color: colors.text, fontSize: 15 },
  actions: { flexDirection: "row", gap: 10 },
  outlineButton: { alignItems: "center", borderColor: colors.border, borderRadius: 8, borderWidth: 1, flex: 1, justifyContent: "center", minHeight: 48 },
  outlineText: { color: colors.primary, fontSize: 15, fontWeight: "700" },
  dangerButton: { alignItems: "center", borderColor: colors.danger, borderRadius: 8, borderWidth: 1, flex: 1, justifyContent: "center", minHeight: 48 },
  dangerText: { color: colors.danger, fontSize: 15, fontWeight: "700" },
  rowActions: { flexDirection: "row", gap: 8 },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
});
