import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Card, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MatchScorecard } from '../../components/MatchScorecard';
import { MatchStats } from '../../components/MatchStats';
import { MatchWagonWheel } from '../../components/MatchWagonWheel'; // New import
import { useMatchHistory } from '../../hooks/useMatchHistory';
import { Match } from '../../models/types';

export default function MatchDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const theme = useTheme();
    const { getMatchDetails } = useMatchHistory();
    const [match, setMatch] = useState<Match | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('summary');

    useEffect(() => {
        const load = async () => {
            if (id) {
                const data = await getMatchDetails(id);
                setMatch(data);
            }
            setLoading(false);
        };
        load();
    }, [id]);

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }

    if (!match) {
        return (
            <SafeAreaView style={styles.container}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={() => router.back()} />
                    <Appbar.Content title="Match Details" />
                </Appbar.Header>
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text variant="titleMedium">Match not found!</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title={`${match.teamA.name} vs ${match.teamB.name}`} subtitle={new Date(Number(match.id)).toLocaleDateString()} />
            </Appbar.Header>

            <View style={styles.tabContainer}>
                <SegmentedButtons
                    value={tab}
                    onValueChange={setTab}
                    buttons={[
                        { value: 'summary', label: 'Summary' },
                        { value: 'scorecard', label: 'Scorecard' },
                        { value: 'stats', label: 'Stats' },
                        { value: 'wagonwheel', label: 'Wagon Wheel' }, // New tab
                    ]}
                />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {tab === 'summary' && (
                    <View>
                        <Card style={styles.card} mode="elevated">
                            <Card.Content>
                                <Text variant="headlineSmall" style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 8 }}>
                                    {match.result}
                                </Text>
                                <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.secondary }}>
                                    {match.winnerId ? `Winner: ${match.winnerName}` : 'Match Tied/No Result'}
                                </Text>
                            </Card.Content>
                        </Card>

                        <View style={styles.summaryRow}>
                            <Card style={[styles.summaryCard, { borderColor: theme.colors.primary }]} mode="outlined">
                                <Card.Content style={{ alignItems: 'center' }}>
                                    <Text variant="titleMedium">{match.teamA.name}</Text>
                                    <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                                        {match.firstInnings?.battingTeamId === match.teamA.id
                                            ? `${match.firstInnings.totalRuns}/${match.firstInnings.totalWickets}`
                                            : match.secondInnings?.battingTeamId === match.teamA.id
                                                ? `${match.secondInnings.totalRuns}/${match.secondInnings.totalWickets}`
                                                : '-'
                                        }
                                    </Text>
                                    <Text variant="bodySmall">
                                        {match.firstInnings?.battingTeamId === match.teamA.id
                                            ? `(${match.firstInnings.oversBowled} ov)`
                                            : match.secondInnings?.battingTeamId === match.teamA.id
                                                ? `(${match.secondInnings.oversBowled || 0} ov)` // Fix undefined
                                                : ''
                                        }
                                    </Text>
                                </Card.Content>
                            </Card>

                            <Card style={[styles.summaryCard, { borderColor: theme.colors.secondary }]} mode="outlined">
                                <Card.Content style={{ alignItems: 'center' }}>
                                    <Text variant="titleMedium">{match.teamB.name}</Text>
                                    <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.secondary }}>
                                        {match.firstInnings?.battingTeamId === match.teamB.id
                                            ? `${match.firstInnings.totalRuns}/${match.firstInnings.totalWickets}`
                                            : match.secondInnings?.battingTeamId === match.teamB.id
                                                ? `${match.secondInnings.totalRuns}/${match.secondInnings.totalWickets}`
                                                : '-'
                                        }
                                    </Text>
                                    <Text variant="bodySmall">
                                        {match.firstInnings?.battingTeamId === match.teamB.id
                                            ? `(${match.firstInnings.oversBowled} ov)`
                                            : match.secondInnings?.battingTeamId === match.teamB.id
                                                ? `(${match.secondInnings.oversBowled || 0} ov)`
                                                : ''
                                        }
                                    </Text>
                                </Card.Content>
                            </Card>
                        </View>
                    </View>
                )}

                {tab === 'scorecard' && (
                    <View>
                        {match.firstInnings && (
                            <View>
                                <Text variant="titleMedium" style={styles.inningHeader}>1st Innings</Text>
                                <MatchScorecard
                                    innings={match.firstInnings}
                                    battingTeam={match.firstInnings.battingTeamId === match.teamA.id ? match.teamA : match.teamB}
                                    bowlingTeam={match.firstInnings.bowlingTeamId === match.teamA.id ? match.teamA : match.teamB}
                                />
                            </View>
                        )}
                        {match.secondInnings && (
                            <View>
                                <Text variant="titleMedium" style={styles.inningHeader}>2nd Innings</Text>
                                <MatchScorecard
                                    innings={match.secondInnings}
                                    battingTeam={match.secondInnings.battingTeamId === match.teamA.id ? match.teamA : match.teamB}
                                    bowlingTeam={match.secondInnings.bowlingTeamId === match.teamA.id ? match.teamA : match.teamB}
                                />
                            </View>
                        )}
                    </View>
                )}

                {tab === 'stats' && (
                    <MatchStats match={match} />
                )}

                {tab === 'wagonwheel' && (
                    <MatchWagonWheel match={match} />
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabContainer: {
        padding: 16,
    },
    content: {
        padding: 16,
        paddingTop: 0,
    },
    card: {
        marginBottom: 16,
        backgroundColor: 'white',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: 'white',
    },
    inningHeader: {
        marginBottom: 8,
        marginLeft: 4,
        fontWeight: 'bold',
        color: '#666',
    }
});
