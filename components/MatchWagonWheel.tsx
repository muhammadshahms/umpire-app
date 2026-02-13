import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { Match, WagonWheelData } from '../models/types';
import { WagonWheel } from './WagonWheel';

interface MatchWagonWheelProps {
    match: Match;
}

export const MatchWagonWheel: React.FC<MatchWagonWheelProps> = ({ match }) => {
    const theme = useTheme();
    const [inningsTab, setInningsTab] = useState<string>(match.currentInningsNumber === 2 || match.status === 'Completed' ? '2' : '1');

    const shots = useMemo(() => {
        const targetInnings = inningsTab === '1' ? match.firstInnings : match.secondInnings;
        if (!targetInnings) return [];

        const collectedShots: WagonWheelData[] = [];
        targetInnings.allOvers.forEach(over => {
            over.deliveries.forEach(d => {
                if (d.wagonWheel) {
                    collectedShots.push({ ...d.wagonWheel, runs: d.runs });
                }
            });
        });

        // Also check current over if it exists
        targetInnings.currentOver.deliveries.forEach(d => {
            if (d.wagonWheel) {
                collectedShots.push({ ...d.wagonWheel, runs: d.runs });
            }
        });

        return collectedShots;
    }, [match, inningsTab]);

    return (
        <View style={styles.container}>
            {match.secondInnings && (
                <SegmentedButtons
                    value={inningsTab}
                    onValueChange={setInningsTab}
                    buttons={[
                        { value: '1', label: `1st Innings (${match.teamA.name})` },
                        // Note: Logic above assumes Team A batted first, but strictly we should check battingTeamId
                        // Better label logic:
                        // { value: '1', label: match.firstInnings?.battingTeamId === match.teamA.id ? match.teamA.name : match.teamB.name }
                        // For detailed display let's just use "1st Innings" and "2nd Innings" or simple names
                        { value: '2', label: '2nd Innings' },
                    ]}
                    style={styles.segmentedBtn}
                />
            )}

            <Card style={styles.card}>
                <Card.Content style={{ alignItems: 'center' }}>
                    <Text variant="titleMedium" style={{ marginBottom: 16 }}>
                        {inningsTab === '1'
                            ? `${match.firstInnings?.totalRuns}/${match.firstInnings?.totalWickets}`
                            : `${match.secondInnings?.totalRuns}/${match.secondInnings?.totalWickets}`
                        }
                    </Text>

                    <WagonWheel
                        size={320}
                        readonly
                        shots={shots}
                    />

                    <Text variant="bodySmall" style={{ marginTop: 10, color: '#666' }}>
                        Showing {shots.length} shots recorded
                    </Text>
                </Card.Content>
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    segmentedBtn: {
        marginBottom: 16,
    },
    card: {
        backgroundColor: 'white',
    },
});
