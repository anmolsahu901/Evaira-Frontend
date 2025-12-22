
import { ImageBackground, ImageBackgroundProps, View, type ViewProps } from 'react-native';

import { useThemeColor } from '../hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  backgroundImage?: ImageBackgroundProps['source'];
  imageStyle?: ImageBackgroundProps['imageStyle'];
};

export function ThemedView({ style, lightColor, darkColor, backgroundImage, imageStyle, children, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  if (backgroundImage) {
    return (
      <ImageBackground source={backgroundImage} style={[{ flex: 1 }, style]} imageStyle={imageStyle} {...otherProps}>
        {children}
      </ImageBackground>
    );
  }
  return <View style={[{ backgroundColor }, style]} {...otherProps}>{children}</View>;
}
