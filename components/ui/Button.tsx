import React from "react";
import {
  ActivityIndicator,
  StyleProp,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { ThemedText } from "../ThemedText";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface ButtonProps {
  onPress: () => void;
  title?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  noLoading?: boolean;
  icon?: "remove" | "add";
}

export function Button({
  onPress,
  title,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
  noLoading = false,
  icon,
}: ButtonProps) {
  const { colors } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return colors.border;
    if (variant === "primary") return colors.primary;
    if (variant === "secondary") return colors.card;
    return "transparent";
  };

  const getTextColor = () => {
    if (disabled) return colors.text + "80";
    if (variant === "primary") return "#FFFFFF";
    return colors.text;
  };

  const getPadding = () => {
    if (size === "small") return { vertical: 8, horizontal: 16 };
    if (size === "large") return { vertical: 16, horizontal: 24 };
    return { vertical: 12, horizontal: 20 };
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.5}
      style={[
        {
          backgroundColor: getBackgroundColor(),
          borderWidth: variant === "outline" ? 1 : 0,
          borderColor: colors.border,
          borderRadius: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: getPadding().vertical,
          opacity: disabled || loading ? 0.5 : 1,
        },
        style,
      ]}
    >
      {!noLoading && loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : icon ? (
        <MaterialIcons name={icon} color={getTextColor()} size={24} />
      ) : (
        <ThemedText
          style={{
            color: getTextColor(),
            fontSize: 16,
            fontWeight: "500",
          }}
        >
          {title}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
}
