import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Surface, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
    const router = useRouter();
    const theme = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.primary }]}>
                    Cricket Umpire
                </Text>
                <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                    Digital Scoreboard & Match Manager
                </Text>

                <Surface style={[styles.logoSurface, { backgroundColor: theme.colors.primaryContainer }]} elevation={2}>
                    <Text style={styles.logoText}>🏏</Text>
                </Surface>

                <Button
                    mode="contained"
                    onPress={() => router.push('/create-match')}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                    icon="cricket"
                >
                    Start New Match
                </Button>

                <Button
                    mode="outlined"
                    onPress={() => router.push('/history' as any)}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.outlinedButtonLabel}
                    icon="history"
                >
                    Match History
                </Button>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        marginBottom: 40,
        textAlign: 'center',
    },
    logoSurface: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 50,
    },
    logoText: {
        fontSize: 60,
    },
    button: {
        width: '100%',
        marginBottom: 12,
        borderRadius: 12,
    },
    buttonContent: {
        paddingVertical: 8,
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    outlinedButtonLabel: {
        fontSize: 16,
    },
});
