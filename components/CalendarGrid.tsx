import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import MonthNavigation from "./MonthNavigation";
import WeekHeader from "./WeekHeader";
import DayGrid from "./DayGrid";
import EntryDetailsModal from "./EntryDetailsModal"; // Importing the modal component

type CalendarGridProps = {
  userId: number;
};

const CalendarGrid = ({ userId }: CalendarGridProps) => {
  const [entries, setEntries] = useState<{ [key: string]: boolean }>({});
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [entryDetails, setEntryDetails] = useState<any>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const minDate = new Date(2025, 1, 1);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const isAtMinMonth = currentMonth <= minDate;
  const isAtMaxMonth =
    currentMonth.getFullYear() === maxMonth.getFullYear() &&
    currentMonth.getMonth() === maxMonth.getMonth();

  useEffect(() => {
    const fetchEntries = async (userId: number) => {
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/entries/days?user_id=${userId}`
        );
        const data = await response.json();

        const entryMap: { [key: string]: boolean } = {};
        data.data.forEach((date: string) => {
          entryMap[date] = true;
        });

        setEntries(entryMap);
      } catch (error) {
        console.error("Error fetching entries:", error);
      }
    };

    fetchEntries(userId);
  }, [userId, currentMonth]);

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );
  const lastDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  );
  const startDay = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const days: number[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handlePreviousMonth = () => {
    if (!isAtMinMonth) {
      const prevMonth = new Date(currentMonth);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      setCurrentMonth(prevMonth);
    }
  };

  const handleNextMonth = () => {
    if (!isAtMaxMonth) {
      const nextMonth = new Date(currentMonth);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setCurrentMonth(nextMonth);
    }
  };

  const handleDayPress = async (day: number) => {
    const formattedDate = formatDate(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    if (entries[formattedDate]) {
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/entries/day?user_id=${userId}&date=${formattedDate}`
        );
        const data = await response.json();
        setEntryDetails(data.data);
        setModalVisible(true);
      } catch (error) {
        console.error("Error fetching entry details:", error);
      }
    }
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${month + 1 < 10 ? `0${month + 1}` : month + 1}-${
      day < 10 ? `0${day}` : day
    }`;
  };

  return (
    <View style={styles.calendarContainer}>
      <Text style={styles.monthTitle}>
        {currentMonth.toLocaleString("default", { month: "long" })}{" "}
        {currentMonth.getFullYear()}
      </Text>
      <WeekHeader />
      <DayGrid
        days={days}
        startDay={startDay}
        entries={entries}
        today={today}
        currentMonth={currentMonth}
        handleDayPress={handleDayPress}
      />
      <MonthNavigation
        currentMonth={currentMonth}
        handlePreviousMonth={handlePreviousMonth}
        handleNextMonth={handleNextMonth}
        isAtMinMonth={isAtMinMonth}
        isAtMaxMonth={isAtMaxMonth}
      />

      <EntryDetailsModal
        visible={modalVisible}
        entryDetails={entryDetails}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    margin: 20,
  },
  monthTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
});

export default CalendarGrid;
