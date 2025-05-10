import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Container } from "../../components/ui/Container";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ThemedText } from "../../components/ThemedText";
import { Header } from "../../components/ui/Header";

type Errors = {
  email: string;
  username: string;
  password: string;
  submission: string;
};

const Signup = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({
    email: "",
    username: "",
    password: "",
    submission: "",
  });

  const handleSignup = async () => {
    setErrors({ email: "", username: "", password: "", submission: "" });
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const newErrors: Errors = {
          email: "",
          username: "",
          password: "",
          submission: "",
        };

        if (data.errorCode === "email") {
          newErrors.email = data.message;
        } else if (data.errorCode === "username") {
          newErrors.username = data.message;
        } else if (data.errorCode === "password") {
          newErrors.password = data.message;
        } else {
          newErrors.submission = data.message || "Signup failed.";
        }

        setErrors(newErrors);
        return;
      }

      await login(data.token);
      router.push("/");
    } catch (err) {
      console.error("Signup error:", err);
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
      <Header title="Sign Up" />

      <Input
        placeholder="Email"
        autoCapitalize="none"
        onChangeText={setEmail}
        value={email}
        error={errors.email}
      />

      <Input
        placeholder="Username"
        autoCapitalize="none"
        onChangeText={setUsername}
        value={username}
        error={errors.username}
      />

      <Input
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
        error={errors.password}
      />

      {errors.submission && (
        <ThemedText style={styles.errorText}>{errors.submission}</ThemedText>
      )}

      <Button
        title="Sign Up"
        onPress={handleSignup}
        loading={loading}
        style={styles.button}
      />
    </Container>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    fontSize: 12,
    marginLeft: 8,
  },
  button: {
    marginTop: 20,
  },
});
