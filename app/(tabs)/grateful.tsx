import { useCallback, useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
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

  const mockNotificationHour = 1;

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

      <View style={styles.entriesWrapper}>
        {entries.map((entry, i) => {
          const errorKey: EntryKey = `entry${i + 1}` as EntryKey;
          return (
            <View key={i}>
              <TextInput
                style={[styles.input, errors[errorKey] && styles.errorInput]}
                value={entry}
                placeholder={`Gratitude #${i + 1}`}
                placeholderTextColor="#bbb"
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
      </View>

      <Text style={styles.prompt}>{aiPrompt}</Text>
      <TextInput
        style={[styles.textArea, errors.promptResponse && styles.errorInput]}
        placeholder="Write a short reflection..."
        placeholderTextColor="#bbb"
        value={promptResponse}
        onChangeText={setPromptResponse}
        multiline
      />
      {errors.promptResponse ? (
        <Text style={styles.errorText}>{errors.promptResponse}</Text>
      ) : null}
      <TouchableOpacity style={styles.button} onPress={generatePrompt}>
        <Text style={styles.buttonText}>Regenerate Prompt</Text>
      </TouchableOpacity>

      <View style={styles.buttonGroup}>
        {errors.submission ? (
          <Text
            style={{
              ...styles.errorText,
              textAlign: "center",
              paddingBottom: 12,
            }}
          >
            {errors.submission}
          </Text>
        ) : null}
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={saveEntries}
        >
          <Text style={styles.buttonText}>Save Entry</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    margin: 40,
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: "#000",
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
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#1f1f1f",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#2c2c2c",
    color: "#fff",
  },
  errorInput: {
    borderColor: "red",
  },
  prompt: {
    fontStyle: "italic",
    marginBottom: 8,
    color: "#bbb",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#1f1f1f",
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 12,
    backgroundColor: "#2c2c2c",
    color: "#fff",
  },
  entriesWrapper: {
    marginBottom: 20,
  },
  buttonGroup: {
    marginTop: 50,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#525252",
    borderWidth: 1,
    borderColor: "#2c2c2c",
    opacity: 0.9,
  },
  saveButton: {
    backgroundColor: "#81c784",
    borderColor: "#81c784",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "400",
  },
  errorText: {
    color: "red",
    fontSize: 10,
    marginLeft: 8,
    marginBottom: 12,
  },
});
