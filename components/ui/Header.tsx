import { StyleProp, View, ViewStyle } from "react-native";
import ThemedText from "../ThemedText";

interface HeaderProps {
  title: string;
  style?: StyleProp<ViewStyle>;
  fontSize?: number;
}

const Header = ({ title, style, fontSize = 34 }: HeaderProps) => {
  return (
    <View
      style={[
        {
          marginHorizontal: "auto",
          marginTop: 140,
          marginBottom: 20,
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
};

export default Header;
