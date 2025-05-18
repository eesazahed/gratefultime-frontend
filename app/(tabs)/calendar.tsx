import React, { useCallback, useState } from "react";
import { StyleSheet } from "react-native";
import CalendarGrid from "../../components/CalendarGrid";
import { useAuth } from "../../context/AuthContext";
import { useFocusEffect } from "expo-router";
import { Container } from "../../components/ui/Container";
import { BackendServer } from "@/constants/BackendServer";

const Calendar = () => {
  const { token } = useAuth();
  const [entries, setEntries] = useState<{ [localTime: string]: string }>({});
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(true);

  useFocusEffect(
    useCallback(() => {
      const fetchEntries = async () => {
        setLoading(true);
        try {
          if (!token) {
            console.error("JWT token not found");
            setLoading(false);
            return;
          }

          const response = await fetch(`${BackendServer}/entries/days`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (response.status === 429) {
            console.warn("Rate limit exceeded");
            setLoading(false);
            return;
          }

          if (!response.ok) {
            console.error("Error fetching entries:", data);
            setLoading(false);
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
        } finally {
          setLoading(false);
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
        loading={loading}
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
