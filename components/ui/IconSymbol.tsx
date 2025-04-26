// @ts-nocheck
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export function IconSymbol({ name, color }: { name: string; color: string }) {
  return <MaterialIcons color={color} size={28} name={name} />;
}
