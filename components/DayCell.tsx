import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type DayCellProps = {
  day: number;
  formattedDate: string;
  hasEntry: boolean;
  isFuture: boolean;
  isToday: boolean;
  onPress: () => void;
};

const DayCell = ({
  day,
  hasEntry,
  isFuture,
  isToday,
  onPress,
}: DayCellProps) => {
  const getDayStyle = () => {
    if (hasEntry) {
      return styles.hasEntry;
    } else if (isToday) {
      return styles.todayStyle;
    } else {
      return styles.disabledDay;
    }
  };

  const getTextStyle = () => {
    if (hasEntry || isToday) {
      return styles.dayText;
    } else {
      return styles.disabledDayText;
    }
  };

  return (
    <TouchableOpacity
      style={styles.dayCell}
      disabled={isFuture}
      activeOpacity={!isFuture ? 0.6 : 1}
      onPress={onPress}
    >
      <View style={[styles.day, getDayStyle()]}>
        <Text style={getTextStyle()}>{day}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dayCell: {
    flexBasis: "14%",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  day: {
    width: "100%",
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    margin: 4,
  },
  dayText: {
    fontSize: 16,
    color: "#fff",
  },
  hasEntry: {
    backgroundColor: "#2ecc71",
  },
  todayStyle: {
    backgroundColor: "#f1c40f",
  },
  disabledDay: {
    backgroundColor: "#222",
  },
  disabledDayText: {
    fontSize: 16,
    color: "#666",
  },
});

export default DayCell;
