import { useSignUp } from "@clerk/expo";
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

export default function SignUpScreen() {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    setMessage(null);
    const { error } = await signUp.password({
      emailAddress: emailAddress.trim(),
      password,
    });
    if (error) {
      setMessage(getClerkErrorMessage(error) ?? "Check your details and try again.");
      return;
    }

    const verification = await signUp.verifications.sendEmailCode();
    if (verification.error) {
      setMessage(getClerkErrorMessage(verification.error) ?? "We could not send the email code.");
      return;
    }
    setCheckingEmail(true);
  };

  const verify = async () => {
    setMessage(null);
    const { error } = await signUp.verifications.verifyEmailCode({ code });
    if (error) {
      setMessage(getClerkErrorMessage(error) ?? "That code could not be verified.");
      return;
    }

    if (signUp.status !== "complete") {
      setMessage("A little more account information is required. Please try again.");
      return;
    }

    await signUp.finalize({
      navigate: ({ session }) => {
        if (session?.currentTask) {
          setMessage("Please finish the security step for this account in the web app.");
        } else {
          router.replace("/onboarding");
        }
      },
    });
  };

  const busy = fetchStatus === "fetching";

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={styles.brand}>
          <Text accessibilityRole="header" style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            Start a private household workspace for your family.
          </Text>
        </View>
        <View style={styles.form}>
          <Text style={styles.formTitle}>{checkingEmail ? "Check your email" : "Your details"}</Text>
          {checkingEmail ? (
            <>
              <Text style={styles.help}>Enter the code sent to {emailAddress.trim()}.</Text>
              <TextInput
                accessibilityLabel="Verification code"
                keyboardType="number-pad"
                onChangeText={setCode}
                placeholder="Verification code"
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
                autoComplete="new-password"
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor={colors.muted}
                secureTextEntry
                style={styles.input}
                value={password}
              />
            </>
          )}
          <Pressable
            accessibilityRole="button"
            disabled={busy || (checkingEmail ? !code : !emailAddress || !password)}
            onPress={checkingEmail ? verify : submit}
            style={({ pressed }) => [
              styles.button,
              (busy || (checkingEmail ? !code : !emailAddress || !password)) && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.buttonText}>
              {busy ? "Please wait..." : checkingEmail ? "Verify email" : "Create account"}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => checkingEmail ? setCheckingEmail(false) : router.replace("/(auth)/sign-in")}
            style={styles.textButton}
          >
            <Text style={styles.textButtonLabel}>
              {checkingEmail ? "Change email" : "Already have an account? Sign in"}
            </Text>
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
  brand: { gap: 8, marginBottom: 32 },
  title: { color: colors.text, fontSize: 30, fontWeight: "700" },
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
  textButton: { alignItems: "center", padding: 10 },
  textButtonLabel: { color: colors.primary, fontSize: 15, fontWeight: "700" },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
});
