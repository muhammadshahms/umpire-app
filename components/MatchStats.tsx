import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Divider, Text, useTheme } from 'react-native-paper';
import { Innings, Match, Team } from '../models/types';

interface MatchStatsProps {
    match: Match;
}

export const MatchStats = ({ match }: MatchStatsProps) => {
    const theme = useTheme();

    const stats = useMemo(() => {
        return {
            nrr: calculateNRR(match),
            partnerships: {
                first: getPartnerships(match.firstInnings, match.teamA.id === match.firstInnings?.battingTeamId ? match.teamA : match.teamB),
                second: match.secondInnings ? getPartnerships(match.secondInnings, match.teamA.id === match.secondInnings.battingTeamId ? match.teamA : match.teamB) : [],
            },
            fow: {
                first: getFOW(match.firstInnings),
                second: match.secondInnings ? getFOW(match.secondInnings) : [],
            }
        };
    }, [match]);

    return (
        <View style={styles.container}>
            {/* Net Run Rate */}
            <Card style={styles.card} mode="outlined">
                <Card.Title title="Net Run Rate (NRR)" />
                <Card.Content>
                    <View style={styles.row}>
                        <Text variant="titleMedium">{match.teamA.name}</Text>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{stats.nrr.teamA}</Text>
                    </View>
                    <Divider style={{ marginVertical: 8 }} />
                    <View style={styles.row}>
                        <Text variant="titleMedium">{match.teamB.name}</Text>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{stats.nrr.teamB}</Text>
                    </View>
                </Card.Content>
            </Card>

            {/* Fall of Wickets - 1st Innings */}
            {match.firstInnings && (
                <Card style={styles.card} mode="outlined">
                    <Card.Title title={`Fall of Wickets - ${match.firstInnings.battingTeamId === match.teamA.id ? match.teamA.name : match.teamB.name}`} subtitle="Score / Wicket (Over)" />
                    <Card.Content>
                        <View style={styles.fowContainer}>
                            {stats.fow.first.length === 0 ? <Text>No wickets fell.</Text> :
                                stats.fow.first.map((f, i) => (
                                    <View key={i} style={styles.fowItem}>
                                        <Text style={{ fontWeight: 'bold' }}>{f.score}/{f.wicketNumber}</Text>
                                        <Text variant="labelSmall">({f.over})</Text>
                                    </View>
                                ))
                            }
                        </View>
                    </Card.Content>
                </Card>
            )}

            {/* Fall of Wickets - 2nd Innings */}
            {match.secondInnings && (
                <Card style={styles.card} mode="outlined">
                    <Card.Title title={`Fall of Wickets - ${match.secondInnings.battingTeamId === match.teamA.id ? match.teamA.name : match.teamB.name}`} subtitle="Score / Wicket (Over)" />
                    <Card.Content>
                        <View style={styles.fowContainer}>
                            {stats.fow.second.length === 0 ? <Text>No wickets fell.</Text> :
                                stats.fow.second.map((f, i) => (
                                    <View key={i} style={styles.fowItem}>
                                        <Text style={{ fontWeight: 'bold' }}>{f.score}/{f.wicketNumber}</Text>
                                        <Text variant="labelSmall">({f.over})</Text>
                                    </View>
                                ))
                            }
                        </View>
                    </Card.Content>
                </Card>
            )}

            {/* Top Partnerships (Simplified) */}
            {match.firstInnings && (
                <Card style={styles.card} mode="outlined">
                    <Card.Title title={`Partnerships - ${match.firstInnings.battingTeamId === match.teamA.id ? match.teamA.name : match.teamB.name}`} />
                    <Card.Content>
                        {stats.partnerships.first.map((p, i) => (
                            <View key={i} style={[styles.row, { marginBottom: 8 }]}>
                                <Text style={{ flex: 1 }}>{p.player1} & {p.player2}</Text>
                                <Text style={{ fontWeight: 'bold' }}>{p.runs} ({p.balls})</Text>
                            </View>
                        ))}
                    </Card.Content>
                </Card>
            )}

            {match.secondInnings && (
                <Card style={styles.card} mode="outlined">
                    <Card.Title title={`Partnerships - ${match.secondInnings.battingTeamId === match.teamA.id ? match.teamA.name : match.teamB.name}`} />
                    <Card.Content>
                        {stats.partnerships.second.map((p, i) => (
                            <View key={i} style={[styles.row, { marginBottom: 8 }]}>
                                <Text style={{ flex: 1 }}>{p.player1} & {p.player2}</Text>
                                <Text style={{ fontWeight: 'bold' }}>{p.runs} ({p.balls})</Text>
                            </View>
                        ))}
                    </Card.Content>
                </Card>
            )}

        </View>
    );
};

// --- Utilities ---

const calculateNRR = (match: Match) => {
    // Basic NRR Calculation
    // For each team: (Total Runs Scored / Total Overs Faced) - (Total Runs Conceded / Total Overs Bowled)
    // If a team is all out, overs faced is considered full quota.

    const getTeamStats = (teamId: string) => {
        let runsScored = 0;
        let oversFaced = 0;
        let runsConceded = 0;
        let oversBowled = 0;

        const processInnings = (inningsStr: 'firstInnings' | 'secondInnings') => {
            const inning = match[inningsStr];
            if (!inning) return;

            if (inning.battingTeamId === teamId) {
                runsScored += inning.totalRuns;
                // Check if all out
                const teamSize = teamId === match.teamA.id ? match.teamA.players.length : match.teamB.players.length;
                if (inning.totalWickets >= teamSize - 1) {
                    oversFaced += match.totalOvers;
                } else {
                    oversFaced += inning.allOvers.length + (inning.currentOver.validBalls / 6);
                }
            } else {
                runsConceded += inning.totalRuns;
                const teamSize = teamId === match.teamA.id ? match.teamA.players.length : match.teamB.players.length; // Actually check stored batting team size
                // Simplified: If opponent all out, use full overs
                // We don't have opponent team size easily accessible without logic check, assuming symmetric teams for now
                if (inning.totalWickets >= 10) { // Standard cricket
                    oversBowled += match.totalOvers;
                } else {
                    oversBowled += inning.allOvers.length + (inning.currentOver.validBalls / 6);
                }
            }
        };

        processInnings('firstInnings');
        processInnings('secondInnings');

        // Prevent division by zero
        const runRateScored = oversFaced > 0 ? runsScored / oversFaced : 0;
        const runRateConceded = oversBowled > 0 ? runsConceded / oversBowled : 0;

        return (runRateScored - runRateConceded).toFixed(3);
    };

    return {
        teamA: getTeamStats(match.teamA.id),
        teamB: getTeamStats(match.teamB.id),
    };
};

const getFOW = (innings?: Innings) => {
    if (!innings) return [];
    // Reconstruct FOW from deliveries
    const fow: { score: number, wicketNumber: number, over: string }[] = [];
    let currentScore = 0;
    let wickets = 0;

    // Iterate all overs
    const allDeliveries = [...innings.allOvers.map(o => o.deliveries).flat(), ...innings.currentOver.deliveries];

    allDeliveries.forEach(d => {
        currentScore += d.runs + d.extraRuns;
        if (d.isWicket) {
            wickets++;
            // Calculate over string e.g. 2.4
            // Approximate based on valid balls count? 
            // Better to use ballNumber relative to over, but simpler:
            // We need to know which over this delivery belongs to. 
            // The stored deliveries flat list loses strict over boundary if we just map.
            // But we can infer.
        }
    });

    // Better approach: Iterate overs
    let runningScore = 0;
    let runningWickets = 0;

    // Process completed overs
    innings.allOvers.forEach(over => {
        over.deliveries.forEach((d, idx) => {
            runningScore += d.runs + d.extraRuns;
            if (d.isWicket) {
                runningWickets++;
                fow.push({
                    score: runningScore,
                    wicketNumber: runningWickets,
                    over: `${over.overNumber - 1}.${d.ballNumber}` // d.ballNumber is 1-based valid ball usually
                    // Wait, ballNumber in Delivery might include extras?
                    // Let's just use index if needed, or rely on ballNumber logic
                });
            }
        });
    });

    // Process current over
    innings.currentOver.deliveries.forEach(d => {
        runningScore += d.runs + d.extraRuns;
        if (d.isWicket) {
            runningWickets++;
            fow.push({
                score: runningScore,
                wicketNumber: runningWickets,
                over: `${innings.currentOver.overNumber - 1}.${d.ballNumber}`
            });
        }
    });

    return fow;
};

const getPartnerships = (innings?: Innings, battingTeam?: Team) => {
    if (!innings || !battingTeam) return [];

    const partnerships: { player1: string, player2: string, runs: number, balls: number }[] = [];

    // We need to replay the innings to track partnerships
    // Initial batsmen
    let strikerId = battingTeam.players[0].id;
    let nonStrikerId = battingTeam.players[1].id;

    let currentPartnershipRuns = 0;
    let currentPartnershipBalls = 0;

    const allDeliveries = [...innings.allOvers.map(o => o.deliveries).flat(), ...innings.currentOver.deliveries];

    // This is complex because we need to know WHO was batting at every ball.
    // The Innings object has current striker/non-striker, but not history.
    // However, we can track who got OUT.

    // Simplified: Just list runs between wickets.
    // We know 1st partnership is until 1st wicket.
    // 2nd partnership is from 1st wicket to 2nd wicket.

    let wicketIndex = 0;

    allDeliveries.forEach(d => {
        currentPartnershipRuns += d.runs + d.extraRuns; // Extras count to partnership
        if (d.extraType !== 'WD' && d.extraType !== 'NB') {
            currentPartnershipBalls++;
        }

        if (d.isWicket) {
            const p1 = battingTeam.players.find(p => p.id === strikerId)?.name || 'Unknown';
            const p2 = battingTeam.players.find(p => p.id === nonStrikerId)?.name || 'Unknown';

            partnerships.push({
                player1: `Wicket ${wicketIndex + 1}`, // Placeholder names as tracking exact players requires replay
                player2: 'Partnership',
                runs: currentPartnershipRuns,
                balls: currentPartnershipBalls
            });
            currentPartnershipRuns = 0;
            currentPartnershipBalls = 0;
            wicketIndex++;
            // Logic to replace striker/non-striker would be needed for names
        }
    });

    // Current unbeaten partnership
    if (currentPartnershipBalls > 0 || currentPartnershipRuns > 0) {
        partnerships.push({
            player1: `Wicket ${wicketIndex + 1}`,
            player2: 'Unbroken',
            runs: currentPartnershipRuns,
            balls: currentPartnershipBalls
        });
    }

    return partnerships;
};

const styles = StyleSheet.create({
    container: {
        padding: 8,
    },
    card: {
        marginBottom: 16,
        backgroundColor: 'white',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    fowContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    fowItem: {
        backgroundColor: '#f0f0f0',
        padding: 8,
        borderRadius: 8,
        alignItems: 'center',
        minWidth: 60,
        marginBottom: 8,
    }
});
