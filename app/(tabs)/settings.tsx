import React, { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
import { Container } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import { ThemedText } from "../../components/ThemedText";
import { Header } from "../../components/ui/Header";
import { Input } from "../../components/ui/Input";

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
      setError({ unlockTime: "Please enter a valid hour (0–23)." });
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
        console.error("Server error:", data);

        const newErrors = {
          unlockTime: "",
          submission: "",
        };

        if (data.errorCode === "unlockTime") {
          newErrors.unlockTime = data.message;
        } else {
          newErrors.submission = data.message || "Error saving settings.";
        }

        setError(newErrors);
        return;
      }

      setError({ unlockTime: "", submission: "" });
    } catch (err) {
      console.error("Network error:", err);
      setError({ submission: "Could not connect to server." });
    }
  };

  return (
    <Container style={styles.container}>
      <Header title="Settings" />

      <Input
        label="Set Notification Hour (0-23)"
        value={selectedHour}
        onChangeText={setSelectedHour}
        keyboardType="numeric"
        placeholder="Enter hour"
        error={error.unlockTime}
      />

      {error.submission ? (
        <ThemedText style={styles.errorText}>{error.submission}</ThemedText>
      ) : null}

      <Button
        title="Save Settings"
        onPress={handleSaveSettings}
        style={styles.button}
        loading={loading}
      />

      <Button
        title="Logout"
        onPress={handleLogout}
        loading={loading}
        style={styles.button}
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#323232",
    marginVertical: 20,
  },
  errorText: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
});

export default Settings;
