import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../../context/AuthContext";

const LandingPage = () => {
  const { token } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {token ? "You are signed in!" : "You are not signed in!"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  text: {
    fontSize: 24,
    fontWeight: "600",
    color: "#2C3E50",
  },
});

export default LandingPage;
