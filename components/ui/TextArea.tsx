import { StyleProp, ViewStyle } from "react-native";
import { Input, InputProps } from "./Input";

interface TextAreaProps extends Omit<InputProps, "multiline"> {
  minHeight?: number;
}

export function TextArea({ minHeight = 100, style, ...props }: TextAreaProps) {
  return (
    <Input
      multiline
      textAlignVertical="top"
      style={[
        {
          minHeight,
          paddingTop: 12,
        },
        style,
      ]}
      {...props}
    />
  );
}
