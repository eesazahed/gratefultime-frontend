import React from "react";
import {
  ActivityIndicator,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { ThemedText } from "../ThemedText";

interface LargeLinkProps {
  onPress?: () => void;
  title?: string;
  data?: string;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function LargeLink({
  onPress,
  title,
  loading = false,
  data,
  style,
}: LargeLinkProps) {
  const daysThisMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.5}
      style={[
        {
          marginTop: 10,
          backgroundColor: "#2c2c2c",
          borderWidth: 2,
          borderColor: "#333",
          borderRadius: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 20,
          opacity: loading ? 0.5 : 1,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <ThemedText
          style={{
            fontSize: 24,
            fontWeight: "500",
            textAlign: "left",
          }}
        >
          {title}
        </ThemedText>

        {data && (
          <View style={{ marginHorizontal: 10 }}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText
                style={{
                  fontSize: 24,
                  fontWeight: "500",
                  textAlign: "center",
                }}
              >
                <Text style={{ color: "#3af07c" }}>
                  {" "}
                  {typeof data === "number" ? data : 0}
                </Text>{" "}
                / {daysThisMonth}
              </ThemedText>
            )}
          </View>
        )}
      </View>
      <ThemedText
        style={{
          lineHeight: 0,
          fontSize: 32,
          fontWeight: "700",
          textAlign: "right",
        }}
      >
        &rarr;
      </ThemedText>
    </TouchableOpacity>
  );
}
