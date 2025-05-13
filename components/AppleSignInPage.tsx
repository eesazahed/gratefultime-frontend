import React from "react";
import * as AppleAuthentication from "expo-apple-authentication";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { BackendServer } from "@/constants/BackendServer";
import { useEffect } from "react";

const AppleSignInPage = () => {
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        const response = await fetch(`${BackendServer}/`);
        if (!response.ok) {
          console.error(
            "Server connection failed with status:",
            response.status
          );
        } else {
          const result = await response.text();
          console.log("Server connection successful:", result);
        }
      } catch (error) {
        console.error("Server connection error:", error);
      }
    };

    checkServerConnection();
  }, []);

  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      });

      const response = await fetch(`${BackendServer}/auth/applelogin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identityToken: credential.identityToken,
          authorizationCode: credential.authorizationCode,
          user: credential.user,
          email: credential.email?.trim().toLowerCase(),
          fullName: credential.fullName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Apple sign-in failed:", data);
        return;
      }

      await login(data.token);
      router.push("/");
    } catch (e) {
      console.error("Apple sign-in error:", e);
    }
  };

  return (
    <View style={styles.container}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={
          AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE
        }
        cornerRadius={5}
        style={styles.button}
        onPress={handleAppleSignIn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: 200,
    height: 44,
  },
});

export default AppleSignInPage;
