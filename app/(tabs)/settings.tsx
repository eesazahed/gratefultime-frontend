import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
import { Container } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import { ThemedText } from "../../components/ThemedText";
import { Header } from "../../components/ui/Header";

const Settings = () => {
  const router = useRouter();
  const { token, logout } = useAuth();
  const { preferredUnlockTime, loading, fetchUnlockTime } = useUser();

  const [selectedHour, setSelectedHour] = useState<string>("");
  const [error, setError] = useState<{
    unlockTime?: string;
    submission?: string;
  }>({
    unlockTime: "",
    submission: "",
  });

  const [saveStatus, setSaveStatus] = useState<"idle" | "success">("idle");

  useEffect(() => {
    if (preferredUnlockTime !== null) {
      setSelectedHour(preferredUnlockTime.toString());
    } else {
      fetchUnlockTime();
    }
  }, [preferredUnlockTime, fetchUnlockTime]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
      setError({ submission: "Error logging out. Please try again." });
    }
  };

  const handleSaveSettings = async () => {
    const parsedHour = parseInt(selectedHour, 10);

    if (isNaN(parsedHour) || parsedHour < 0 || parsedHour > 23) {
      setError({ unlockTime: "Please enter a valid hour (0-23)." });
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/users/unlocktime", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          preferred_unlock_time: parsedHour,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const newErrors = { unlockTime: "", submission: "" };
        if (data.errorCode === "unlockTime") {
          newErrors.unlockTime = data.message;
        } else {
          newErrors.submission = data.message || "Error saving settings.";
        }
        setError(newErrors);
        return;
      }

      setError({ unlockTime: "", submission: "" });
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 1000);
    } catch (err) {
      console.error("Network error:", err);
      setError({ submission: "Could not connect to server." });
    }
  };

  const handleDecrement = () => {
    const newHour = (parseInt(selectedHour) + 23) % 24;
    setSelectedHour(newHour.toString());
  };

  const handleIncrement = () => {
    const newHour = (parseInt(selectedHour) + 1) % 24;
    setSelectedHour(newHour.toString());
  };

  const formatHour = (hourString: string) => {
    const hour = parseInt(hourString, 10);
    if (isNaN(hour)) return "";
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:00 ${ampm}`;
  };

  return (
    <Container style={styles.container}>
      <Header title="Settings" />

      <ThemedText style={styles.label}>
        Preferred unlock time: {formatHour(selectedHour)}
      </ThemedText>

      <View style={styles.hourSelector}>
        <Button
          title="-"
          onPress={handleDecrement}
          style={styles.adjustButton}
          largeText
        />
        <ThemedText style={styles.hourDisplay}>{selectedHour}</ThemedText>
        <Button
          title="+"
          onPress={handleIncrement}
          style={styles.adjustButton}
          largeText
        />
      </View>
      {error.unlockTime ? (
        <ThemedText style={styles.errorText}>{error.unlockTime}</ThemedText>
      ) : null}

      <View style={styles.buttonGroup}>
        {error.submission ? (
          <ThemedText style={styles.errorText}>{error.submission}</ThemedText>
        ) : null}

        <Button
          title={saveStatus === "success" ? "Saved!" : "Save Settings"}
          onPress={handleSaveSettings}
          style={[
            styles.settingsButton,
            saveStatus === "success" && styles.successButton,
          ]}
          loading={loading}
        />

        <Button
          title="Logout"
          onPress={handleLogout}
          loading={loading}
          style={styles.settingsButton}
        />
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    color: "#8f8f8f",
    fontStyle: "italic",
  },
  hourSelector: {
    width: "100%",
    marginHorizontal: "auto",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  adjustButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#323232",
    userSelect: "none",
  },
  hourDisplay: {
    width: "100%",
    height: 50,
    borderRadius: 8,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1c1c1c",
    borderWidth: 1,
    borderColor: "#333",
    marginHorizontal: 20,
    userSelect: "none",
  },
  settingsButton: {
    backgroundColor: "#323232",
    marginVertical: 20,
    transitionDuration: "0.25s",
  },
  successButton: {
    backgroundColor: "#28a745",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 14,
    textAlign: "center",
  },
  buttonGroup: {
    marginVertical: 40,
  },
});

export default Settings;
