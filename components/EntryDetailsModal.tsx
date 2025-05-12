import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Modal, Animated } from "react-native";
import EntryCard from "./EntryCard";

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

  const handleClose = () => {
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
  };

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
          {entryDetails?.length === 0 ? (
            <Text style={styles.noDataText}>
              No details available for this entry.
            </Text>
          ) : (
            entryDetails?.map((entry: any) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                showDelete
                onDelete={handleClose}
              />
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
    marginHorizontal: 20,
  },
  noDataText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 40,
    color: "#8f8f8f",
    fontStyle: "italic",
  },
});

export default EntryDetailsModal;
