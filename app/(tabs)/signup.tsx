import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

type Errors = {
  email: string;
  username: string;
  password: string;
  submission: string;
};

const Signup = () => {
  const router = useRouter();
  const { login } = useAuth(); // grab login from AuthContext
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

      await login(data.token); // set token via context
      router.push("/profile");
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
    <View style={styles.container}>
      <Text style={styles.header}>Sign Up</Text>

      <TextInput
        style={[styles.input, errors.email && styles.errorInput]}
        placeholder="Email"
        autoCapitalize="none"
        onChangeText={setEmail}
        value={email}
      />
      {errors.email ? (
        <Text style={styles.errorText}>{errors.email}</Text>
      ) : null}

      <TextInput
        style={[styles.input, errors.username && styles.errorInput]}
        placeholder="Username"
        autoCapitalize="none"
        onChangeText={setUsername}
        value={username}
      />
      {errors.username ? (
        <Text style={styles.errorText}>{errors.username}</Text>
      ) : null}

      <TextInput
        style={[styles.input, errors.password && styles.errorInput]}
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />
      {errors.password ? (
        <Text style={styles.errorText}>{errors.password}</Text>
      ) : null}

      {errors.submission ? (
        <Text style={styles.errorText}>{errors.submission}</Text>
      ) : null}

      <TouchableOpacity
        style={styles.button}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 32,
    color: "#2C3E50",
    textAlign: "center",
  },
  input: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    fontSize: 16,
    borderColor: "#DDD",
    borderWidth: 1,
  },
  errorInput: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    fontSize: 14,
  },
  button: {
    backgroundColor: "#2980B9",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
