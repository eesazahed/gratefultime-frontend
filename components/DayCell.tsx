import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type DayCellProps = {
  day: number;
  formattedDate: string;
  hasEntry: boolean;
  isFuture: boolean;
  isToday: boolean;
  onPress: () => void;
  isIpad: boolean;
};

const DayCell = ({
  day,
  hasEntry,
  isFuture,
  isToday,
  onPress,
  isIpad,
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
      style={[styles.dayCell, { padding: isIpad ? 6 : 3 }]}
      disabled={isFuture}
      activeOpacity={!isFuture ? 0.6 : 1}
      onPress={onPress}
    >
      <View style={[styles.day, getDayStyle()]}>
        <Text style={[getTextStyle(), { fontSize: isIpad ? 20 : 18 }]}>
          {day}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dayCell: {
    width: "14.2857%",
    alignItems: "center",
    justifyContent: "center",
  },
  day: {
    width: "100%",
    height: "100%",
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: { color: "#fff" },
  hasEntry: {
    backgroundColor: "#32a852",
  },
  todayStyle: {
    backgroundColor: "#f1c40f",
  },
  disabledDay: {
    backgroundColor: "#222",
  },
  disabledDayText: {
    color: "#666",
  },
});

export default DayCell;
