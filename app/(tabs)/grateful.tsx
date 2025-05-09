import { useCallback, useState } from "react";
import { StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../context/AuthContext";
import { useFocusEffect } from "expo-router";
import { Container } from "../../components/ui/Container";
import { Input } from "../../components/ui/Input";
import { TextArea } from "../../components/ui/TextArea";
import { Button } from "../../components/ui/Button";
import { ThemedText } from "../../components/ThemedText";
import { Header } from "../../components/ui/Header";

type EntryKey =
  | "entry1"
  | "entry2"
  | "entry3"
  | "promptResponse"
  | "submission";

type Errors = {
  entry1: string;
  entry2: string;
  entry3: string;
  promptResponse: string;
  submission: string;
};

export default function Grateful() {
  const { token } = useAuth();

  const [entries, setEntries] = useState(["", "", ""]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [promptResponse, setPromptResponse] = useState("");
  const [isLocked, setIsLocked] = useState(true);
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);

  const [errors, setErrors] = useState<Errors>({
    entry1: "",
    entry2: "",
    entry3: "",
    promptResponse: "",
    submission: "",
  });

  const mockPromptList = [
    "What was one small moment that brought you peace today?",
    "Think of someone you're thankful for — why?",
    "Describe a challenge today that turned out better than expected.",
  ];

  const mockNotificationHour = 20; // manually set

  useFocusEffect(
    useCallback(() => {
      checkIfUnlocked();
      generatePrompt();
      checkResetTime();
    }, [token])
  );

  const checkIfUnlocked = () => {
    const now = new Date();
    const unlockTime = new Date();
    unlockTime.setHours(mockNotificationHour, 0, 0);
    const midnight = new Date();
    midnight.setHours(23, 59, 59);
    setIsLocked(!(now >= unlockTime && now <= midnight));
  };

  const checkResetTime = async () => {
    const resetTimeStr = await AsyncStorage.getItem("RESET_TIME");
    if (!resetTimeStr) {
      setHasSubmittedToday(false);
      return;
    }

    const resetTime = new Date(resetTimeStr);
    const now = new Date();

    if (now < resetTime) {
      setHasSubmittedToday(true);
    } else {
      setHasSubmittedToday(false);
      await AsyncStorage.removeItem("RESET_TIME");
    }
  };

  const generatePrompt = () => {
    const randomPrompt =
      mockPromptList[Math.floor(Math.random() * mockPromptList.length)];
    setAiPrompt(randomPrompt);
    setPromptResponse("");
  };

  const saveEntries = async () => {
    if (!token) {
      console.error("No token found");
      setErrors((prev) => ({
        ...prev,
        submission: "User is not authenticated. Please log in.",
      }));
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          entry1: entries[0],
          entry2: entries[1],
          entry3: entries[2],
          user_prompt: aiPrompt,
          user_prompt_response: promptResponse,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Server error:", data);
        const newErrors = {
          entry1: "",
          entry2: "",
          entry3: "",
          promptResponse: "",
          submission: "",
        };

        if (data.message) {
          if (data.errorCode === "entry1") {
            newErrors.entry1 = data.message;
          } else if (data.errorCode === "entry2") {
            newErrors.entry2 = data.message;
          } else if (data.errorCode === "entry3") {
            newErrors.entry3 = data.message;
          } else if (data.errorCode === "promptResponse") {
            newErrors.promptResponse = data.message;
          } else {
            newErrors.submission = data.message;
          }
        }

        setErrors(newErrors);
        return;
      }

      const resetTime = new Date();
      resetTime.setDate(resetTime.getDate() + 1);
      resetTime.setHours(0, 0, 0, 0);
      await AsyncStorage.setItem("RESET_TIME", resetTime.toISOString());
      setHasSubmittedToday(true);
      setEntries(["", "", ""]);
      setPromptResponse("");
      generatePrompt();
      setErrors({
        entry1: "",
        entry2: "",
        entry3: "",
        promptResponse: "",
        submission: "",
      });
    } catch (error) {
      console.error("Network error:", error);
      setErrors((prev) => ({
        ...prev,
        submission: "Could not connect to server.",
      }));
    }
  };

  if (isLocked || hasSubmittedToday) {
    return (
      <Container style={styles.centered}>
        <ThemedText style={styles.lockedText}>
          {hasSubmittedToday
            ? "You've already journaled today. Come back tomorrow!"
            : "Your gratitude journal unlocks at 8:00 PM."}
        </ThemedText>
        {!hasSubmittedToday && (
          <Button
            title="Unlock early"
            onPress={() => setIsLocked(false)}
            variant="outline"
          />
        )}
      </Container>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Container>
        <Header title="What are you grateful for?" />

        <Container style={styles.entriesWrapper}>
          {entries.map((entry, i) => {
            const errorKey: EntryKey = `entry${i + 1}` as EntryKey;
            return (
              <Input
                maxLength={50}
                key={i}
                value={entry}
                placeholder={`Gratitude #${i + 1}`}
                onChangeText={(text) => {
                  const updated = [...entries];
                  updated[i] = text;
                  setEntries(updated);
                }}
                error={errors[errorKey]}
              />
            );
          })}
        </Container>
        <Container style={styles.entriesWrapper}>

        <ThemedText style={styles.prompt}>{aiPrompt}</ThemedText>
        <TextArea
          maxLength={100}
          placeholder="Write a short reflection..."
          value={promptResponse}
          onChangeText={setPromptResponse}
          error={errors.promptResponse}
        />

        <Button
          title="Regenerate Prompt"
          onPress={generatePrompt}
          variant="outline"
          style={styles.button}
        />
        </Container>

        <Container style={styles.buttonGroup}>
          {errors.submission ? (
            <ThemedText
              style={{
                ...styles.errorText,
                textAlign: "center",
                paddingBottom: 12,
              }}
            >
              {errors.submission}
            </ThemedText>
          ) : null}
          <Button
            title="Save Entries"
            onPress={saveEntries}
            style={styles.saveButton}
          />
        </Container>
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginVertical: 24,
    textAlign: "center",
  },
  entriesWrapper: {
    marginBottom: 24,
  },
  prompt: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 16,
    marginBottom: 16,
    paddingLeft: 4,
    color: "#8f8f8f",
    fontStyle: "italic",
  },
  button: {
    marginBottom: 16,
  },
  buttonGroup: {
    marginTop: 24,
  },
  saveButton: {
    marginTop: 8,
  },
  errorText: {
    color: "red",
    fontSize: 12,
  },
  lockedText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 64,
  },
});
