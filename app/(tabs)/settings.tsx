import React, { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Container } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import { ThemedText } from "../../components/ThemedText";
import { Header } from "../../components/ui/Header";
import { Input } from "../../components/ui/Input";

const Settings = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | string>("");

  useEffect(() => {
    const fetchStoredHour = async () => {
      const storedHour = await AsyncStorage.getItem("NOTIFICATION_HOUR");

      if (storedHour) {
        setSelectedHour(Number(storedHour));
      } else {
        const defaultHour = 20;
        await AsyncStorage.setItem("NOTIFICATION_HOUR", defaultHour.toString());
        setSelectedHour(defaultHour);
      }
    };
    fetchStoredHour();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    setError(null);

    try {
      await logout();
      await AsyncStorage.removeItem("RESET_TIME");
      router.push("/");
    } catch (err) {
      setError("Error logging out. Please try again.");
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (
      typeof selectedHour !== "number" ||
      selectedHour < 0 ||
      selectedHour > 23
    ) {
      setError("Please enter a valid hour (0-23).");
      return;
    }

    try {
      await AsyncStorage.setItem("NOTIFICATION_HOUR", selectedHour.toString());
      setError(null);
      console.log("Hour saved:", selectedHour);
    } catch (err) {
      setError("Error saving settings. Please try again.");
      console.error("Save settings error:", err);
    }
  };

  return (
    <Container style={styles.container}>
      <Header title="Settings" />

      <Input
        label="Set Notification Hour (0-23)"
        value={selectedHour !== "" ? selectedHour.toString() : ""}
        onChangeText={(text) => setSelectedHour(Number(text))}
        keyboardType="numeric"
        maxLength={2}
        placeholder="Enter hour"
      />

      <Button
        title="Save Settings"
        onPress={handleSaveSettings}
        style={styles.button}
      />

      <Button
        title="Logout"
        onPress={handleLogout}
        loading={loading}
        style={styles.button}
      />

      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
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
