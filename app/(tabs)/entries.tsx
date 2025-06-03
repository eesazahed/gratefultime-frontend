import React, { useCallback, useState } from "react";
import {
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useFocusEffect } from "expo-router";
import Container from "../../components/ui/Container";
import Button from "../../components/ui/Button";
import ThemedText from "../../components/ThemedText";
import Header from "../../components/ui/Header";
import { BackendServer } from "@/constants/BackendServer";
import EntryCard from "../../components/EntryCard";

import type { Entry } from "@/types";

const PAGE_SIZE = 10;

const Entries = () => {
  const { token } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const fetchEntries = async (reset = false) => {
    try {
      if (!token) return;

      const resOffset = reset ? 0 : offset;
      const response = await fetch(
        `${BackendServer}/entries?limit=${PAGE_SIZE}&offset=${resOffset}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 429) {
        console.warn("Rate limit exceeded");
        setLoading(false);
        setIsFetchingMore(false);
        return;
      }

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
      if (!token) return;

      const response = await fetch(`${BackendServer}/entries/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setEntries((prev) => prev.filter((entry) => entry.id !== id));
      } else {
        console.error("Failed to delete entry.");
      }
    } catch (err) {
      console.error("Error deleting entry:", err);
    }
  };

  const renderEntry = ({ item }: { item: Entry }) => {
    const entryDate = new Date(item.timestamp);
    const today = new Date();
    const isToday =
      entryDate.getDate() === today.getDate() &&
      entryDate.getMonth() === today.getMonth() &&
      entryDate.getFullYear() === today.getFullYear();

    return (
      <EntryCard
        entry={item}
        showDelete={isToday}
        onDelete={() => deleteEntry(item.id)}
      />
    );
  };

  const handleLoadMore = () => {
    if (hasMore && !isFetchingMore) {
      setIsFetchingMore(true);
      fetchEntries();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Container>
        <Header title="Your Past Entries" style={{ marginBottom: 5 }} />
        {loading ? (
          <ActivityIndicator size="large" style={styles.loadingContainer} />
        ) : !entries || entries.length === 0 ? (
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
                No more entries to load
              </ThemedText>
            )}
          </>
        )}
      </Container>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingBottom: 200 },
  loadingContainer: {
    marginTop: 64,
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
  loadMoreButton: {
    backgroundColor: "#1c1c1c",
    borderWidth: 1,
    borderColor: "#333",
    marginVertical: 40,
  },
});

export default Entries;
