import React from "react";
import { View, Text, StyleSheet } from "react-native";

const WeekHeader = () => {
  return (
    <View style={styles.weekRow}>
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
        <Text key={index} style={styles.weekDay}>
          {day}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    padding: 5,
  },
  weekDay: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    width: "14%",
  },
});

export default WeekHeader;
