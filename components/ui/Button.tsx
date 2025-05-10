import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  ViewStyle,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { ThemedText } from "../ThemedText";

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  onPress,
  title,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
  leftIcon,
  rightIcon,
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
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
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
          paddingHorizontal: getPadding().horizontal,
          opacity: disabled ? 0.7 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {leftIcon}
          <ThemedText
            style={{
              color: getTextColor(),
              fontSize: size === "small" ? 14 : 16,
              fontWeight: "600",
              marginHorizontal: leftIcon || rightIcon ? 8 : 0,
            }}
          >
            {title}
          </ThemedText>
          {rightIcon}
        </>
      )}
    </Pressable>
  );
}
