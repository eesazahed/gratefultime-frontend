import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type MonthNavigationProps = {
  currentMonth: Date;
  handlePreviousMonth: () => void;
  handleNextMonth: () => void;
  isAtMinMonth: boolean;
  isAtMaxMonth: boolean;
};

const MonthNavigation = ({
  currentMonth,
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
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  navText: {
    fontSize: 16,
    color: "#333",
  },
  disabledButton: {
    backgroundColor: "#f0f0f0",
    borderColor: "#ddd",
  },
  disabledText: {
    color: "#aaa",
  },
});

export default MonthNavigation;
