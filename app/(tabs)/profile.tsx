import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet, ActivityIndicator, ScrollView, Pressable } from "react-native";
import { useAuth } from "../../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { Container } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import { ThemedText } from "../../components/ThemedText";
import { IconSymbol } from "../../components/ui/IconSymbol";
import { Header } from "../../components/ui/Header";

type Entry = {
  id: number;
  user_id: number;
  entry1: string;
  entry2: string;
  entry3: string;
  user_prompt: string;
  user_prompt_response: string;
  timestamp: string;
};

const Profile = () => {
  const { token } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchEntries = async () => {
        try {
          if (!token) {
            console.error("JWT token not found");
            return;
          }

          const response = await fetch(`http://localhost:5000/entries`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          const json = await response.json();
          setEntries(json.data);
        } catch (err) {
          console.error("Failed to fetch entries", err);
        } finally {
          setLoading(false);
        }
      };

      fetchEntries();
    }, [token])
  );

  const deleteEntry = async (id: number) => {
    try {
      if (!token) {
        console.error("JWT token not found");
        return;
      }

      const response = await fetch(`http://localhost:5000/entries/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setEntries(entries.filter((entry) => entry.id !== id));
        await AsyncStorage.removeItem("RESET_TIME");
      } else {
        console.error("Failed to delete entry.");
      }
    } catch (err) {
      console.error("Error deleting entry:", err);
    }
  };

  const renderEntry = ({ item }: { item: Entry }) => {
    const formattedDate = new Date(item.timestamp).toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    const entryDate = new Date(item.timestamp);
    const today = new Date();
    const isToday =
      entryDate.getDate() === today.getDate() &&
      entryDate.getMonth() === today.getMonth() &&
      entryDate.getFullYear() === today.getFullYear();

    return (
      <Container style={styles.entryCard}>
        {isToday && (
          <Pressable
            style={styles.deleteButton}
            onPress={() => deleteEntry(item.id)}
          >
        <ThemedText style={styles.deleteButton}>&times;</ThemedText>
        </Pressable>
        )}

        <ThemedText style={styles.dateText}>{formattedDate}</ThemedText>
        <ThemedText style={styles.sectionTitle}>Grateful for:</ThemedText>
        <ThemedText style={styles.entryText}>1. {item.entry1}</ThemedText>
        <ThemedText style={styles.entryText}>2. {item.entry2}</ThemedText>
        <ThemedText style={styles.entryText}>3. {item.entry3}</ThemedText>
        <ThemedText style={styles.prompt}>"{item.user_prompt}"</ThemedText>
        <ThemedText style={styles.response}>"{item.user_prompt_response}"</ThemedText>
      </Container>
    );
  };

  if (loading) {
    return (
      <Container style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </Container>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Container>
        <Header title="Your Past Entries" />
        {entries.length === 0 ? (
          <ThemedText style={styles.noData}>You haven't written anything yet.</ThemedText>
        ) : (
          <FlatList
            data={entries}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderEntry}
            scrollEnabled={false}
          />
        )}
      </Container>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noData: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },
  entryCard: {
    backgroundColor: "#121212",
    width: "85%",
    marginHorizontal: "auto",
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
    color: "#7dcfff",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 6,
  },
  entryText: {
    fontSize: 15,
    marginBottom: 4,
  },
  prompt: {
    fontSize: 15,
    fontStyle: "italic",
    marginTop: 10,
  },
  response: {
    fontSize: 16,
    marginTop: 6,
  },
  deleteButton: {
    position: "absolute",
    top: 10,
    right: 20,
    padding: 6,
    borderRadius: 12,
    zIndex: 1,
    fontSize: 36,
  },
});

export default Profile;
