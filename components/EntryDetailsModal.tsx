import React, { useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import EntryCard from "./EntryCard";

import type { Entry } from "@/types";

type EntryDetailsModalProps = {
  visible: boolean;
  entryDetails?: Entry;
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
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
          <TouchableWithoutFeedback onPress={() => {}}>
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
              {entryDetails && (
                <EntryCard
                  key={entryDetails.id}
                  entry={entryDetails}
                  showDelete
                  onDelete={handleClose}
                />
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
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
