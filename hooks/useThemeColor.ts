/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from "@/constants/Colors";

const useThemeColor = (
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.dark
) => {
  const theme = "dark";
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
};

export default useThemeColor;
