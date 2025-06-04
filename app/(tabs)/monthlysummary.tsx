import React, { useCallback, useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useFocusEffect, useRouter } from "expo-router";
import Container from "../../components/ui/Container";
import { BackendServer } from "@/constants/BackendServer";
import ThemedText from "@/components/ThemedText";
import Header from "../../components/ui/Header";
import Markdown from "react-native-markdown-display";

const MonthlySummary = () => {
  const { token } = useAuth();
  const router = useRouter();

  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const [visibleMarkdown, setVisibleMarkdown] = useState<string>("");
  const [wordIndex, setWordIndex] = useState<number>(0);

  useFocusEffect(
    useCallback(() => {
      const fetchSummary = async () => {
        setLoading(true);
        try {
          if (!token) {
            console.error("JWT token not found");
            setLoading(false);
            return;
          }

          const response = await fetch(`${BackendServer}/ai/monthlysummary`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.status === 429) {
            console.warn("Rate limit exceeded");
            setSummary("Rate limit exceeded. Please try again later.");
            setLoading(false);
            return;
          }

          const data = await response.json();

          if (!response.ok) {
            console.error("Error fetching monthly summary:", data);
            setSummary("");
            setLoading(false);
            return;
          }

          const fullText = data.summary || "";
          setSummary(fullText);
          setVisibleMarkdown("");
          setWordIndex(0);
        } catch (error) {
          console.error("Error fetching monthly summary:", error);
          setSummary("");
        } finally {
          setLoading(false);
        }
      };

      fetchSummary();
    }, [token])
  );

  useEffect(() => {
    if (!loading && summary) {
      const words = summary.split(/\s+/);
      setVisibleMarkdown("");
      setWordIndex(0);

      const interval = setInterval(() => {
        setWordIndex((prev) => {
          const nextIndex = prev + 1;
          if (nextIndex > words.length) {
            clearInterval(interval);
            return prev;
          }
          setVisibleMarkdown(words.slice(0, nextIndex).join(" "));
          return nextIndex;
        });
      }, 30);

      return () => clearInterval(interval);
    }
  }, [loading, summary]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Container style={styles.container}>
        <Header title="AI Summary" style={{ marginBottom: 0 }} />
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => router.push("/(tabs)")}
        >
          <ThemedText style={styles.goBack}>Go back</ThemedText>
        </TouchableOpacity>
        {loading ? (
          <ActivityIndicator style={{ margin: "auto" }} />
        ) : summary ? (
          <Markdown
            style={{ body: { fontSize: 18, color: "#fff", lineHeight: 30 } }}
          >
            {visibleMarkdown}
          </Markdown>
        ) : (
          <ThemedText>No summary available.</ThemedText>
        )}
      </Container>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 200,
  },
  goBack: {
    textAlign: "center",
    color: "#05c3fc",
    fontSize: 18,
    textDecorationLine: "underline",
    marginBottom: 40,
  },
});

export default MonthlySummary;
