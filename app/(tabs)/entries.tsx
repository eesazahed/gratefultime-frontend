import React from "react";
import { View, StyleSheet } from "react-native";
import CalendarGrid from "../../components/CalendarGrid";

const CalendarScreen = () => {
  const userId = 1;

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
