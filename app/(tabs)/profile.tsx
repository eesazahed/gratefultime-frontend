import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        if (!token) {
          console.error("JWT token not found");
          return;
        }

        const res = await fetch(`http://localhost:5000/entries`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        setEntries(json.data);
      } catch (err) {
        console.error("Failed to fetch entries", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [token]);

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
      <View style={styles.entryCard}>
        {isToday && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteEntry(item.id)}
          >
            <Text style={styles.closeButtonText}>&times;</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.dateText}>{formattedDate}</Text>
        <Text style={styles.sectionTitle}>Grateful for:</Text>
        <Text style={styles.entryText}>1. {item.entry1}</Text>
        <Text style={styles.entryText}>2. {item.entry2}</Text>
        <Text style={styles.entryText}>3. {item.entry3}</Text>
        <Text style={styles.prompt}>"{item.user_prompt}"</Text>
        <Text style={styles.response}>"{item.user_prompt_response}"</Text>
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Your Past Entries</Text>
      {entries.length === 0 ? (
        <Text style={styles.noData}>You haven't written anything yet.</Text>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderEntry}
          scrollEnabled={false}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#FAFAFA",
    flexGrow: 1,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
    color: "#2C3E50",
    textAlign: "center",
  },
  noData: {
    fontSize: 16,
    color: "#95A5A6",
    textAlign: "center",
    marginTop: 40,
  },
  entryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#2980B9",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 6,
  },
  entryText: {
    fontSize: 15,
    color: "#34495E",
    marginBottom: 4,
  },
  prompt: {
    fontSize: 15,
    fontStyle: "italic",
    color: "#7F8C8D",
    marginTop: 10,
  },
  response: {
    fontSize: 16,
    color: "#2C3E50",
    marginTop: 6,
  },
  deleteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "transparent",
    padding: 8,
    borderRadius: 12,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 24,
    color: "gray",
  },
});

export default Profile;
