import {
  StyleProp,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { ThemedText } from "../ThemedText";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export function Input({
  label,
  error,
  containerStyle,
  style,
  ...props
}: InputProps) {
  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      {label && (
        <ThemedText
          style={{
            marginBottom: 8,
            fontSize: 16,
            fontWeight: "500",
          }}
        >
          {label}
        </ThemedText>
      )}
      <TextInput
        style={[
          {
            backgroundColor: "#2c2c2c",
            borderWidth: 1,
            borderColor: "#333",
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            color: "#fff",
          },
          style,
        ]}
        placeholderTextColor="#aaaaaa"
        {...props}
      />
      {error ? (
        <ThemedText
          style={{
            color: "red",
            fontSize: 14,
            marginTop: 4,
          }}
        >
          {error}
        </ThemedText>
      ) : (
        <></>
      )}
    </View>
  );
}
