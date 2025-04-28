import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type MonthNavigationProps = {
  handlePreviousMonth: () => void;
  handleNextMonth: () => void;
  isAtMinMonth: boolean;
  isAtMaxMonth: boolean;
};

const MonthNavigation = ({
  handlePreviousMonth,
  handleNextMonth,
  isAtMinMonth,
  isAtMaxMonth,
}: MonthNavigationProps) => {
  return (
    <View style={styles.navigationButtons}>
      <TouchableOpacity
        onPress={handlePreviousMonth}
        style={[styles.navButton, isAtMinMonth && styles.disabledButton]}
        disabled={isAtMinMonth}
      >
        <Text style={[styles.navText, isAtMinMonth && styles.disabledText]}>
          Previous
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleNextMonth}
        style={[styles.navButton, isAtMaxMonth && styles.disabledButton]}
        disabled={isAtMaxMonth}
      >
        <Text style={[styles.navText, isAtMaxMonth && styles.disabledText]}>
          Next
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  navButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#1c1c1c",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  navText: {
    fontSize: 16,
    color: "#f0f0f0",
    fontWeight: "500",
  },
  disabledButton: {
    backgroundColor: "#2a2a2a",
    borderColor: "#444",
  },
  disabledText: {
    color: "#777",
  },
});

export default MonthNavigation;
