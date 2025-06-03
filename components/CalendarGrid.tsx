import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import MonthNavigation from "./MonthNavigation";
import WeekHeader from "./WeekHeader";
import DayGrid from "./DayGrid";
import EntryDetailsModal from "./EntryDetailsModal";
import { useAuth } from "../context/AuthContext";
import { BackendServer } from "@/constants/BackendServer";
import Header from "./ui/Header";
import { useRouter } from "expo-router";
import type { Entry } from "@/types";

type EntryMap = {
  [localDate: string]: {
    id: number;
    timestamp: string;
  };
};

const CalendarGrid = ({
  entries,
  currentMonth,
  setCurrentMonth,
  loading,
}: {
  entries: EntryMap;
  currentMonth: Date;
  setCurrentMonth: React.Dispatch<React.SetStateAction<Date>>;
  loading: boolean;
}) => {
  const { token } = useAuth();
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [entryDetails, setEntryDetails] = useState<Entry | undefined>(
    undefined
  );

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
    const pressedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    pressedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const localDate = formatDate(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    const entryMeta = entries[localDate];

    if (!entryMeta) {
      if (pressedDate.getTime() === today.getTime()) {
        router.push("/(tabs)/grateful");
      }
      return;
    }

    try {
      const response = await fetch(`${BackendServer}/entries/${entryMeta.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (response.status === 429) {
        console.error("Rate limit exceeded. Retaining previous state.");
        return;
      }

      if (!response.ok) {
        console.error("Error fetching entry details:", data);
        return;
      }

      setEntryDetails(data.data);
      setModalVisible(true);
    } catch (error) {
      console.error("Error fetching entry details:", error);
    }
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${month + 1 < 10 ? `0${month + 1}` : month + 1}-${
      day < 10 ? `0${day}` : day
    }`;
  };

  return (
    <View>
      <Header
        title={` ${currentMonth.toLocaleString("default", {
          month: "long",
        })} ${currentMonth.getFullYear()}`}
      />
      <WeekHeader />
      <View style={styles.calendarAndButtons}>
        {loading ? (
          <ActivityIndicator size="large" style={{ margin: "auto" }} />
        ) : (
          <DayGrid
            days={days}
            startDay={startDay}
            entries={entries}
            today={today}
            currentMonth={currentMonth}
            handleDayPress={handleDayPress}
          />
        )}

        <MonthNavigation
          handlePreviousMonth={handlePreviousMonth}
          handleNextMonth={handleNextMonth}
          isAtMinMonth={isAtMinMonth}
          isAtMaxMonth={isAtMaxMonth}
        />
      </View>
      <EntryDetailsModal
        visible={modalVisible}
        entryDetails={entryDetails}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  calendarAndButtons: {
    justifyContent: "space-between",
    height: 380,
  },
});

export default CalendarGrid;
