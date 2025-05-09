import { StyleProp, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { ThemedText } from '../ThemedText';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export function Input({
  label,
  error,
  containerStyle,
  style,
  ...props
}: InputProps) {
  const { colors } = useTheme();

  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      {label && (
        <ThemedText
          style={{
            marginBottom: 8,
            fontSize: 16,
            fontWeight: '500',
          }}
        >
          {label}
        </ThemedText>
      )}
      <TextInput
        style={[
          {
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: error ? colors.notification : colors.border,
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            color: colors.text,
          },
          style,
        ]}
        placeholderTextColor={colors.text + '80'}
        {...props}
      />
      {error && (
        <ThemedText
          style={{
            color: colors.notification,
            fontSize: 14,
            marginTop: 4,
          }}
        >
          {error}
        </ThemedText>
      )}
    </View>
  );
} 