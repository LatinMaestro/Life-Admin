import { useSignIn } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/primary-button";
import { getClerkErrorMessage } from "@/lib/clerk-error";
import { colors } from "@/lib/theme";

type RecoveryStep = "email" | "code" | "password";

export default function ForgotPasswordScreen() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();
  const [step, setStep] = useState<RecoveryStep>("email");
  const [emailAddress, setEmailAddress] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const busy = fetchStatus === "fetching";

  const sendCode = async () => {
    setMessage(null);
    const { error: createError } = await signIn.create({
      identifier: emailAddress.trim(),
    });
    if (createError) {
      setMessage(getClerkErrorMessage(createError) ?? "We could not start password recovery.");
      return;
    }

    const { error } = await signIn.resetPasswordEmailCode.sendCode();
    if (error) {
      setMessage(getClerkErrorMessage(error) ?? "We could not send the recovery code.");
      return;
    }

    setStep("code");
  };

  const verifyCode = async () => {
    setMessage(null);
    const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code: code.trim() });
    if (error) {
      setMessage(getClerkErrorMessage(error) ?? "That recovery code could not be verified.");
      return;
    }

    if (signIn.status === "needs_new_password") {
      setStep("password");
    } else {
      setMessage("This account needs an additional security step. Please use the web app.");
    }
  };

  const setNewPassword = async () => {
    setMessage(null);
    if (password !== passwordConfirmation) {
      setMessage("The passwords do not match.");
      return;
    }

    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password,
      signOutOfOtherSessions: true,
    });
    if (error) {
      setMessage(getClerkErrorMessage(error) ?? "Your password could not be updated.");
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session }) => {
          if (session?.currentTask) {
            setMessage("Please finish the remaining security step in the web app.");
          } else {
            router.replace("/(tabs)");
          }
        },
      });
      return;
    }

    setMessage("This account needs an additional security step. Please use the web app.");
  };

  const startAgain = () => {
    signIn.reset();
    setStep("email");
    setCode("");
    setPassword("");
    setPasswordConfirmation("");
    setMessage(null);
  };

  const title =
    step === "email" ? "Reset your password" : step === "code" ? "Check your email" : "Choose a new password";
  const help =
    step === "email"
      ? "Enter the email address you use for Family Life Admin."
      : step === "code"
        ? "Enter the recovery code sent to your email address."
        : "Use a new password for your Family Life Admin account.";

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
          <Text style={styles.help}>{help}</Text>

          {step === "email" ? (
            <TextInput
              accessibilityLabel="Email address"
              autoCapitalize="none"
              autoComplete="email"
              autoFocus
              keyboardType="email-address"
              onChangeText={setEmailAddress}
              placeholder="Email address"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={emailAddress}
            />
          ) : null}

          {step === "code" ? (
            <TextInput
              accessibilityLabel="Recovery code"
              autoFocus
              keyboardType="number-pad"
              onChangeText={setCode}
              placeholder="Recovery code"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={code}
            />
          ) : null}

          {step === "password" ? (
            <>
              <TextInput
                accessibilityLabel="New password"
                autoComplete="new-password"
                autoFocus
                onChangeText={setPassword}
                placeholder="New password"
                placeholderTextColor={colors.muted}
                secureTextEntry
                style={styles.input}
                value={password}
              />
              <TextInput
                accessibilityLabel="Confirm new password"
                autoComplete="new-password"
                onChangeText={setPasswordConfirmation}
                placeholder="Confirm new password"
                placeholderTextColor={colors.muted}
                secureTextEntry
                style={styles.input}
                value={passwordConfirmation}
              />
            </>
          ) : null}

          {message ? <Text accessibilityLiveRegion="polite" style={styles.error}>{message}</Text> : null}

          <PrimaryButton
            busy={busy}
            disabled={
              step === "email"
                ? !emailAddress.trim()
                : step === "code"
                  ? !code.trim()
                  : !password || !passwordConfirmation
            }
            icon="checkmark"
            label={step === "email" ? "Send recovery code" : step === "code" ? "Verify code" : "Set new password"}
            onPress={() => {
              if (step === "email") void sendCode();
              else if (step === "code") void verifyCode();
              else void setNewPassword();
            }}
          />

          {step === "email" ? (
            <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.textButton}>
              <Text style={styles.textButtonLabel}>Back to sign in</Text>
            </Pressable>
          ) : (
            <Pressable accessibilityRole="button" onPress={startAgain} style={styles.textButton}>
              <Text style={styles.textButtonLabel}>Start again</Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  keyboard: { flex: 1 },
  content: { flexGrow: 1, gap: 14, justifyContent: "center", padding: 24 },
  title: { color: colors.text, fontSize: 28, fontWeight: "700" },
  help: { color: colors.muted, fontSize: 15, lineHeight: 22 },
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
  textButton: { alignItems: "center", padding: 10 },
  textButtonLabel: { color: colors.primary, fontSize: 15, fontWeight: "700" },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
});
