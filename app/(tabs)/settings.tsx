import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Alert,
  Text,
  Linking,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
import { Container } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import { ThemedText } from "../../components/ThemedText";
import { Header } from "../../components/ui/Header";
import { BackendServer } from "@/constants/BackendServer";
import { useFocusEffect } from "expo-router";
import { scheduleDailyNotification } from "@/utils/scheduleDailyNotification";

const Settings = () => {
  const router = useRouter();
  const { token, logout } = useAuth();
  const { fetchUserData, preferredUnlockTime, loading } = useUser();

  const [selectedHour, setSelectedHour] = useState<string>(
    preferredUnlockTime?.toString() || ""
  );

  const [error, setError] = useState<{
    unlockTime?: string;
    submission?: string;
  }>({});
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

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

    setSaving(true);

    try {
      const response = await fetch(`${BackendServer}/users/settings`, {
        method: "POST",
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
      setIsDirty(false);
      scheduleDailyNotification(parsedHour);
    } catch (err) {
      console.error("Network error:", err);
      setError({ submission: "Could not connect to server." });
    } finally {
      setSaving(false);
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

  const handleDeleteAccount = () => {
    Alert.alert(
      "Confirm Deletion",
      "All of your entries will be permanently deleted. Are you sure?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(
                `${BackendServer}/users/deleteaccount`,
                {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              const data = await response.json();

              if (!response.ok) {
                setError({
                  submission: data.message || "Error deleting account.",
                });
                return;
              }

              await logout();
              router.push("/");
            } catch (err) {
              console.error("Network error:", err);
              setError({ submission: "Could not connect to server." });
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
      if (preferredUnlockTime !== null) {
        setSelectedHour(preferredUnlockTime.toString());
      }
    }, [preferredUnlockTime])
  );

  useFocusEffect(
    useCallback(() => {
      const hasChanges = selectedHour !== preferredUnlockTime?.toString();
      setIsDirty(hasChanges);
    }, [selectedHour, preferredUnlockTime])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Container>
        <Header title="Settings" />

        <ThemedText style={styles.label}>
          Preferred unlock time: {formatHour(selectedHour)}
        </ThemedText>

        <View style={styles.hourSelector}>
          <Button
            icon="remove"
            onPress={handleDecrement}
            style={styles.adjustButton}
          />
          <View style={styles.hourDisplay}>
            <ThemedText style={styles.hourDisplayText}>
              {selectedHour}
            </ThemedText>
          </View>
          <Button
            icon="add"
            onPress={handleIncrement}
            style={styles.adjustButton}
          />
        </View>

        <Button
          title="Open notification settings"
          style={styles.settingsButton}
          onPress={() => Linking.openSettings()}
        />

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
            disabled={!isDirty || saving}
            loading={saving}
            noLoading
            style={styles.settingsButton}
          />

          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => setShowAdvanced((prev) => !prev)}
            style={styles.advancedToggle}
          >
            <Text style={styles.advancedToggleText}>
              {showAdvanced ? "Hide account settings" : "Show account settings"}
            </Text>
          </TouchableOpacity>
          {showAdvanced && (
            <View style={styles.advancedSettings}>
              <Button
                title="Logout"
                onPress={handleLogout}
                loading={loading}
                style={styles.settingsButton}
              />
              <Button
                title="Delete Account"
                onPress={handleDeleteAccount}
                style={[styles.settingsButton, { backgroundColor: "#8c2727" }]}
              />
            </View>
          )}
        </View>
      </Container>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 100,
  },
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
    marginBottom: 20,
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
  hourDisplayText: {
    fontSize: 24,
    lineHeight: 0,
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
  advancedToggle: {
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 10,
    alignItems: "center",
  },
  advancedToggleText: {
    color: "#ccc",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  advancedSettings: {
    paddingBottom: 10,
  },
});

export default Settings;
