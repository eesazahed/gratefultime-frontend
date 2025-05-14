import React, { useCallback, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Container } from "../../components/ui/Container";
import { ThemedText } from "../../components/ThemedText";
import AppleSignInPage from "../../components/AppleSignInPage";
import { useFocusEffect } from "expo-router";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BackendServer } from "@/constants/BackendServer";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true, // look into this
  }),
});

const getExpoPushToken = async (userAuthToken: string | null) => {
  if (Device.isDevice && userAuthToken) {
    const { status } = await Notifications.requestPermissionsAsync();

    if (status !== "granted") return;

    try {
      const { data: pushToken } = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas.projectId,
      });

      if (pushToken) {
        await fetch(`${BackendServer}/users/update_push_token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userAuthToken}`,
          },
          body: JSON.stringify({ expoPushToken: pushToken }),
        });

        await AsyncStorage.setItem("hasSentPushToken", "true");
      }
    } catch (error) {
      console.error("Error generating or sending token:", error);
    }
  }
};

const Home = () => {
  const { token } = useAuth();

  useFocusEffect(
    useCallback(() => {
      const handlePushToken = async () => {
        const hasSentToken = await AsyncStorage.getItem("hasSentPushToken");
        if (hasSentToken !== "true" && token) {
          await getExpoPushToken(token);
        }
      };

      handlePushToken();
    }, [token])
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
