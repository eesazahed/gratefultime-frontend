import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type DayCellProps = {
  day: number;
  formattedDate: string;
  hasEntry: boolean;
  isFuture: boolean;
  onPress: () => void;
};

const DayCell = ({
  day,
  formattedDate,
  hasEntry,
  isFuture,
  onPress,
}: DayCellProps) => {
  return (
    <TouchableOpacity
      style={styles.dayCell}
      disabled={!hasEntry || isFuture}
      activeOpacity={hasEntry && !isFuture ? 0.2 : 1}
      onPress={onPress}
    >
      <View
        style={[
          styles.day,
          hasEntry && styles.hasEntry,
          !hasEntry && styles.disabledDay,
          isFuture && styles.disabledDay,
        ]}
      >
        <Text
          style={[
            styles.dayText,
            (isFuture || !hasEntry) && styles.disabledDayText,
          ]}
        >
          {day}
        </Text>
        {hasEntry && !isFuture && <Text style={styles.checkmark}>✔</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dayCell: {
    width: "14%",
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  day: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontSize: 16,
  },
  hasEntry: {
    backgroundColor: "#34c759",
  },
  checkmark: {
    fontSize: 20,
    color: "white",
    position: "absolute",
    bottom: 2,
  },
  disabledDay: {
    backgroundColor: "#eee",
  },
  disabledDayText: {
    color: "#aaa",
  },
});

export default DayCell;
