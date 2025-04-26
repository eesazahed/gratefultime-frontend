import React, { useCallback, useState } from "react";
import { View, StyleSheet } from "react-native";
import CalendarGrid from "../../components/CalendarGrid";
import { useAuth } from "../../context/AuthContext"; // adjust the path if needed
import { useFocusEffect } from "expo-router";

const Calendar = () => {
  const { token } = useAuth(); // get the token from context
  const [entries, setEntries] = useState<{ [key: string]: boolean }>({});
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  useFocusEffect(
    useCallback(() => {
      const fetchEntries = async () => {
        console.log("fetched");
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

          const entryMap: { [key: string]: boolean } = {};
          data.data.forEach((date: string) => {
            const localDate = new Date(date + "+00:00").toLocaleDateString(
              "en-CA"
            );
            entryMap[localDate] = true;
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
    <View style={styles.container}>
      <CalendarGrid
        entries={entries}
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

export default Calendar;
