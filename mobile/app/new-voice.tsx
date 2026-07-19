import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { File } from "expo-file-system";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/primary-button";
import { usePrivateSourceUpload } from "@/lib/source-upload";
import { colors } from "@/lib/theme";

export default function NewVoiceScreen() {
  const router = useRouter();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);
  const uploadPrivateSource = usePrivateSourceUpload();
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [observedRecording, setObservedRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => () => {
    if (recorder.isRecording) void recorder.stop();
    deleteLocal(recorder.uri);
    void setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
  }, [recorder]);

  useEffect(() => {
    if (recorderState.isRecording) {
      setObservedRecording(true);
      return;
    }
    if (observedRecording && recorder.uri) {
      setRecordingUri(recorder.uri);
      setObservedRecording(false);
      void setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
    }
  }, [observedRecording, recorder.uri, recorderState.isRecording]);

  async function start() {
    setMessage(null);
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Microphone access needed",
        "Allow microphone access to record a household note. You can still add items manually.",
      );
      return;
    }
    await setAudioModeAsync({
      allowsRecording: true,
      allowsBackgroundRecording: false,
      playsInSilentMode: true,
    });
    await recorder.prepareToRecordAsync();
    recorder.record({ forDuration: 180 });
  }

  async function stop() {
    await recorder.stop();
    if (recorder.uri) setRecordingUri(recorder.uri);
    setObservedRecording(false);
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
  }

  async function discard() {
    if (recorderState.isRecording) await recorder.stop();
    deleteLocal(recordingUri ?? recorder.uri);
    setRecordingUri(null);
    setObservedRecording(false);
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
  }

  async function submit() {
    if (!recordingUri) return;
    setBusy(true);
    setMessage("Uploading private voice note...");
    try {
      const result = await uploadPrivateSource({
        title: "Voice note",
        uri: recordingUri,
        originalName: "voice-note.m4a",
        mediaType: "audio/mp4",
        purpose: "voice_audio",
      });
      deleteLocal(recordingUri);
      setRecordingUri(null);
      if (!result.reviewReady) {
        setMessage("Voice note saved, but it needs attention.");
        return;
      }
      router.replace("/(tabs)/inbox");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The voice note could not be processed.");
    } finally {
      setBusy(false);
    }
  }

  const seconds = Math.min(180, Math.round(recorderState.durationMillis / 1000));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.intro}>
        Say one household task, reminder, bill, renewal, or inbox item. You will review it before anything is saved.
      </Text>

      <View style={styles.status}>
        <Text accessibilityLiveRegion="polite" style={styles.time}>
          {recorderState.isRecording
            ? `Recording ${formatDuration(seconds)}`
            : recordingUri
              ? `Recorded ${formatDuration(seconds)}`
              : "Ready to record"}
        </Text>
        <Text style={styles.help}>Maximum 3 minutes. Recording stops when the app leaves this screen.</Text>
      </View>

      {recorderState.isRecording ? (
        <PrimaryButton label="Stop recording" onPress={() => void stop()} />
      ) : recordingUri ? (
        <>
          <PrimaryButton
            busy={busy}
            icon="checkmark"
            label="Create review draft"
            onPress={() => void submit()}
          />
          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={() => void discard()}
            style={styles.secondary}
          >
            <Text style={styles.secondaryText}>Discard and record again</Text>
          </Pressable>
        </>
      ) : (
        <PrimaryButton label="Start recording" onPress={() => void start()} />
      )}

      {message ? (
        <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text>
      ) : null}
    </ScrollView>
  );
}

function deleteLocal(uri: string | null) {
  if (!uri) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // The operating system may already have cleared the temporary recording.
  }
}

function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  container: { gap: 18, padding: 18 },
  intro: { color: colors.text, fontSize: 16, lineHeight: 24 },
  status: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 24,
  },
  time: { color: colors.text, fontSize: 22, fontWeight: "700" },
  help: { color: colors.muted, fontSize: 14, lineHeight: 20, textAlign: "center" },
  secondary: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 14,
  },
  secondaryText: { color: colors.primary, fontSize: 15, fontWeight: "700" },
  message: { color: colors.muted, fontSize: 14, lineHeight: 20 },
});
