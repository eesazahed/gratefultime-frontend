import React, { useCallback, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Container } from "../../components/ui/Container";
import { ThemedText } from "../../components/ThemedText";
import AppleSignInPage from "../../components/AppleSignInPage";
import { useFocusEffect } from "expo-router";
import { scheduleDailyNotification } from "@/utils/scheduleDailyNotification";
import * as Notifications from "expo-notifications";

import { useUser } from "@/context/UserContext";

const Home = () => {
  const { token } = useAuth();
  const { fetchUnlockTime, preferredUnlockTime } = useUser();

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Notification permission not granted");
      }
    };
    requestPermissions();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchUnlockTime();
        if (preferredUnlockTime) {
          scheduleDailyNotification(preferredUnlockTime);
        }
      }
    }, [token, preferredUnlockTime, fetchUnlockTime])
  );

  return (
    <Container style={styles.container}>
      {token ? (
        <View>
          <ThemedText style={styles.text}>You are signed in!</ThemedText>
        </View>
      ) : (
        <View>
          <AppleSignInPage />
        </View>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "600",
  },
});

export default Home;
