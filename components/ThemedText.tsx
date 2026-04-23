import { Text, TextProps, StyleSheet } from 'react-native';
import { Colors, Typography } from '../constants/Colors';

interface ThemedTextProps extends TextProps {
  type?: 'headline' | 'headlineBold' | 'headlineMedium' | 'body' | 'bodyBold' | 'bodyMedium' | 'label' | 'labelBold';
  color?: string;
  size?: number;
  center?: boolean;
}

export function ThemedText({ 
  style, 
  type = 'body', 
  color = Colors.onSurface, 
  size, 
  center, 
  children, 
  ...rest 
}: ThemedTextProps) {
  const content = children;

  return (
    <Text 
      style={[
        { color, fontFamily: Typography[type] },
        size ? { fontSize: size } : null,
        center ? { textAlign: 'center' } : null,
        style
      ]} 
      {...rest}
    >
      {content}
    </Text>
  );
}
