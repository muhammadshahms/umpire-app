import React from 'react';
import { GestureResponderEvent, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import { WagonWheelData } from '../models/types';

interface WagonWheelProps {
    shots?: WagonWheelData[]; // Array of shots to display (readonly mode)
    onSelect?: (data: WagonWheelData) => void; // Callback for input mode
    size?: number;
    style?: ViewStyle;
    readonly?: boolean;
}

export const WagonWheel: React.FC<WagonWheelProps> = ({
    shots = [],
    onSelect,
    size = 300,
    style,
    readonly = false
}) => {
    const radius = size / 2;
    const center = radius;

    const handlePress = (event: GestureResponderEvent) => {
        if (readonly || !onSelect) return;

        const { locationX, locationY } = event.nativeEvent;

        // Calculate relative to center
        const dx = locationX - center;
        const dy = locationY - center;

        // Distance from center (0 to 1)
        const distance = Math.sqrt(dx * dx + dy * dy);
        const length = Math.min(distance / radius, 1);

        // Angle in degrees
        // atan2 returns angle from x-axis (3 o'clock). 
        // We want 0 to be 12 o'clock (North).
        // Math.atan2(y, x) -> 0 at 3 o'clock, PI/2 at 6, PI at 9, -PI/2 at 12
        // To make 12 o'clock = 0:
        // angle = degrees(atan2(dy, dx)) + 90

        let angle = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;
        if (angle < 0) angle += 360;

        onSelect({ angle, length });
    };

    const getCoordinate = (data: WagonWheelData) => {
        // Convert back from Angle (0 = 12 o'clock) & Length to X, Y
        // Math angle = (Angle - 90)

        const mathAngleRad = (data.angle - 90) * Math.PI / 180;
        const r = data.length * radius;

        const x = center + r * Math.cos(mathAngleRad);
        const y = center + r * Math.sin(mathAngleRad);

        return { x, y };
    };

    return (
        <View style={[styles.container, { width: size, height: size }, style]}>
            {/* SVG Layer - Pointer events none so it doesn't intercept clicks if we have overlay, 
                but actually with overlay on top, overlay handles it.
            */}
            <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`} pointerEvents="none">
                {/* Field Background */}
                <Circle cx={center} cy={center} r={radius} fill="#4CAF50" />

                {/* Boundary Rope */}
                <Circle cx={center} cy={center} r={radius - 5} stroke="white" strokeWidth="2" fill="none" />

                {/* Inner Circle (30 yards approx - visually just inner ring) */}
                <Circle cx={center} cy={center} r={radius * 0.4} stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="none" strokeDasharray="5,5" />

                {/* Pitch Area - Center Rectangle */}
                <Rect
                    x={center - (size * 0.04)}
                    y={center - (size * 0.1)}
                    width={size * 0.08}
                    height={size * 0.2}
                    fill="#e0e0e0"
                />

                {/* Stumps - Just for orientation */}
                {/* Bowler End (Top) */}
                <Rect x={center - 3} y={center - (size * 0.1) + 2} width={6} height={2} fill="#333" />
                {/* Batting End (Bottom) */}
                <Rect x={center - 3} y={center + (size * 0.1) - 4} width={6} height={2} fill="#333" />


                {/* Shots */}
                {shots.map((shot, index) => {
                    const pos = getCoordinate(shot);

                    // Determine color based on runs
                    let shotColor = "rgba(255, 255, 255, 0.7)"; // Default for 1, 2, 3 runs (Off-white/Grayish)
                    if (shot.runs === 4) shotColor = "#4CAF50"; // Green for 4s
                    if (shot.runs === 6) shotColor = "#9C27B0"; // Purple for 6s
                    if (shot.runs === 1 || shot.runs === 2 || shot.runs === 3) shotColor = "#FFEB3B"; // Bright yellow for scoring runs

                    return (
                        <React.Fragment key={index}>
                            {/* Line from center to point */}
                            <Line
                                x1={center}
                                y1={center}
                                x2={pos.x}
                                y2={pos.y}
                                stroke={shotColor}
                                strokeWidth={shot.runs === 4 || shot.runs === 6 ? 2 : 1.2}
                                opacity={1}
                            />
                            <Circle
                                cx={pos.x}
                                cy={pos.y}
                                r={shot.runs === 4 || shot.runs === 6 ? 4 : 3}
                                fill={shot.runs === 4 || shot.runs === 6 ? shotColor : "red"}
                                stroke="white"
                                strokeWidth={0.5}
                            />
                        </React.Fragment>
                    );
                })}
            </Svg>

            {/* Transparent Touch Overlay */}
            {!readonly && (
                <Pressable
                    onPress={handlePress}
                    style={StyleSheet.absoluteFill}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
});
