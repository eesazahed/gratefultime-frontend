import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
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
    shouldShowList: true,
  }),
});

async function getExpoPushToken(userAuthToken: string | null) {
  if (Device.isDevice) {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      //   console.log("Permission not granted for push notifications");
      return null;
    }

    try {
      const { data: pushToken } = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas.projectId,
      });

      //   console.log("Expo push token:", pushToken);

      if (userAuthToken && pushToken) {
        await savePushTokenToBackend(pushToken, userAuthToken);
      }

      return pushToken;
    } catch (error) {
      console.error("Error getting Expo push token:", error);
      return null;
    }
  } else {
    // console.log("Push notifications must be enabled on a physical device.");
    return null;
  }
}

async function savePushTokenToBackend(
  expoPushToken: string,
  userAuthToken: string
) {
  try {
    const response = await fetch(`${BackendServer}/users/update_push_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userAuthToken}`,
      },
      body: JSON.stringify({ expoPushToken }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Error saving push token:", result);
    }

    // if (response.ok) {
    //   console.log("Push token saved successfully:", result);
    // } else {
    //   console.error("Error saving push token:", result);
    // }
  } catch (error) {
    console.error("Error sending push token to backend:", error);
  }
}

interface NotifPushTokenProps {
  userAuthToken: string | null;
}

const NotifPushToken = ({ userAuthToken }: NotifPushTokenProps) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  //   useEffect(() => {
  //     const subscription = Notifications.addNotificationReceivedListener(
  //       (notification) => {
  //         console.log("Foreground notification:", notification);
  //       }
  //     );
  //     return () => subscription.remove();
  //   }, []);

  useEffect(() => {
    const checkStoredToken = async () => {
      const storedToken = await AsyncStorage.getItem("expoPushToken");

      if (storedToken) {
        setExpoPushToken(storedToken);
      } else {
        if (userAuthToken) {
          const token = await getExpoPushToken(userAuthToken);
          if (token) {
            setExpoPushToken(token);
            await AsyncStorage.setItem("expoPushToken", token);
          }
        }
      }
    };

    checkStoredToken();
  }, [userAuthToken]);

  useEffect(() => {
    if (expoPushToken) {
      const sendPushToken = async () => {
        if (userAuthToken && expoPushToken) {
          await savePushTokenToBackend(expoPushToken, userAuthToken);
        }
      };
      sendPushToken();
    }
  }, [expoPushToken, userAuthToken]);

  return (
    <View style={styles.container}>
      {expoPushToken ? (
        <Text style={styles.tokenText}>Your Push Token: {expoPushToken}</Text>
      ) : (
        <Text style={styles.noTokenText}>No push token available</Text>
      )}
      {expoPushToken && (
        <Button
          title="Resend Push Token"
          onPress={async () => {
            if (userAuthToken) {
              const token = await getExpoPushToken(userAuthToken);
              if (token) {
                setExpoPushToken(token);
                await AsyncStorage.setItem("expoPushToken", token);
              }
            }
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    alignItems: "center",
  },
  tokenText: {
    fontSize: 18,
    fontWeight: "600",
    color: "green",
  },
  noTokenText: {
    fontSize: 18,
    fontWeight: "600",
    color: "red",
  },
});

export default NotifPushToken;
