import { useSignIn } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getClerkErrorMessage } from "@/lib/clerk-error";
import { colors } from "@/lib/theme";

export default function SignInScreen() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const finish = async () => {
    await signIn.finalize({
      navigate: ({ session }) => {
        if (session?.currentTask) {
          setMessage("Please finish the security step for this account in the web app.");
        } else {
          router.replace("/(tabs)");
        }
      },
    });
  };

  const submit = async () => {
    setMessage(null);
    const { error } = await signIn.password({ emailAddress: emailAddress.trim(), password });
    if (error) {
      setMessage(getClerkErrorMessage(error) ?? "Check your email and password, then try again.");
      return;
    }
    if (signIn.status === "complete") {
      await finish();
      return;
    }
    if (signIn.status === "needs_client_trust") {
      const factor = signIn.supportedSecondFactors.find((item) => item.strategy === "email_code");
      if (factor) {
        await signIn.mfa.sendEmailCode();
        return;
      }
    }
    setMessage("This account needs an additional sign-in step. Please use the web app for now.");
  };

  const verify = async () => {
    setMessage(null);
    const { error } = await signIn.mfa.verifyEmailCode({ code });
    if (error) {
      setMessage(getClerkErrorMessage(error) ?? "That code could not be verified.");
      return;
    }
    if (signIn.status === "complete") await finish();
  };

  const busy = fetchStatus === "fetching";
  const needsCode = signIn.status === "needs_client_trust";

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={styles.brand}>
          <Text accessibilityRole="header" style={styles.title}>Family Life Admin</Text>
          <Text style={styles.subtitle}>
            One calm place for the household jobs that need remembering.
          </Text>
        </View>
        <View style={styles.form}>
          <Text style={styles.formTitle}>{needsCode ? "Check your email" : "Sign in"}</Text>
          {needsCode ? (
            <>
              <Text style={styles.help}>Enter the security code sent to your email address.</Text>
              <TextInput
                accessibilityLabel="Security code"
                keyboardType="number-pad"
                onChangeText={setCode}
                placeholder="Security code"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={code}
              />
            </>
          ) : (
            <>
              <TextInput
                accessibilityLabel="Email address"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={setEmailAddress}
                placeholder="Email address"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={emailAddress}
              />
              <TextInput
                accessibilityLabel="Password"
                autoComplete="current-password"
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor={colors.muted}
                secureTextEntry
                style={styles.input}
                value={password}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/(auth)/forgot-password")}
                style={styles.forgotButton}
              >
                <Text style={styles.textButtonLabel}>Forgot password?</Text>
              </Pressable>
            </>
          )}
          <Pressable
            accessibilityRole="button"
            disabled={busy || (needsCode ? !code : !emailAddress || !password)}
            onPress={needsCode ? verify : submit}
            style={({ pressed }) => [
              styles.button,
              (busy || (needsCode ? !code : !emailAddress || !password)) && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.buttonText}>
              {busy ? "Please wait..." : needsCode ? "Continue" : "Sign in"}
            </Text>
          </Pressable>
          {needsCode ? (
            <Pressable accessibilityRole="button" onPress={() => signIn.reset()} style={styles.textButton}>
              <Text style={styles.textButtonLabel}>Start again</Text>
            </Pressable>
          ) : null}
          {message ? <Text accessibilityLiveRegion="polite" style={styles.error}>{message}</Text> : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  container: { flex: 1, justifyContent: "center", padding: 24 },
  brand: { gap: 8, marginBottom: 32 },
  title: { color: colors.text, fontSize: 32, fontWeight: "700" },
  subtitle: { color: colors.muted, fontSize: 16, lineHeight: 23 },
  form: { gap: 14 },
  formTitle: { color: colors.text, fontSize: 22, fontWeight: "700" },
  help: { color: colors.muted, fontSize: 15, lineHeight: 21 },
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
  forgotButton: { alignSelf: "flex-end", paddingHorizontal: 4, paddingVertical: 6 },
  textButton: { alignItems: "center", padding: 10 },
  textButtonLabel: { color: colors.primary, fontSize: 15, fontWeight: "700" },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
});
