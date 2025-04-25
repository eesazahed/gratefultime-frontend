import { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Button,
  Text,
  ScrollView,
} from "react-native";
import prisma from "@/lib/prismaClient";

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

export default function HomeScreen() {
  const [entries, setEntries] = useState(["", "", ""]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [promptResponse, setPromptResponse] = useState("");
  const [isLocked, setIsLocked] = useState(true);

  const [errors, setErrors] = useState<Errors>({
    entry1: "",
    entry2: "",
    entry3: "",
    promptResponse: "",
    submission: "",
  });

  const mockPromptList = [
    "What was one small moment that brought you peace today?",
    "Think of someone you’re thankful for — why?",
    "Describe a challenge today that turned out better than expected.",
  ];

  const mockNotificationHour = 20;

  useEffect(() => {
    checkIfUnlocked();
    generatePrompt();
  }, []);

  const checkIfUnlocked = () => {
    const now = new Date();
    const unlockTime = new Date();
    unlockTime.setHours(mockNotificationHour, 0, 0);
    const midnight = new Date();
    midnight.setHours(23, 59, 59);
    setIsLocked(!(now >= unlockTime && now <= midnight));
  };

  const generatePrompt = () => {
    const randomPrompt =
      mockPromptList[Math.floor(Math.random() * mockPromptList.length)];
    setAiPrompt(randomPrompt);
    setPromptResponse("");
  };

  const validateFields = () => {
    const newErrors: Errors = {
      entry1: "",
      entry2: "",
      entry3: "",
      promptResponse: "",
      submission: "",
    };

    if (entries[0].trim() === "") {
      newErrors.entry1 = "Please enter your first gratitude.";
      setErrors(newErrors);
      return false;
    }

    if (entries[1].trim() === "") {
      newErrors.entry2 = "Please enter your second gratitude.";
      setErrors(newErrors);
      return false;
    }

    if (entries[2].trim() === "") {
      newErrors.entry3 = "Please enter your third gratitude.";
      setErrors(newErrors);
      return false;
    }

    if (promptResponse.trim() === "") {
      newErrors.promptResponse = "Please write a short reflection.";
      setErrors(newErrors);
      return false;
    }

    setErrors(newErrors);
    return true;
  };

  const saveEntries = async () => {
    if (!validateFields()) return;

    try {
      await prisma.gratitudeEntry.create({
        data: {
          entry1: entries[0],
          entry2: entries[1],
          entry3: entries[2],
          prompt: aiPrompt,
          response: promptResponse,
        },
      });

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
      console.error("Error saving entry:", error);
      setErrors((prev) => ({
        ...prev,
        submission: "There was an issue saving your entry.",
      }));
    }
  };

  if (isLocked) {
    return (
      <View style={styles.centered}>
        <Text style={styles.lockedText}>
          Your gratitude journal unlocks at 8:00 PM.
        </Text>
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
            {errors[errorKey] ? (
              <Text style={styles.errorText}>{errors[errorKey]}</Text>
            ) : null}
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
  },
  lockedText: {
    fontSize: 16,
    textAlign: "center",
    color: "#888",
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
