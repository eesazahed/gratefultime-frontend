import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import AppleSignInPage from "../../components/AppleSignInPage";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { scheduleDailyNotification } from "@/utils/scheduleDailyNotification";
import { useUser } from "@/context/UserContext";
import { BackendServer } from "@/constants/BackendServer";
import { useMonthlyCount } from "@/context/MonthlyCountProvider";
import * as Notifications from "expo-notifications";

import Container from "../../components/ui/Container";
import LargeLink from "@/components/ui/LargeLink";
import Header from "@/components/ui/Header";
import ThemedText from "@/components/ThemedText";
import Button from "@/components/ui/Button";

const Home = () => {
  const { token } = useAuth();
  const { fetchUserData, preferredUnlockTime } = useUser();
  const { fetchMonthlyCount, monthlyCount } = useMonthlyCount();
  const router = useRouter();

  const [monthlyCountData, setMonthlyCountData] = useState<number | null>(null);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [serverAvailable, setServerAvailable] = useState<boolean | null>(null);

  const checkServerStatus = useCallback(async () => {
    try {
      const response = await fetch(BackendServer);
      const data = await response.json();
      const isRunning = data.message === "server running";
      setServerAvailable((prev) => (prev !== isRunning ? isRunning : prev));
    } catch {
      setServerAvailable((prev) => (prev !== false ? false : prev));
    }
  }, []);

  const retry = () => {
    checkServerStatus();
  };

  useEffect(() => {
    const initialize = async () => {
      checkServerStatus();
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Notification permission not granted");
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    if (preferredUnlockTime) {
      scheduleDailyNotification(preferredUnlockTime);
    }
  }, [preferredUnlockTime]);

  useEffect(() => {
    if (typeof monthlyCount === "number") {
      setMonthlyCountData(monthlyCount);
    }
  }, [monthlyCount]);

  useFocusEffect(
    useCallback(() => {
      const asyncFetchData = async () => {
        setLoadingData(true);
        if (token) {
          await fetchUserData();
          await fetchMonthlyCount();
        }
        setLoadingData(false);
      };
      asyncFetchData();
    }, [token])
  );

  if (serverAvailable === false) {
    return (
      <Container style={styles.centered}>
        <ThemedText style={styles.lockedText}>
          Could not connect to server
        </ThemedText>
        <Button
          title={"Retry"}
          onPress={retry}
          variant="outline"
          style={styles.unlockButton}
        />
      </Container>
    );
  }

  if (!token) {
    return (
      <Container style={styles.loginContainer}>
        <View>
          <Header
            title="GratefulTime"
            fontSize={34}
            style={{ marginTop: 0, marginBottom: 100 }}
          />
          <AppleSignInPage />
        </View>
      </Container>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Container>
        <Header title="GratefulTime" fontSize={34} />
        <View style={{ marginVertical: 24 }}>
          <ThemedText style={{ fontSize: 24, marginBottom: 8 }}>
            Fill out today's journal
          </ThemedText>
          <LargeLink
            title="Today I'm grateful for"
            onPress={() => router.push("/(tabs)/grateful")}
          />
        </View>
        <View style={{ marginVertical: 24 }}>
          <ThemedText style={{ fontSize: 24, marginBottom: 8 }}>
            Your progress this month
          </ThemedText>
          <LargeLink
            title="This month:"
            data={String(monthlyCountData)}
            loading={loadingData}
            onPress={() => router.push("/(tabs)/calendar")}
          />
        </View>
        <View style={{ marginVertical: 24 }}>
          <ThemedText style={{ fontSize: 24, marginBottom: 8 }}>
            Recap your previous entries
          </ThemedText>
          <LargeLink
            title="AI Summary"
            onPress={() => router.push("/(tabs)/monthlysummary")}
          />
          <ThemedText style={styles.disclaimer}>
            Learn more in our{" "}
            <Link
              style={{ color: "#05c3fc" }}
              href="https://gratefultime.app#privacypolicy"
            >
              privacy policy
            </Link>
          </ThemedText>
        </View>
      </Container>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingBottom: 200 },
  loginContainer: {
    justifyContent: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "600",
  },
  disclaimer: {
    fontSize: 14,
    paddingTop: 16,
    margin: 8,
    color: "#ccc",
    fontStyle: "italic",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  lockedText: {
    fontSize: 18,
    textAlign: "center",
    paddingBottom: 64,
  },
  unlockButton: {
    paddingHorizontal: 20,
    backgroundColor: "#1c1c1c",
    borderWidth: 1,
    borderColor: "#333",
  },
});

export default Home;
