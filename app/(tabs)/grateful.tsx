import { useState, useCallback } from "react";
import { StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
import { useFocusEffect } from "expo-router";
import { Container } from "../../components/ui/Container";
import { Input } from "../../components/ui/Input";
import { TextArea } from "../../components/ui/TextArea";
import { Button } from "../../components/ui/Button";
import { ThemedText } from "../../components/ThemedText";
import { Header } from "../../components/ui/Header";
import { BackendServer } from "@/constants/BackendServer";
import { PromptList } from "@/constants/PromptList";

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
  const { fetchUserData, preferredUnlockTime, loading } = useUser();

  const [entries, setEntries] = useState(["", "", ""]);
  const [gratefulnessPrompt, setGratefulnessPrompt] = useState("");
  const [promptResponse, setPromptResponse] = useState("");
  const [isLocked, setIsLocked] = useState(true);
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [errors, setErrors] = useState<Errors>({
    entry1: "",
    entry2: "",
    entry3: "",
    promptResponse: "",
    submission: "",
  });

  const DEFAULT_UNLOCK_TIME = 20; // 8pm

  useFocusEffect(
    useCallback(() => {
      const runChecks = async () => {
        setIsLoading(true);
        if (!loading) {
          fetchUserData();
          checkIfUnlocked();
          await checkIfSubmittedToday();
          generatePrompt();
          setIsLoading(false);
        }
      };
      runChecks();
    }, [token, preferredUnlockTime, loading])
  );

  const checkIfUnlocked = () => {
    const hour = preferredUnlockTime ?? DEFAULT_UNLOCK_TIME;
    const now = new Date();
    const unlockTime = new Date();
    unlockTime.setHours(hour, 0, 0);
    const midnight = new Date();
    midnight.setHours(23, 59, 59);
    setIsLocked(!(now >= unlockTime && now <= midnight));
  };

  const checkIfSubmittedToday = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `${BackendServer}/users/recententrytimestamp`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.data?.timestamp) {
        setHasSubmittedToday(false);
        return;
      }

      const entryDate = new Date(data.data.timestamp);
      const now = new Date();

      const isSameDay =
        entryDate.getFullYear() === now.getFullYear() &&
        entryDate.getMonth() === now.getMonth() &&
        entryDate.getDate() === now.getDate();

      setHasSubmittedToday(isSameDay);
    } catch (error) {
      console.error("Failed to fetch recent entry:", error);
      setHasSubmittedToday(false);
    }
  };

  const generatePrompt = () => {
    const randomPrompt =
      PromptList[Math.floor(Math.random() * PromptList.length)];
    setGratefulnessPrompt(randomPrompt);
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
      const response = await fetch(`${BackendServer}/entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          entry1: entries[0],
          entry2: entries[1],
          entry3: entries[2],
          user_prompt: gratefulnessPrompt,
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

  const formattedUnlockTime = new Date();
  formattedUnlockTime.setHours(
    preferredUnlockTime ?? DEFAULT_UNLOCK_TIME,
    0,
    0
  );

  const formattedUnlockTimeString = formattedUnlockTime.toLocaleString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );

  if (isLoading) {
    return (
      <Container style={styles.centered}>
        <ActivityIndicator color="#fff" />
      </Container>
    );
  }

  if (isLocked || hasSubmittedToday) {
    return (
      <Container style={styles.centered}>
        <ThemedText style={styles.lockedText}>
          {hasSubmittedToday
            ? "Thanks for submitting! \n\n Come back tomorrow!"
            : `Your gratitude journal unlocks at ${formattedUnlockTimeString}`}
        </ThemedText>
        {!hasSubmittedToday && (
          <Button
            title="Unlock early"
            onPress={() => setIsLocked(false)}
            variant="outline"
            style={styles.unlockButton}
          />
        )}
      </Container>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Container>
        <Header title="I'm grateful for" />

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

        <ThemedText style={styles.prompt}>{gratefulnessPrompt}</ThemedText>
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
          style={styles.regenButton}
        />

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
          title="Save Entry"
          onPress={saveEntries}
          style={{
            ...styles.saveButton,
            backgroundColor:
              entries[0] && entries[1] && entries[2] && promptResponse
                ? "#32a852"
                : "#323232",
          }}
          disabled={!(entries[0] && entries[1] && entries[2] && promptResponse)}
        />
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 300,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  regenButton: {
    marginBottom: 52,
  },
  saveButton: {
    transitionDuration: "0.25s",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginVertical: 8,
  },
  lockedText: {
    fontSize: 18,
    textAlign: "center",
    paddingBottom: 64,
  },
  unlockButton: {
    paddingHorizontal: 20,
    backgroundColor: "#1c1c1c",
    borderWidth: 1,
    borderColor: "#333",
  },
});
