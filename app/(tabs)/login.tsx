import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Container } from "../../components/ui/Container";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ThemedText } from "../../components/ThemedText";
import { Header } from "../../components/ui/Header";

type Errors = {
  email: string;
  password: string;
  submission: string;
};

const Login = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({
    email: "",
    password: "",
    submission: "",
  });

  const handleLogin = async () => {
    setErrors({ email: "", password: "", submission: "" });
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const newErrors: Errors = {
          email: "",
          password: "",
          submission: "",
        };

        if (data.errorCode === "email") {
          newErrors.email = data.message;
        } else if (data.errorCode === "password") {
          newErrors.password = data.message;
        } else {
          newErrors.submission = data.message || "Authentication failed.";
        }

        setErrors(newErrors);
        return;
      }

      await login(data.token);
      router.push("/");
    } catch (err) {
      console.error("Login error:", err);
      setErrors((prev) => ({
        ...prev,
        submission: "Could not connect to server.",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container style={styles.container}>
      <Header title="Log In" />

      <Input
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        value={email}
        error={errors.email}
      />

      <Input
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
        error={errors.password}
      />

      {errors.submission ? (
        <ThemedText style={styles.errorText}>{errors.submission}</ThemedText>
      ) : null}

      <Button
        title="Log In"
        onPress={handleLogin}
        loading={loading}
        style={styles.button}
      />
    </Container>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
  },
  errorText: {
    color: "red",
    marginLeft: 8,
    marginBottom: 12,
    fontSize: 10,
  },
  button: {
    marginTop: 20,
  },
});

