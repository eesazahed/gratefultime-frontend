import React from "react";
import { StyleSheet, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Container } from "../../components/ui/Container";
import { ThemedText } from "../../components/ThemedText";
import AppleSignInPage from "../../components/AppleSignInPage";
import NotifPushToken from "../../components/NotifPushToken";

const Home = () => {
  const { token } = useAuth();

  return (
    <Container style={styles.container}>
      {token && (
        <View>
          <ThemedText style={styles.text}>You are signed in!</ThemedText>
          <NotifPushToken userAuthToken={token} />
        </View>
      )}

      {!token && (
        <View>
          <AppleSignInPage />
        </View>
      )}
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
