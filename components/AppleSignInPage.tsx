import React, { useState } from "react";
import * as AppleAuthentication from "expo-apple-authentication";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { BackendServer } from "@/constants/BackendServer";
import { ThemedText } from "./ThemedText";

const AppleSignInPage = () => {
  const router = useRouter();
  const { login } = useAuth();

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);

  const handleAppleSignIn = async () => {
    setErrorMessage("");
    setLoginSuccess(false);

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      });

      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

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
          user_timezone: userTimezone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data?.message || "Apple sign-in failed");
        return;
      }

      setLoginSuccess(true);
      setErrorMessage("Logging in...");

      await login(data.token);
      router.push("/");
    } catch (error) {
      console.error("Apple sign-in error:", error);
      setErrorMessage("Please try signing in in again");
    }
  };

  return (
    <View style={styles.container}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
        buttonStyle={
          AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE
        }
        cornerRadius={5}
        style={styles.button}
        onPress={handleAppleSignIn}
      />
      {errorMessage !== "" && (
        <ThemedText
          style={[
            styles.errorText,
            { color: loginSuccess ? "#32a852" : "red" },
          ]}
        >
          {errorMessage}
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 150,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  button: {
    width: 200,
    height: 44,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
  },
});

export default AppleSignInPage;
