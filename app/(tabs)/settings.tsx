import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Container } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import { ThemedText } from "../../components/ThemedText";
import { Header } from "../../components/ui/Header";

const Settings = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <Container style={styles.container}>
      <Header title="Settings" />

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
  },
  button: {
    marginTop: 20,
  },
  errorText: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
});

export default Settings;
