import React, { useState, useEffect } from "react";
import { StyleSheet, View, Switch } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
import { Container } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import { ThemedText } from "../../components/ThemedText";
import { Header } from "../../components/ui/Header";
import { BackendServer } from "@/constants/BackendServer";

const Settings = () => {
  const router = useRouter();
  const { token, logout } = useAuth();
  const { preferredUnlockTime, notifsOn, loading, fetchUnlockTime } = useUser();

  const [selectedHour, setSelectedHour] = useState<string>(
    preferredUnlockTime?.toString() || ""
  );
  const [notifsEnabled, setNotifsEnabled] = useState<boolean>(notifsOn);
  const [error, setError] = useState<{
    unlockTime?: string;
    submission?: string;
    notifsOn?: string;
  }>({});
  const [isDirty, setIsDirty] = useState<boolean>(false);

  useEffect(() => {
    if (preferredUnlockTime !== null) {
      setSelectedHour(preferredUnlockTime.toString());
      setNotifsEnabled(notifsOn);
    }
  }, [preferredUnlockTime, notifsOn]);

  useEffect(() => {
    const hasChanges =
      selectedHour !== preferredUnlockTime?.toString() ||
      notifsEnabled !== notifsOn;
    setIsDirty(hasChanges);
  }, [selectedHour, notifsEnabled, preferredUnlockTime, notifsOn]);

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
      const response = await fetch(`${BackendServer}/users/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          preferred_unlock_time: parsedHour,
          notifs_on: notifsEnabled,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const newErrors = { unlockTime: "", notifsOn: "", submission: "" };
        if (data.errorCode === "unlockTime") {
          newErrors.unlockTime = data.message;
        } else if (data.errorCode === "notifsOn") {
          newErrors.notifsOn = data.message;
        } else {
          newErrors.submission = data.message || "Error saving settings.";
        }
        setError(newErrors);
        return;
      }

      setError({ unlockTime: "", notifsOn: "", submission: "" });
      setIsDirty(false);
    } catch (err) {
      console.error("Network error:", err);
      setError({ submission: "Could not connect to server." });
    }
  };

  const handleDecrement = () =>
    setSelectedHour(((parseInt(selectedHour) + 23) % 24).toString());
  const handleIncrement = () =>
    setSelectedHour(((parseInt(selectedHour) + 1) % 24).toString());

  const formatHour = (hourString: string) => {
    const hour = parseInt(hourString, 10);
    if (isNaN(hour)) return "";
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:00 ${ampm}`;
  };

  return (
    <Container>
      <Header title="Settings" />

      <View style={styles.switchContainer}>
        <ThemedText style={{ ...styles.label, marginTop: 0 }}>
          Enable Notifications
        </ThemedText>
        <Switch
          value={notifsEnabled}
          onValueChange={setNotifsEnabled}
          ios_backgroundColor="gray"
        />
      </View>
      {error.notifsOn && (
        <ThemedText style={styles.errorText}>{error.notifsOn}</ThemedText>
      )}

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
        <View style={styles.hourDisplay}>
          <ThemedText>{selectedHour}</ThemedText>
        </View>
        <Button
          title="+"
          onPress={handleIncrement}
          style={styles.adjustButton}
          largeText
        />
      </View>

      {error.unlockTime && (
        <ThemedText style={styles.errorText}>{error.unlockTime}</ThemedText>
      )}

      <View style={styles.buttonGroup}>
        {error.submission && (
          <ThemedText style={{ ...styles.errorText, textAlign: "center" }}>
            {error.submission}
          </ThemedText>
        )}

        <Button
          title="Save Settings"
          onPress={handleSaveSettings}
          disabled={!isDirty}
          style={[styles.settingsButton, !isDirty && styles.disabledButton]}
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
  label: {
    fontSize: 16,
    color: "#8f8f8f",
    fontStyle: "italic",
    marginTop: 20,
  },
  hourSelector: {
    width: "100%",
    marginHorizontal: "auto",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
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
    height: 50,
    borderRadius: 8,
    display: "flex",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1c1c1c",
    borderWidth: 1,
    borderColor: "#333",
    marginHorizontal: 20,
    userSelect: "none",
  },
  switchContainer: {
    marginTop: 20,
    marginBottom: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingsButton: {
    backgroundColor: "#323232",
    marginTop: 5,
    marginBottom: 20,
    transitionDuration: "0.25s",
  },
  disabledButton: {
    opacity: 0.5,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 14,
  },
  buttonGroup: {
    marginVertical: 40,
  },
});

export default Settings;
