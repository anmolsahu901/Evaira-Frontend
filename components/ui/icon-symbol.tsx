import { SymbolView } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: string;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <SymbolView
      name={name as any}
      size={size}
      tintColor={color}
      style={style}
      resizeMode="scaleAspectFit"
    />
  );
}