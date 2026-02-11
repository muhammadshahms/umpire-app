import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Surface, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMatchHistory } from '../hooks/useMatchHistory';

export default function HistoryScreen() {
    const router = useRouter();
    const theme = useTheme();
    const { history, loading, loadHistory, clearHistory } = useMatchHistory();

    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [loadHistory])
    );

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <FlatList
                data={history}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyEmoji}>🏏</Text>
                        <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 12 }}>
                            No matches played yet
                        </Text>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                            Start a new match to see history here
                        </Text>
                        <Button
                            mode="contained"
                            onPress={() => router.push('/create-match')}
                            style={{ marginTop: 20, borderRadius: 12 }}
                            icon="cricket"
                        >
                            Start New Match
                        </Button>
                    </View>
                }
                renderItem={({ item }) => (
                    <Card style={styles.card} mode="elevated">
                        <Card.Content>
                            <View style={styles.cardHeader}>
                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                    {formatDate(item.date)}
                                </Text>
                                <Chip
                                    compact
                                    style={{
                                        backgroundColor: item.winnerName ? '#E8F5E9' : '#FFF3E0',
                                    }}
                                    textStyle={{
                                        color: item.winnerName ? '#2E7D32' : '#E65100',
                                        fontSize: 11,
                                    }}
                                >
                                    {item.overs} Overs
                                </Chip>
                            </View>

                            <View style={styles.teamsRow}>
                                <View style={styles.teamBlock}>
                                    <Text variant="titleMedium" style={styles.teamNameText}>
                                        {item.teamAName}
                                    </Text>
                                    <Text variant="headlineSmall" style={[styles.teamScore, { color: theme.colors.primary }]}>
                                        {item.firstInningsScore}
                                    </Text>
                                </View>
                                <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>vs</Text>
                                <View style={styles.teamBlock}>
                                    <Text variant="titleMedium" style={styles.teamNameText}>
                                        {item.teamBName}
                                    </Text>
                                    <Text variant="headlineSmall" style={[styles.teamScore, { color: theme.colors.primary }]}>
                                        {item.secondInningsScore}
                                    </Text>
                                </View>
                            </View>

                            <Surface style={styles.resultBanner} elevation={0}>
                                <Text variant="bodyMedium" style={styles.resultText}>
                                    {item.winnerName ? '🏆' : '🤝'} {item.result}
                                </Text>
                            </Surface>
                        </Card.Content>
                    </Card>
                )}
                ListFooterComponent={
                    history.length > 0 ? (
                        <Button
                            mode="text"
                            onPress={clearHistory}
                            textColor={theme.colors.error}
                            style={{ marginTop: 12 }}
                            icon="delete"
                        >
                            Clear History
                        </Button>
                    ) : null
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 80,
    },
    emptyEmoji: {
        fontSize: 60,
    },
    card: {
        marginBottom: 14,
        borderRadius: 16,
        backgroundColor: '#fff',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    teamsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: 12,
    },
    teamBlock: {
        alignItems: 'center',
        flex: 1,
    },
    teamNameText: {
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    teamScore: {
        fontWeight: 'bold',
    },
    resultBanner: {
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
    },
    resultText: {
        fontWeight: '600',
        color: '#333',
    },
});
