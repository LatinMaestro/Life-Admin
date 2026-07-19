import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { PrimaryButton } from "@/components/primary-button";
import { useHouseholdMutation } from "@/lib/api";
import { usePrivateSourceUpload } from "@/lib/source-upload";
import { colors } from "@/lib/theme";

type SelectedImage = {
  uri: string;
  fileName: string;
  mediaType: string;
  source: "camera" | "library";
};

export default function NewSourceScreen() {
  const router = useRouter();
  const mutate = useHouseholdMutation();
  const uploadPrivateSource = usePrivateSourceUpload();
  const [title, setTitle] = useState("");
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState<SelectedImage | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const chooseImage = async (source: SelectedImage["source"]) => {
    setMessage(null);
    if (source === "camera") {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Camera access needed",
          "Allow camera access to photograph a household document. You can still choose an existing photo.",
        );
        return;
      }
    }

    const result = source === "camera"
      ? await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          mediaTypes: ["images"],
          quality: 1,
        })
      : await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          mediaTypes: ["images"],
          quality: 1,
        });

    if (result.canceled) return;
    const selected = result.assets[0];
    const fileName = selected.fileName ?? `household-source-${Date.now()}.jpg`;
    setImage({
      uri: selected.uri,
      fileName,
      mediaType: selected.mimeType ?? mediaTypeFromName(fileName),
      source,
    });
    if (!title.trim()) setTitle("Household document");
  };

  const upload = async () => {
    if (!image || title.trim().length < 2) return;
    setBusy(true);
    setMessage(null);
    try {
      await uploadPrivateSource({
        title: title.trim(),
        uri: image.uri,
        originalName: image.fileName,
        mediaType: image.mediaType,
        purpose: "camera_crop",
        onStage: (stage) => setMessage(
          stage === "preparing"
            ? "Preparing private upload..."
            : stage === "uploading"
              ? "Uploading..."
              : "Checking file...",
        ),
      });
      router.back();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const submitReference = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await mutate("/api/v1/sources", { title, label, url }, "POST");
      router.back();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.form}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
    >
      {image ? (
        <>
          <Image accessibilityLabel="Selected household source" resizeMode="contain" source={{ uri: image.uri }} style={styles.preview} />
          <Text style={styles.help}>
            Review the image before uploading. The original private image remains the source to open later.
          </Text>
          <Text style={styles.label}>Source name</Text>
          <TextInput
            accessibilityLabel="Source name"
            maxLength={120}
            onChangeText={setTitle}
            placeholder="For example: Electricity notice"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={title}
          />
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={() => void chooseImage(image.source)}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryText}>{image.source === "camera" ? "Retake" : "Choose again"}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={() => {
                setImage(null);
                setMessage(null);
              }}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryText}>Cancel</Text>
            </Pressable>
          </View>
          {message ? <Text accessibilityLiveRegion="polite" style={message.includes("...") ? styles.help : styles.error}>{message}</Text> : null}
          <PrimaryButton
            busy={busy}
            disabled={title.trim().length < 2}
            icon="checkmark"
            label="Upload privately"
            onPress={() => void upload()}
          />
        </>
      ) : (
        <>
          <Text style={styles.intro}>Add an original household source without copying private details into the app.</Text>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={() => void chooseImage("camera")} style={styles.captureButton}>
              <Text style={styles.captureText}>Take photo</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => void chooseImage("library")} style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>Choose photo</Text>
            </Pressable>
          </View>

          <View style={styles.divider}><View style={styles.line} /><Text style={styles.or}>or add a reference</Text><View style={styles.line} /></View>
          <Text style={styles.label}>Source name</Text>
          <TextInput
            accessibilityLabel="Source name"
            autoFocus={false}
            maxLength={120}
            onChangeText={setTitle}
            placeholder="For example: Electricity notice"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={title}
          />
          <Text style={styles.label}>Where to find it</Text>
          <TextInput
            accessibilityLabel="Source location"
            maxLength={160}
            onChangeText={setLabel}
            placeholder="For example: Provider portal or kitchen folder"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={label}
          />
          <Text style={styles.label}>HTTPS link (optional)</Text>
          <TextInput
            accessibilityLabel="HTTPS source link"
            autoCapitalize="none"
            keyboardType="url"
            maxLength={2000}
            onChangeText={setUrl}
            placeholder="https://"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={url}
          />
          <Text style={styles.help}>Use a link or location reference only. Do not copy payment details.</Text>
          {message ? <Text accessibilityLiveRegion="polite" style={styles.error}>{message}</Text> : null}
          <PrimaryButton
            busy={busy}
            disabled={!title.trim() || !label.trim()}
            icon="checkmark"
            label="Add reference"
            onPress={() => void submitReference()}
          />
        </>
      )}
    </ScrollView>
  );
}

function mediaTypeFromName(name: string) {
  const extension = name.toLowerCase().split(".").pop();
  if (extension === "png") return "image/png";
  if (extension === "heic") return "image/heic";
  if (extension === "heif") return "image/heif";
  return "image/jpeg";
}

const styles = StyleSheet.create({
  form: { gap: 12, padding: 18 },
  intro: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  label: { color: colors.text, fontSize: 15, fontWeight: "700" },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 52,
    padding: 14,
  },
  preview: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    height: 360,
    width: "100%",
  },
  actions: { flexDirection: "row", gap: 10 },
  captureButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 14,
  },
  captureText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  secondaryButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 14,
  },
  secondaryText: { color: colors.primary, fontSize: 15, fontWeight: "700" },
  divider: { alignItems: "center", flexDirection: "row", gap: 10, paddingVertical: 8 },
  line: { backgroundColor: colors.border, flex: 1, height: 1 },
  or: { color: colors.muted, fontSize: 13 },
  help: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
});
