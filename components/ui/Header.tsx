import { StyleProp, View, ViewStyle } from "react-native";
import { ThemedText } from "../ThemedText";

interface HeaderProps {
  title: string;
  style?: StyleProp<ViewStyle>;
  fontSize?: number;
}

export function Header({ title, style, fontSize = 34 }: HeaderProps) {
  return (
    <View
      style={[
        {
          marginHorizontal: "auto",
          marginTop: 160,
          marginBottom: 40,
        },
        style,
      ]}
    >
      <ThemedText
        style={{
          paddingVertical: 28,
          fontSize: fontSize,
          fontWeight: 600,
          flex: 1,
          color: "#fff",
        }}
      >
        {title}
      </ThemedText>
    </View>
  );
}
