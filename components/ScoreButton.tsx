import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Button } from 'react-native-paper';

interface ScoreButtonProps {
    label: string;
    onPress: () => void;
    color?: string;
    style?: ViewStyle;
}

export const ScoreButton: React.FC<ScoreButtonProps> = ({ label, onPress, color = '#2196F3', style }) => {
    return (
        <Button
            mode="contained"
            onPress={onPress}
            buttonColor={color}
            textColor="#fff"
            style={[styles.button, style]}
            contentStyle={styles.content}
            labelStyle={styles.label}
            compact
        >
            {label}
        </Button>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 50,
        margin: 4,
        minWidth: 58,
    },
    content: {
        width: 58,
        height: 58,
        justifyContent: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginHorizontal: 0,
        marginVertical: 0,
    },
});
