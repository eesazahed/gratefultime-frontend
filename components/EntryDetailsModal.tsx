import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
} from "react-native";

type EntryDetailsModalProps = {
  visible: boolean;
  entryDetails: any;
  onClose: () => void;
};

const EntryDetailsModal = ({
  visible,
  entryDetails,
  onClose,
}: EntryDetailsModalProps) => {
  const [modalAnim] = useState(new Animated.Value(0));
  const [overlayAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(modalAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        onClose();
      }, 300);
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="none" transparent={true}>
      <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [
                {
                  translateY: modalAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [500, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => {
              Animated.parallel([
                Animated.timing(modalAnim, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }),
                Animated.timing(overlayAnim, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }),
              ]).start();

              setTimeout(() => {
                onClose();
              }, 300);
            }}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Text style={styles.closeButtonText}>&times;</Text>
          </TouchableOpacity>

          {entryDetails?.length === 0 ? (
            <Text style={styles.noDataText}>
              No details available for this entry.
            </Text>
          ) : (
            entryDetails?.map((entry: any) => (
              <View key={entry.id} style={styles.entryContainer}>
                <Text style={styles.dateText}>
                  {new Date(entry.timestamp).toLocaleString("en-US", {
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                  })}
                </Text>

                <Text style={styles.gratitudeTitle}>Grateful for:</Text>
                <View style={styles.gratitudeList}>
                  <Text style={styles.entryText}>1. {entry.entry1}</Text>
                  <Text style={styles.entryText}>2. {entry.entry2}</Text>
                  <Text style={styles.entryText}>3. {entry.entry3}</Text>
                </View>

                <Text style={styles.gratitudeTitle}>"{entry.user_prompt}"</Text>
                <Text style={styles.responseText}>
                  {entry.user_prompt_response}
                </Text>
              </View>
            ))
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContainer: {
    marginHorizontal: 40,
    backgroundColor: "#121212",
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    position: "relative",
  },
  dateText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
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
  gratitudeTitle: {
    color: "#8f8f8f",
    fontStyle: "italic",
    marginBottom: 10,
    fontSize: 16,
  },
  responseText: {
    color: "#fff",
    marginBottom: 20,
    fontSize: 15,
  },
  closeButton: {
    position: "absolute",
    top: 4,
    right: 12,
    backgroundColor: "transparent",
    padding: 8,
    borderRadius: 12,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 28,
    color: "#bbbbbb",
  },
  noDataText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 40,
    color: "#8f8f8f",
    fontStyle: "italic",
  },
  entryContainer: {
    marginBottom: 15,
  },
});

export default EntryDetailsModal;
