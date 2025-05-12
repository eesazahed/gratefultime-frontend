import React, { useCallback, useState } from "react";
import { StyleSheet } from "react-native";
import CalendarGrid from "../../components/CalendarGrid";
import { useAuth } from "../../context/AuthContext";
import { useFocusEffect } from "expo-router";
import { Container } from "../../components/ui/Container";

const Calendar = () => {
  const { token } = useAuth();
  const [entries, setEntries] = useState<{ [localTime: string]: string }>({});
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  useFocusEffect(
    useCallback(() => {
      const fetchEntries = async () => {
        try {
          if (!token) {
            console.error("JWT token not found");
            return;
          }

          const response = await fetch(`http://127.0.0.1:5000/entries/days`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();

          if (!response.ok) {
            console.error("Error fetching entries:", data);
            return;
          }

          const entryMap: { [localTime: string]: string } = {};

          data.data.forEach((utcTimestamp: string) => {
            const localTime = new Date(utcTimestamp).toLocaleDateString(
              "en-CA"
            );
            entryMap[localTime] = utcTimestamp;
          });

          setEntries(entryMap);
        } catch (error) {
          console.error("Error fetching entries:", error);
        }
      };

      fetchEntries();
    }, [token])
  );

  return (
    <Container style={styles.container}>
      <CalendarGrid
        entries={entries}
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Calendar;
