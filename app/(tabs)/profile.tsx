import React, { useCallback, useState } from "react";
import {
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { Container } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import { ThemedText } from "../../components/ThemedText";
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

const PAGE_SIZE = 1;

const Profile = () => {
  const { token } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const fetchEntries = async (reset = false) => {
    try {
      if (!token) {
        console.error("JWT token not found");
        return;
      }

      const resOffset = reset ? 0 : offset;
      const response = await fetch(
        `http://localhost:5000/entries?limit=${PAGE_SIZE}&offset=${resOffset}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await response.json();
      const newEntries = json.data;
      const nextOffset = json.nextOffset;

      if (reset) {
        setEntries(newEntries);
      } else {
        setEntries((prev) => [...prev, ...newEntries]);
      }

      setHasMore(nextOffset !== null);
      setOffset(nextOffset ?? offset);
    } catch (err) {
      console.error("Failed to fetch entries", err);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchEntries(true);
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
        setEntries((prev) => prev.filter((entry) => entry.id !== id));
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
        <ThemedText style={styles.gratitudeTitle}>Grateful for:</ThemedText>
        <ThemedText style={styles.entryText}>1. {item.entry1}</ThemedText>
        <ThemedText style={styles.entryText}>2. {item.entry2}</ThemedText>
        <ThemedText style={styles.entryText}>3. {item.entry3}</ThemedText>
        <ThemedText style={styles.gratitudeTitle}>
          "{item.user_prompt}"
        </ThemedText>
        <ThemedText style={styles.responseText}>
          "{item.user_prompt_response}"
        </ThemedText>
      </Container>
    );
  };

  const handleLoadMore = () => {
    if (hasMore && !isFetchingMore) {
      setIsFetchingMore(true);
      fetchEntries();
    }
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
        {!entries || entries.length === 0 ? (
          <ThemedText style={styles.noDataText}>
            You haven't written anything yet.
          </ThemedText>
        ) : (
          <>
            <FlatList
              data={entries}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderEntry}
              scrollEnabled={false}
            />
            {hasMore ? (
              <Button
                onPress={handleLoadMore}
                title="Load More"
                loading={isFetchingMore}
                style={styles.loadMoreButton}
              />
            ) : (
              <ThemedText style={styles.noDataText}>
                No more posts to load
              </ThemedText>
            )}
          </>
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
  noDataText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 40,
    color: "#8f8f8f",
    fontStyle: "italic",
  },
  entryCard: {
    width: "100%",
    backgroundColor: "#121212",
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
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#3af07c",
  },
  entryText: {
    color: "#fff",
    marginBottom: 8,
    fontSize: 15,
  },
  responseText: {
    color: "#fff",
    marginBottom: 20,
    fontSize: 15,
  },
  gratitudeTitle: {
    color: "#8f8f8f",
    fontStyle: "italic",
    marginBottom: 10,
    fontSize: 16,
  },
  deleteButton: {
    position: "absolute",
    top: 4,
    right: 12,
    backgroundColor: "transparent",
    padding: 8,
    borderRadius: 12,
    zIndex: 1,
    fontSize: 28,
    color: "#bbbbbb",
  },
  loadMoreButton: {
    backgroundColor: "#1c1c1c",
    borderWidth: 1,
    borderColor: "#333",
    marginVertical: 20,
  },
});

export default Profile;
