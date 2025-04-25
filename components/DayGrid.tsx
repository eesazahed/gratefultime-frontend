import React from "react";
import { View, StyleSheet } from "react-native";
import DayCell from "./DayCell";

type DayGridProps = {
  days: number[];
  startDay: number;
  entries: { [key: string]: boolean };
  today: Date;
  currentMonth: Date;
  handleDayPress: (day: number) => void;
};

const DayGrid = ({
  days,
  startDay,
  entries,
  today,
  currentMonth,
  handleDayPress,
}: DayGridProps) => {
  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${month + 1 < 10 ? `0${month + 1}` : month + 1}-${
      day < 10 ? `0${day}` : day
    }`;
  };

  return (
    <View style={styles.fixedHeightGrid}>
      <View style={styles.daysGrid}>
        {Array.from({ length: startDay }).map((_, index) => (
          <View key={index} style={styles.dayCell} />
        ))}

        {days.map((day) => {
          const dateObj = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
          );
          const isFuture = dateObj > today;
          const formattedDate = formatDate(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
          );
          const hasEntry = entries[formattedDate];

          return (
            <DayCell
              key={day}
              day={day}
              formattedDate={formattedDate}
              hasEntry={hasEntry}
              isFuture={isFuture}
              onPress={() => handleDayPress(day)}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fixedHeightGrid: {
    height: 5 * 60,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
  },
  dayCell: {
    width: "14%",
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default DayGrid;
