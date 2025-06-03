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
import Container from "../../components/ui/Container";
import Button from "../../components/ui/Button";
import ThemedText from "../../components/ThemedText";
import Header from "../../components/ui/Header";
import { BackendServer } from "@/constants/BackendServer";
import { useFocusEffect } from "expo-router";
import { scheduleDailyNotification } from "@/utils/scheduleDailyNotification";
import { Dropdown } from "react-native-element-dropdown";
import { timezones } from "../../constants/timezones";

const Settings = () => {
  const router = useRouter();
  const { token, logout } = useAuth();
  const { fetchUserData, preferredUnlockTime, loading, userTimezone } =
    useUser();

  const [selectedHour, setSelectedHour] = useState<string>(
    preferredUnlockTime?.toString() || ""
  );
  const [selectedTimezone, setSelectedTimezone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  const [error, setError] = useState<{
    unlockTime?: string;
    submission?: string;
  }>({});
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const timezoneOptions = timezones.map((tz) => ({
    label: tz.replace(/\//g, " - ").replace(/_/g, " "),
    value: tz,
  }));

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch {
      setError({ submission: "Error logging out. Please try again." });
    }
  };

  const handleSaveSettings = async () => {
    const parsedHour = parseInt(selectedHour, 10);
    if (isNaN(parsedHour) || parsedHour < 0 || parsedHour > 23) {
      setError({ unlockTime: "Please enter a valid hour (0-23)" });
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
          user_timezone: selectedTimezone,
        }),
      });

      const data = await response.json();

      if (response.status === 429) {
        setError({
          submission: "Rate limit exceeded. Please try again later.",
        });
        return;
      }

      if (!response.ok) {
        setError({ submission: data.message || "Error saving settings." });
        return;
      }

      setIsDirty(false);
      setError({});
      scheduleDailyNotification(parsedHour);
    } catch {
      setError({ submission: "Could not connect to server." });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Confirm Deletion",
      "All of your entries will be permanently deleted. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
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

              if (response.status === 429) {
                setError({
                  submission: "Rate limit exceeded. Please try again later.",
                });
                return;
              }

              if (!response.ok) {
                setError({
                  submission: data.message || "Error deleting account.",
                });
                return;
              }

              await logout();
              router.push("/");
            } catch {
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
      const asyncFetchData = async () => {
        await fetchUserData();
        if (preferredUnlockTime !== null) {
          setSelectedHour(preferredUnlockTime.toString());
        }
        if (userTimezone) {
          setSelectedTimezone(userTimezone);
        }
      };

      asyncFetchData();
    }, [preferredUnlockTime, userTimezone])
  );

  useFocusEffect(
    useCallback(() => {
      const hasChanges =
        selectedHour !== preferredUnlockTime?.toString() ||
        selectedTimezone !== userTimezone;
      setIsDirty(hasChanges);
    }, [selectedHour, selectedTimezone, preferredUnlockTime, userTimezone])
  );

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

        {error.unlockTime && (
          <ThemedText style={styles.errorText}>{error.unlockTime}</ThemedText>
        )}

        <Button
          title="Open notification settings"
          style={styles.settingsButton}
          onPress={() => Linking.openSettings()}
        />

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
              <View>
                <ThemedText style={styles.label}>Timezone</ThemedText>
                <Dropdown
                  data={timezoneOptions}
                  labelField="label"
                  valueField="value"
                  value={selectedTimezone}
                  onChange={(item) => {
                    setSelectedTimezone(item.value);
                  }}
                  placeholder="Select timezone"
                  style={styles.dropdown}
                  containerStyle={styles.dropdownContainerStyle}
                  itemTextStyle={{ color: "#fff" }}
                  itemContainerStyle={styles.dropdownItemContainerStyle}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  activeColor="#323232"
                  autoScroll={false}
                />
              </View>
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
  container: { flexGrow: 1, paddingBottom: 200 },
  label: {
    fontSize: 16,
    color: "#8f8f8f",
    fontStyle: "italic",
    marginTop: 20,
    marginBottom: 10,
  },
  hourSelector: {
    width: "100%",
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
  },
  hourDisplay: {
    height: 50,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1c1c1c",
    borderWidth: 1,
    borderColor: "#333",
    marginHorizontal: 20,
    borderRadius: 10,
  },
  hourDisplayText: { fontSize: 24 },
  selectInput: {
    height: 50,
    backgroundColor: "#1c1c1c",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  selectInputLabel: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 48,
  },
  settingsButton: {
    backgroundColor: "#323232",
    marginTop: 5,
    marginBottom: 20,
  },
  errorText: { color: "red", fontSize: 14, marginBottom: 14 },
  buttonGroup: { marginVertical: 40 },
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
  dropdown: {
    backgroundColor: "#323232",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 10,
    marginBottom: 30,
  },
  placeholderStyle: {
    color: "#aaa",
    fontSize: 16,
  },
  selectedTextStyle: {
    color: "#fff",
    fontSize: 16,
  },
  dropdownContainerStyle: {
    backgroundColor: "#1c1c1c",
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 10,
    borderWidth: 0,
  },
  dropdownItemContainerStyle: {
    color: "#fff",
    backgroundColor: "#1c1c1c",
  },
  iconStyle: {
    width: 20,
    height: 20,
    tintColor: "#fff",
  },
});

export default Settings;
