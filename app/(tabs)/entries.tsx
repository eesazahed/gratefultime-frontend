import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import CalendarGrid from "../../components/CalendarGrid";
import { useAuth } from "../../context/AuthContext"; // adjust the path if needed

const CalendarScreen = () => {
  const { token } = useAuth(); // get the token from context
  const [entries, setEntries] = useState<{ [key: string]: boolean }>({});
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  useEffect(() => {
    const fetchEntries = async () => {
      if (!token) {
        console.error("No JWT token found");
        return;
      }

      try {
        const response = await fetch(`http://127.0.0.1:5000/entries/days`, {
          headers: {
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
          entryMap[date] = true;
        });

        setEntries(entryMap);
      } catch (error) {
        console.error("Error fetching entries:", error);
      }
    };

    fetchEntries();
  }, [token, currentMonth]);

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

export default CalendarScreen;
