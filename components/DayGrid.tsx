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
  const getFormattedDate = (day: number) => {
    return `${currentMonth.getFullYear()}-${
      currentMonth.getMonth() + 1 < 10
        ? `0${currentMonth.getMonth() + 1}`
        : currentMonth.getMonth() + 1
    }-${day < 10 ? `0${day}` : day}`;
  };

  const totalDays = days.length;
  const totalCells = totalDays + startDay;

  const generateDayCells = () => {
    const cells = [];

    for (let i = 0; i < startDay; i++) {
      cells.push(<View key={`empty-${i}`} style={styles.emptyDayCell} />);
    }

    days.forEach((day, i) => {
      const formattedDate = getFormattedDate(day);
      const hasEntry = entries[formattedDate];
      const isFuture = new Date(formattedDate) > today;

      cells.push(
        <DayCell
          key={day}
          day={day}
          formattedDate={formattedDate}
          hasEntry={hasEntry}
          isFuture={isFuture}
          onPress={() => handleDayPress(day)}
        />
      );
    });

    const remainingCells = totalCells % 7;
    if (remainingCells !== 0) {
      for (let i = remainingCells; i < 7; i++) {
        cells.push(<View key={`empty-end-${i}`} style={styles.emptyDayCell} />);
      }
    }

    const dayRows = [];
    for (let i = 0; i < cells.length; i += 7) {
      dayRows.push(
        <View key={`row-${i}`} style={styles.row}>
          {cells.slice(i, i + 7)}
        </View>
      );
    }

    return dayRows;
  };

  return <View style={styles.gridContainer}>{generateDayCells()}</View>;
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: "column",
    width: "100%",
    height: 350,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  emptyDayCell: {
    width: "14%",
    height: 40,
  },
});

export default DayGrid;
