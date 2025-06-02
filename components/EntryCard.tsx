import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import type { Entry } from "@/types";

type EntryCardProps = {
  entry: Entry;
  showDelete?: boolean;
  onDelete: () => void;
};

const EntryCard = ({ entry, showDelete = false, onDelete }: EntryCardProps) => {
  return (
    <View style={styles.entryContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.dateText}>
          {new Date(entry.timestamp).toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
        {showDelete && (
          <TouchableOpacity
            onPress={onDelete}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Text style={styles.closeButtonText}>&times;</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.gratitudeTitle}>Grateful for:</Text>
      <View style={styles.gratitudeList}>
        <Text style={styles.entryText}>
          <Text style={styles.gray}>1.</Text> {entry.entry1}
        </Text>
        <Text style={styles.entryText}>
          <Text style={styles.gray}>2.</Text> {entry.entry2}
        </Text>
        <Text style={styles.entryText}>
          <Text style={styles.gray}>3.</Text> {entry.entry3}
        </Text>
      </View>
      <Text style={styles.gratitudeTitle}>"{entry.user_prompt}"</Text>
      <Text style={styles.responseText}>{entry.user_prompt_response}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  entryContainer: {
    marginVertical: 20,
    backgroundColor: "#1c1c1c",
    borderRadius: 20,
    paddingHorizontal: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3af07c",
  },
  gratitudeList: {
    marginBottom: 15,
  },
  entryText: {
    color: "#fff",
    marginBottom: 8,
    fontSize: 15,
  },
  gray: {
    color: "#8f8f8f",
  },
  gratitudeTitle: {
    color: "#8f8f8f",
    fontStyle: "italic",
    marginBottom: 10,
    fontSize: 16,
  },
  responseText: {
    color: "#fff",
    marginTop: 10,
    marginBottom: 20,
    fontSize: 15,
  },
  closeButton: {
    backgroundColor: "transparent",
    borderRadius: 12,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 40,
    marginBottom: 10,
    color: "#bbbbbb",
  },
});

export default EntryCard;
