import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, DataTable, Text, useTheme } from 'react-native-paper';
import { BowlerStats, Innings, Team } from '../models/types';

interface InternalBowlerStats extends BowlerStats {
    name: string;
}

interface MatchScorecardProps {
    innings: Innings;
    battingTeam: Team;
    bowlingTeam: Team;
}

export const MatchScorecard = ({ innings, battingTeam, bowlingTeam }: MatchScorecardProps) => {
    const theme = useTheme();

    if (!innings) {
        return <Text style={{ padding: 16 }}>Innings not started</Text>;
    }

    // Process Batting Stats
    const battingData = Object.values(innings.battingStats).map(stat => {
        const player = battingTeam.players.find(p => p.id === stat.playerId);
        return {
            ...stat,
            name: player ? player.name : 'Unknown',
        };
    });

    // Process Bowling Stats
    const bowlingData = Object.values(innings.bowlingStats).map(stat => {
        const player = bowlingTeam.players.find(p => p.id === stat.playerId);
        return {
            ...stat,
            name: player ? player.name : 'Unknown',
        };
    });

    // Calculate Extras
    const extras = innings.totalRuns - battingData.reduce((sum, p) => sum + p.runs, 0);

    return (
        <View style={styles.container}>
            {/* Batting Table */}
            <Card style={styles.card} mode="outlined">
                <Card.Title title={`${battingTeam.name} Batting`} titleVariant="titleMedium" />
                <DataTable>
                    <DataTable.Header>
                        <DataTable.Title style={{ flex: 3 }}>Batter</DataTable.Title>
                        <DataTable.Title numeric>R</DataTable.Title>
                        <DataTable.Title numeric>B</DataTable.Title>
                        <DataTable.Title numeric>4s</DataTable.Title>
                        <DataTable.Title numeric>6s</DataTable.Title>
                        <DataTable.Title numeric>SR</DataTable.Title>
                    </DataTable.Header>

                    {battingData.map(player => (
                        <DataTable.Row key={player.playerId}>
                            <DataTable.Cell style={{ flex: 3 }}>
                                <View>
                                    <Text variant="bodySmall" style={{ fontWeight: 'bold' }}>{player.name}</Text>
                                    <Text variant="labelSmall" style={{ color: player.isOut ? theme.colors.error : theme.colors.primary }}>
                                        {player.isOut ? player.wicketType || 'out' : 'not out'}
                                    </Text>
                                </View>
                            </DataTable.Cell>
                            <DataTable.Cell numeric>{player.runs}</DataTable.Cell>
                            <DataTable.Cell numeric>{player.balls}</DataTable.Cell>
                            <DataTable.Cell numeric>{player.fours}</DataTable.Cell>
                            <DataTable.Cell numeric>{player.sixes}</DataTable.Cell>
                            <DataTable.Cell numeric>
                                {player.balls > 0 ? ((player.runs / player.balls) * 100).toFixed(1) : '0.0'}
                            </DataTable.Cell>
                        </DataTable.Row>
                    ))}

                    <DataTable.Row>
                        <DataTable.Cell style={{ flex: 3 }}><Text style={{ fontWeight: 'bold' }}>Extras</Text></DataTable.Cell>
                        <DataTable.Cell numeric><Text style={{ fontWeight: 'bold' }}>{extras}</Text></DataTable.Cell>
                        <DataTable.Cell numeric> </DataTable.Cell>
                        <DataTable.Cell numeric> </DataTable.Cell>
                        <DataTable.Cell numeric> </DataTable.Cell>
                        <DataTable.Cell numeric> </DataTable.Cell>
                    </DataTable.Row>

                    <DataTable.Row>
                        <DataTable.Cell style={{ flex: 3 }}><Text style={{ fontWeight: 'bold', fontSize: 16 }}>Total</Text></DataTable.Cell>
                        <DataTable.Cell numeric>
                            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                                {innings.totalRuns}/{innings.totalWickets}
                            </Text>
                        </DataTable.Cell>
                        <DataTable.Cell numeric> </DataTable.Cell>
                        <DataTable.Cell numeric> </DataTable.Cell>
                        <DataTable.Cell numeric> </DataTable.Cell>
                        <DataTable.Cell numeric>
                            <Text variant="labelSmall">
                                ({innings.oversBowled} ov)
                            </Text>
                        </DataTable.Cell>
                    </DataTable.Row>
                </DataTable>
            </Card>

            {/* Bowling Table */}
            <Card style={styles.card} mode="outlined">
                <Card.Title title={`${bowlingTeam.name} Bowling`} titleVariant="titleMedium" />
                <DataTable>
                    <DataTable.Header>
                        <DataTable.Title style={{ flex: 3 }}>Bowler</DataTable.Title>
                        <DataTable.Title numeric>O</DataTable.Title>
                        <DataTable.Title numeric>M</DataTable.Title>
                        <DataTable.Title numeric>R</DataTable.Title>
                        <DataTable.Title numeric>W</DataTable.Title>
                        <DataTable.Title numeric>ECO</DataTable.Title>
                    </DataTable.Header>

                    {bowlingData.map(player => (
                        <DataTable.Row key={player.playerId}>
                            <DataTable.Cell style={{ flex: 3 }}>{player.name}</DataTable.Cell>
                            <DataTable.Cell numeric>
                                {player.overs}.{player.balls}
                            </DataTable.Cell>
                            <DataTable.Cell numeric>{player.maidens}</DataTable.Cell>
                            <DataTable.Cell numeric>{player.runsConceded}</DataTable.Cell>
                            <DataTable.Cell numeric>{player.wickets}</DataTable.Cell>
                            <DataTable.Cell numeric>
                                {(player.runsConceded / (player.overs + (player.balls / 6) || 1)).toFixed(1)}
                            </DataTable.Cell>
                        </DataTable.Row>
                    ))}
                </DataTable>
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 8,
    },
    card: {
        marginBottom: 16,
        backgroundColor: 'white',
    },
});
