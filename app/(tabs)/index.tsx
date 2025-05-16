import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Container } from "../../components/ui/Container";
import AppleSignInPage from "../../components/AppleSignInPage";
import { useFocusEffect, useRouter } from "expo-router";
import { scheduleDailyNotification } from "@/utils/scheduleDailyNotification";
import * as Notifications from "expo-notifications";

import { useUser } from "@/context/UserContext";
import { LargeLink } from "@/components/ui/LargeLink";
import { Header } from "@/components/ui/Header";
import greeting from "@/utils/greeting";
import { useMonthlyCount } from "@/context/MonthlyCountProvider";

const Home = () => {
  const { token } = useAuth();
  const { fetchUserData, preferredUnlockTime } = useUser();
  const { fetchLast31Entries, monthlyCount } = useMonthlyCount();
  const router = useRouter();

  const [monthlyCountData, setMonthlyCountData] = useState<number | null>(null);
  const [loadingData, setLoadingData] = useState<boolean>(true);

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
      setLoadingData(true);

      if (token) {
        fetchUserData();
        if (preferredUnlockTime) {
          scheduleDailyNotification(preferredUnlockTime);
        }

        fetchLast31Entries();
        if (typeof monthlyCount === "number") {
          setMonthlyCountData(monthlyCount);
          setLoadingData(false);
        }
      }
    }, [
      token,
      preferredUnlockTime,
      fetchUserData,
      monthlyCount,
      fetchLast31Entries,
    ])
  );

  if (!token) {
    return (
      <Container style={styles.loginContainer}>
        <View>
          <AppleSignInPage />
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <Header title={greeting()} />
      <LargeLink
        title="This month:"
        data={String(monthlyCountData)}
        loading={loadingData}
        onPress={() => router.push("/(tabs)/calendar")}
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  loginContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "600",
  },
});

export default Home;
