import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import DayCell from "./DayCell";

const { width, height } = Dimensions.get("window");
const isIpad = width >= 700 && height >= 700;

type DayGridProps = {
  days: number[];
  startDay: number;
  entries: { [key: string]: { id: number; timestamp: string } };
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
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    return `${year}-${month}-${dayStr}`;
  };

  const totalDays = days.length;
  const totalCells = totalDays + startDay;

  const generateDayCells = () => {
    const cells = [];

    for (let i = 0; i < startDay; i++) {
      cells.push(<View key={`empty-${i}`} style={styles.emptyDayCell} />);
    }

    days.forEach((day) => {
      const formattedDate = getFormattedDate(day);
      const hasEntry = entries.hasOwnProperty(formattedDate);
      const isFuture = new Date(formattedDate) > today;

      const isToday =
        today.getFullYear() === currentMonth.getFullYear() &&
        today.getMonth() === currentMonth.getMonth() &&
        today.getDate() === day;

      cells.push(
        <DayCell
          key={day}
          day={day}
          formattedDate={formattedDate}
          hasEntry={hasEntry}
          isFuture={isFuture}
          isToday={isToday}
          onPress={() => handleDayPress(day)}
          isIpad={isIpad}
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
    minHeight: 300,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: isIpad ? 100 : 50,
    marginBottom: isIpad ? 5 : 0,
  },
  emptyDayCell: {
    width: "14%",
  },
});

export default DayGrid;
