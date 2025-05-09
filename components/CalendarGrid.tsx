import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import MonthNavigation from "./MonthNavigation";
import WeekHeader from "./WeekHeader";
import DayGrid from "./DayGrid";
import EntryDetailsModal from "./EntryDetailsModal";
import { useAuth } from "../context/AuthContext";

const CalendarGrid = ({
  entries,
  currentMonth,
  setCurrentMonth,
}: {
  entries: { [key: string]: boolean };
  currentMonth: Date;
  setCurrentMonth: React.Dispatch<React.SetStateAction<Date>>;
}) => {
  const { token } = useAuth();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [entryDetails, setEntryDetails] = useState<any>(null);

  const minDate = new Date(2025, 1, 1);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const isAtMinMonth = currentMonth <= minDate;
  const isAtMaxMonth =
    currentMonth.getFullYear() === maxMonth.getFullYear() &&
    currentMonth.getMonth() === maxMonth.getMonth();

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
      if (!token) {
        console.error("No JWT token found");
        return;
      }

      try {
        const response = await fetch(
          `http://127.0.0.1:5000/entries/day?date=${formattedDate}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();

        if (!response.ok) {
          console.error("Error fetching entry details:", data);
          return;
        }

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
    <View>
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
  monthTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: 600,
    textAlign: "center",
    marginTop: 40,
    marginBottom: 40
  },
});

export default CalendarGrid;
