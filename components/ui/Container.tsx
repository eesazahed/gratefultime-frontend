import { StyleProp, View, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';

interface ContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  backgroundColor?: string;
}

export function Container({
  children,
  style,
  padding = 16,
  backgroundColor,
}: ContainerProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        {
          padding,
          backgroundColor: backgroundColor ?? colors.background,
          flex: 1,
          width: "85%",
          marginHorizontal: "auto",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
} 