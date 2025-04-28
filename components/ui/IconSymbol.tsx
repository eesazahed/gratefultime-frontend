// @ts-nocheck
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export function IconSymbol({
  name,
  color,
  style,
  size,
}: {
  name: string;
  color: string;
  style?: any;
  size?: number;
}) {
  return (
    <MaterialIcons color={color} size={size || 28} name={name} style={style} />
  );
}
