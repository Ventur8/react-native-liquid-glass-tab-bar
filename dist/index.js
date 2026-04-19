"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FloatingTabBar = FloatingTabBar;
const expo_blur_1 = require("expo-blur");
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_reanimated_1 = __importStar(require("react-native-reanimated"));
const react_native_safe_area_context_1 = require("react-native-safe-area-context");
// --- ANIMATION CONFIGURATION ---
const SPRING_CONFIG = {
    damping: 20,
    stiffness: 300,
    mass: 0.5
};
const TIMING_CONFIG = {
    duration: 150,
    easing: react_native_reanimated_1.Easing.out(react_native_reanimated_1.Easing.quad)
};
const TabItem = ({ isFocused, label, onPress, color, renderIcon }) => {
    const animatedStyle = (0, react_native_reanimated_1.useAnimatedStyle)(() => {
        return {
            transform: [{ scale: (0, react_native_reanimated_1.withTiming)(isFocused ? 1 : 0.92, TIMING_CONFIG) }],
            opacity: (0, react_native_reanimated_1.withTiming)(isFocused ? 1 : 0.6, TIMING_CONFIG),
        };
    });
    return (<react_native_1.TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.tabItem} accessibilityRole="button">
      <react_native_reanimated_1.default.View style={[styles.tabContent, animatedStyle]}>
        {renderIcon ? renderIcon({ focused: isFocused, color, size: 24 }) : null}
        <react_native_reanimated_1.default.Text entering={react_native_1.Platform.OS !== 'web' ? undefined : undefined} style={[styles.label, { color }]} numberOfLines={1}>
          {label}
        </react_native_reanimated_1.default.Text>
      </react_native_reanimated_1.default.View>
    </react_native_1.TouchableOpacity>);
};
// --- Main Component ---
function FloatingTabBar({ state, descriptors, navigation, isDark = false, activeColor = isDark ? '#FFFFFF' : '#000000', inactiveColor = isDark ? '#999999' : '#888888', blurIntensity = isDark ? 40 : 70, }) {
    const insets = (0, react_native_safe_area_context_1.useSafeAreaInsets)();
    const [layout, setLayout] = (0, react_1.useState)({ width: 0, height: 0 });
    const handleLayout = (e) => {
        setLayout(e.nativeEvent.layout);
    };
    // Filter out hidden routes for width calculation
    const visibleRoutes = state.routes.filter((route) => {
        const { options } = descriptors[route.key];
        // We assume a route is hidden if href is strictly null (Expo Router convention)
        // or if you want to implement other custom hiding logic.
        return options.href !== null;
    });
    const tabWidth = layout.width / visibleRoutes.length || 0;
    // Find the focused index among visible routes
    const focusedVisibleIndex = visibleRoutes.findIndex((r) => r.key === state.routes[state.index].key);
    const indicatorStyle = (0, react_native_reanimated_1.useAnimatedStyle)(() => {
        if (tabWidth === 0)
            return {};
        return {
            width: tabWidth - 10,
            transform: [
                { translateX: (0, react_native_reanimated_1.withSpring)(Math.max(0, focusedVisibleIndex) * tabWidth + 5, SPRING_CONFIG) }
            ],
        };
    });
    return (<react_native_1.View style={[styles.container, { paddingBottom: insets.bottom + 10 }]}>
      <react_native_1.View style={[
            styles.floatingPill,
            { borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }
        ]} onLayout={handleLayout}>

        {/* Glass Background */}
        <expo_blur_1.BlurView intensity={blurIntensity} tint={isDark ? 'systemThickMaterialDark' : 'systemMaterialLight'} style={react_native_1.StyleSheet.absoluteFill}/>

        {/* Fallback background */}
        <react_native_1.View style={[
            react_native_1.StyleSheet.absoluteFill,
            {
                backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)',
            }
        ]}/>

        {/* Active Indicator */}
        {layout.width > 0 && focusedVisibleIndex >= 0 && (<react_native_reanimated_1.default.View style={[
                styles.activeIndicator,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)' },
                indicatorStyle
            ]}/>)}

        {/* Tabs */}
        <react_native_1.View style={styles.tabsRow}>
          {visibleRoutes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = index === focusedVisibleIndex;
            const label = options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                    ? options.title
                    : route.name;
            const onPress = () => {
                const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name, route.params);
                }
            };
            return (<TabItem key={route.key} isFocused={isFocused} label={label} onPress={onPress} color={isFocused ? activeColor : inactiveColor} renderIcon={options.tabBarIcon}/>);
        })}
        </react_native_1.View>
      </react_native_1.View>
    </react_native_1.View>);
}
const styles = react_native_1.StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'flex-end',
        pointerEvents: 'box-none',
    },
    floatingPill: {
        flexDirection: 'row',
        width: '90%',
        maxWidth: 400,
        height: 60,
        borderRadius: 30,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        overflow: 'hidden',
        borderWidth: 1,
    },
    tabsRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    tabItem: {
        flex: 1,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabContent: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
    },
    label: {
        fontSize: 10,
        fontWeight: '600',
    },
    activeIndicator: {
        position: 'absolute',
        height: '84%',
        top: '8%',
        borderRadius: 24,
        zIndex: 0,
    }
});
