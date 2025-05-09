import React from "react";
import { StyleSheet } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Container } from "../../components/ui/Container";
import { ThemedText } from "../../components/ThemedText";

const Home = () => {
  const { token } = useAuth();

  return (
    <Container style={styles.container}>
      <ThemedText style={styles.text}>
        {token ? "You are signed in!" : "You are not signed in!"}
      </ThemedText>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "600",
  },
});

export default Home;
