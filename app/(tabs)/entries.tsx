import React from "react";
import { View, StyleSheet } from "react-native";
import CalendarGrid from "../../components/CalendarGrid";

const CalendarScreen = () => {
  // Assuming you have a user_id
  const userId = 1; // Change to actual user ID from AsyncStorage or context

  return (
    <View style={styles.container}>
      <CalendarGrid userId={userId} />
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
