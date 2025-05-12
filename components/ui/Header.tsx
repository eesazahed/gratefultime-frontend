import { StyleProp, View, ViewStyle } from "react-native";
import { ThemedText } from "../ThemedText";

interface HeaderProps {
  title: string;
  style?: StyleProp<ViewStyle>;
}

export function Header({ title, style }: HeaderProps) {
  return (
    <View
      style={[
        {
          marginHorizontal: "auto",
          marginTop: 48,
          marginBottom: 18,
        },
        style,
      ]}
    >
      <ThemedText
        style={{
          paddingVertical: 28,
          fontSize: 28,
          fontWeight: 600,
          flex: 1,
        }}
      >
        {title}
      </ThemedText>
    </View>
  );
}
