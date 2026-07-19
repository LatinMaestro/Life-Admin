import { useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApiResource, useHouseholdMutation } from "@/lib/api";
import type { OnboardingResponse } from "@/lib/contracts";
import { colors } from "@/lib/theme";

export default function OnboardingScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const state = useApiResource<OnboardingResponse>("/api/v1/onboarding");
  const mutate = useHouseholdMutation();
  const [householdName, setHouseholdName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (state.data?.status === "ready") router.replace("/(tabs)");
  }, [router, state.data?.status]);

  const complete = async () => {
    if (!state.data) return;
    setSaving(true);
    setMessage(null);
    try {
      await mutate(
        "/api/v1/onboarding",
        state.data.status === "invited"
          ? { operation: "accept_invitation" }
          : { operation: "create_household", householdName },
        "POST",
      );
      router.replace("/(tabs)");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Household setup could not be completed.");
    } finally {
      setSaving(false);
    }
  };

  if (state.loading || state.data?.status === "ready") {
    return (
      <View accessibilityLabel="Loading" style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text accessibilityRole="header" style={styles.title}>
            {state.data?.status === "invited"
              ? `Join ${state.data.invitation?.householdName}`
              : "Create your household"}
          </Text>
          <Text style={styles.subtitle}>
            {state.data?.status === "invited"
              ? "Your family has invited you to its shared household workspace."
              : "This is the private space your family will share."}
          </Text>

          {state.error ? (
            <Text accessibilityLiveRegion="polite" style={styles.error}>{state.error}</Text>
          ) : null}

          {state.data?.status === "needs_household" ? (
            <TextInput
              accessibilityLabel="Household name"
              autoComplete="organization"
              maxLength={80}
              onChangeText={setHouseholdName}
              placeholder="The Taylor household"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={householdName}
            />
          ) : null}

          {state.data ? (
            <Pressable
              accessibilityRole="button"
              disabled={saving || (state.data.status === "needs_household" && householdName.trim().length < 2)}
              onPress={complete}
              style={({ pressed }) => [
                styles.button,
                (saving || (state.data?.status === "needs_household" && householdName.trim().length < 2)) && styles.disabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.buttonText}>
                {saving
                  ? "Please wait..."
                  : state.data.status === "invited"
                    ? "Join household"
                    : "Create household"}
              </Text>
            </Pressable>
          ) : (
            <Pressable accessibilityRole="button" onPress={() => void state.refresh()} style={styles.button}>
              <Text style={styles.buttonText}>Try again</Text>
            </Pressable>
          )}

          <Pressable
            accessibilityRole="button"
            onPress={() => void signOut({ redirectUrl: "/(auth)/sign-in" })}
            style={styles.textButton}
          >
            <Text style={styles.textButtonLabel}>Use another account</Text>
          </Pressable>
          {message ? <Text accessibilityLiveRegion="polite" style={styles.error}>{message}</Text> : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  container: { flex: 1, justifyContent: "center", padding: 24 },
  content: { gap: 16 },
  loading: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
  },
  title: { color: colors.text, fontSize: 28, fontWeight: "700" },
  subtitle: { color: colors.muted, fontSize: 16, lineHeight: 23 },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 52,
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  disabled: { opacity: 0.5 },
  pressed: { backgroundColor: colors.primaryPressed },
  textButton: { alignItems: "center", padding: 10 },
  textButtonLabel: { color: colors.primary, fontSize: 15, fontWeight: "700" },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
});
