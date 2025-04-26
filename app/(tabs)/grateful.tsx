import { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Button,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../context/AuthContext";
import { useFocusEffect } from "expo-router";

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

  const mockNotificationHour = 20;

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
    if (!resetTimeStr) return;

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
      <View style={styles.centered}>
        <Text style={styles.lockedText}>
          {hasSubmittedToday
            ? "You've already journaled today. Come back tomorrow!"
            : "Your gratitude journal unlocks at 8:00 PM."}
        </Text>
        {!hasSubmittedToday && (
          <TouchableOpacity onPress={() => setIsLocked(false)}>
            <Text style={styles.unlockEarlyText}>Unlock early</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>What are you grateful for today?</Text>

      {entries.map((entry, i) => {
        const errorKey: EntryKey = `entry${i + 1}` as EntryKey;
        return (
          <View key={i}>
            <TextInput
              style={[styles.input, errors[errorKey] && styles.errorInput]}
              value={entry}
              placeholder={`Gratitude #${i + 1}`}
              onChangeText={(text) => {
                const updated = [...entries];
                updated[i] = text;
                setEntries(updated);
              }}
            />
            {errors[errorKey] && (
              <Text style={styles.errorText}>{errors[errorKey]}</Text>
            )}
          </View>
        );
      })}

      <Text style={styles.promptLabel}>Reflection Prompt:</Text>
      <Text style={styles.prompt}>{aiPrompt}</Text>
      <TextInput
        style={[styles.textArea, errors.promptResponse && styles.errorInput]}
        placeholder="Write a short reflection..."
        value={promptResponse}
        onChangeText={setPromptResponse}
        multiline
      />
      {errors.promptResponse ? (
        <Text style={styles.errorText}>{errors.promptResponse}</Text>
      ) : null}

      {errors.submission ? (
        <Text style={styles.errorText}>{errors.submission}</Text>
      ) : null}

      <View style={styles.buttonGroup}>
        <Button title="Regenerate Prompt" onPress={generatePrompt} />
        <Button title="Save Entry" onPress={saveEntries} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  lockedText: {
    fontSize: 16,
    textAlign: "center",
    color: "#888",
    marginBottom: 12,
  },
  unlockEarlyText: {
    fontSize: 10,
    color: "#3498db",
    marginTop: 48,
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    fontFamily: "sans-serif",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontFamily: "sans-serif",
  },
  errorInput: {
    borderColor: "red",
  },
  promptLabel: {
    marginTop: 10,
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 16,
    fontFamily: "sans-serif",
  },
  prompt: {
    fontStyle: "italic",
    marginBottom: 8,
    color: "#333",
    fontFamily: "sans-serif",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 12,
    fontFamily: "sans-serif",
  },
  buttonGroup: {
    gap: 10,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 12,
  },
});
