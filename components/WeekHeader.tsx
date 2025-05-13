import React from "react";
import { View, Text, StyleSheet } from "react-native";

const WeekHeader = () => {
  return (
    <View style={styles.weekRow}>
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
        <View key={index} style={styles.weekDayWrapper}>
          <Text style={styles.weekDay}>{day}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  weekRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    width: "100%",
    marginVertical: 10,
    justifyContent: "space-evenly",
  },
  weekDayWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  weekDay: {
    width: "100%",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    color: "#fff",
  },
});

export default WeekHeader;
