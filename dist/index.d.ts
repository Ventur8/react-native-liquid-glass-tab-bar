import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
export type FloatingTabBarProps = BottomTabBarProps & {
    isDark?: boolean;
    activeColor?: string;
    inactiveColor?: string;
    blurIntensity?: number;
};
export declare function FloatingTabBar({ state, descriptors, navigation, isDark, activeColor, inactiveColor, blurIntensity, }: FloatingTabBarProps): React.JSX.Element;
