import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
    Avatar,
    Button,
    Card,
    DataTable,
    Dialog,
    IconButton,
    Portal,
    Surface,
    Text,
    useTheme
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BowlerSelectionModal } from '../../components/BowlerSelectionModal';
import { InningsCompleteModal } from '../../components/InningsCompleteModal';
import { MatchResultModal } from '../../components/MatchResultModal';
import { ScorecardBottomSheet } from '../../components/ScorecardBottomSheet';
import { useMatchHistory } from '../../hooks/useMatchHistory';
import { Team } from '../../models/types';
import { useMatchViewModel } from '../../viewmodels/useMatchViewModel';

export default function MatchScreen() {
    const router = useRouter();
    const theme = useTheme();
    const params = useLocalSearchParams();
    const { teamA, teamB, overs } = params;
    const { saveMatch } = useMatchHistory();

    const {
        match,
        startMatch,
        scoreBall,
        getCurrentInnings,
        inningsComplete,
        inningsDeliveries,
        resetInningsComplete,
        needsBowlerSelection,
        lastBowlerId,
        confirmNewBowler,
        startSecondInnings,
        matchResult,
        undoLastBall,
        canUndo,
    } = useMatchViewModel();

    // Dialog State
    const [wicketDialogVisible, setWicketDialogVisible] = useState(false);
    const [selectedOutPlayerId, setSelectedOutPlayerId] = useState<string | null>(null);
    const [scorecardVisible, setScorecardVisible] = useState(false);
    const [byeDialogVisible, setByeDialogVisible] = useState(false);
    const [byeDialogType, setByeDialogType] = useState<'B' | 'LB'>('B');

    useEffect(() => {
        if (teamA && teamB && overs) {
            try {
                const tA: Team = JSON.parse(teamA as string);
                const tB: Team = JSON.parse(teamB as string);
                startMatch(tA, tB, parseInt(overs as string));
            } catch (e) {
                Alert.alert("Error", "Failed to start match details");
                router.back();
            }
        }
    }, [teamA, teamB, overs, startMatch, router]);

    const innings = getCurrentInnings();

    if (!match || !innings) {
        return (
            <View style={styles.loadingContainer}>
                <Text variant="bodyLarge">Loading Match...</Text>
            </View>
        );
    }

    const battingTeam = innings.battingTeamId === match.teamA.id ? match.teamA : match.teamB;
    const bowlingTeam = innings.bowlingTeamId === match.teamA.id ? match.teamA : match.teamB;

    const striker = battingTeam.players.find(p => p.id === innings.strikerId);
    const nonStriker = battingTeam.players.find(p => p.id === innings.nonStrikerId);
    const currentBowler = bowlingTeam.players.find(p => p.id === innings.currentBowlerId);

    const strikerStats = innings.battingStats[innings.strikerId];
    const nonStrikerStats = innings.battingStats[innings.nonStrikerId];
    const bowlerStats = innings.bowlingStats[innings.currentBowlerId];

    const handleScore = (runs: number) => {
        scoreBall(runs);
    };

    const handleWide = () => {
        scoreBall(0, 'WD');
    };

    const handleNoBall = () => {
        scoreBall(0, 'NB');
    };

    const openByeDialog = (type: 'B' | 'LB') => {
        setByeDialogType(type);
        setByeDialogVisible(true);
    };

    const confirmBye = (runs: number) => {
        scoreBall(runs, byeDialogType);
        setByeDialogVisible(false);
    };

    const handleWicketClick = () => {
        setSelectedOutPlayerId(innings.strikerId); // Default to striker
        setWicketDialogVisible(true);
    };

    const confirmWicket = () => {
        if (selectedOutPlayerId) {
            scoreBall(0, 'None', true, 'caught', selectedOutPlayerId);
            setWicketDialogVisible(false);
        }
    };

    const handleInningsCompleteClose = () => {
        if (match.currentInningsNumber === 1) {
            startSecondInnings();
        } else {
            resetInningsComplete();
        }
    };

    const handleSaveAndExit = async () => {
        if (match) {
            await saveMatch(match);
        }
        router.replace('/');
    };

    const getBallCircleStyle = (d: any) => {
        if (d.isWicket) return { backgroundColor: '#F44336' };
        if (d.extraType === 'WD' || d.extraType === 'NB') return { backgroundColor: '#FF9800' };
        if (d.extraType === 'B' || d.extraType === 'LB') return { backgroundColor: '#00BCD4' };
        if (d.runs === 4) return { backgroundColor: '#4CAF50' };
        if (d.runs === 6) return { backgroundColor: '#673AB7' };
        if (d.runs === 0) return { backgroundColor: '#9E9E9E' };
        return { backgroundColor: '#2196F3' };
    };

    const getBallLabel = (d: any) => {
        if (d.isWicket) return 'W';
        if (d.extraType === 'WD') return 'WD';
        if (d.extraType === 'NB') return 'NB';
        if (d.extraType === 'B') return `${d.runs}B`;
        if (d.extraType === 'LB') return `${d.runs}LB`;
        if (d.extraType !== 'None') return d.extraType;
        return d.runs.toString();
    };

    const firstInningsScore = match.firstInnings
        ? `${match.firstInnings.totalRuns}/${match.firstInnings.totalWickets}`
        : '-';
    const secondInningsScore = match.secondInnings
        ? `${match.secondInnings.totalRuns}/${match.secondInnings.totalWickets}`
        : '-';

    return (
        <SafeAreaView style={styles.container}>
            <Portal>
                {/* Wicket Dialog */}
                <Dialog visible={wicketDialogVisible} onDismiss={() => setWicketDialogVisible(false)}>
                    <Dialog.Title>Wicket! ☝️</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium" style={{ marginBottom: 15 }}>Who got out?</Text>
                        <View style={styles.dialogOptions}>
                            <Button
                                mode={selectedOutPlayerId === innings.strikerId ? "contained" : "outlined"}
                                onPress={() => setSelectedOutPlayerId(innings.strikerId)}
                                style={styles.dialogBtn}
                            >
                                {striker?.name} (Striker)
                            </Button>
                            <Button
                                mode={selectedOutPlayerId === innings.nonStrikerId ? "contained" : "outlined"}
                                onPress={() => setSelectedOutPlayerId(innings.nonStrikerId)}
                                style={styles.dialogBtn}
                            >
                                {nonStriker?.name}
                            </Button>
                        </View>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setWicketDialogVisible(false)}>Cancel</Button>
                        <Button theme={{ colors: { primary: '#F44336' } }} onPress={confirmWicket}>Confirm Wicket</Button>
                    </Dialog.Actions>
                </Dialog>

                {/* Bye / Leg Bye Run Selection Dialog */}
                <Dialog visible={byeDialogVisible} onDismiss={() => setByeDialogVisible(false)}>
                    <Dialog.Title>{byeDialogType === 'B' ? '🏃 Bye Runs' : '🦵 Leg Bye Runs'}</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium" style={{ marginBottom: 15 }}>How many {byeDialogType === 'B' ? 'bye' : 'leg bye'} runs?</Text>
                        <View style={styles.byeRunsRow}>
                            {[1, 2, 3, 4].map(r => (
                                <Button
                                    key={r}
                                    mode="contained"
                                    buttonColor="#00BCD4"
                                    style={styles.byeRunBtn}
                                    contentStyle={styles.byeRunBtnContent}
                                    labelStyle={styles.byeRunBtnLabel}
                                    onPress={() => confirmBye(r)}
                                >
                                    {r}
                                </Button>
                            ))}
                        </View>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setByeDialogVisible(false)}>Cancel</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            <Surface style={styles.header} elevation={4}>
                {/* Both Teams Mini Scoreboard */}
                {match.currentInningsNumber === 2 && match.firstInnings && (
                    <View style={styles.miniScoreboard}>
                        <View style={styles.miniTeam}>
                            <Text variant="labelSmall" style={styles.miniTeamName}>{match.teamA.name}</Text>
                            <Text variant="labelMedium" style={styles.miniScore}>
                                {match.firstInnings.battingTeamId === match.teamA.id
                                    ? `${match.firstInnings.totalRuns}/${match.firstInnings.totalWickets}`
                                    : innings.battingTeamId === match.teamA.id
                                        ? `${innings.totalRuns}/${innings.totalWickets}`
                                        : '-'}
                            </Text>
                        </View>
                        <Text variant="labelSmall" style={{ color: '#ffffff55' }}>vs</Text>
                        <View style={styles.miniTeam}>
                            <Text variant="labelSmall" style={styles.miniTeamName}>{match.teamB.name}</Text>
                            <Text variant="labelMedium" style={styles.miniScore}>
                                {match.firstInnings.battingTeamId === match.teamB.id
                                    ? `${match.firstInnings.totalRuns}/${match.firstInnings.totalWickets}`
                                    : innings.battingTeamId === match.teamB.id
                                        ? `${innings.totalRuns}/${innings.totalWickets}`
                                        : '-'}
                            </Text>
                        </View>
                    </View>
                )}

                <View style={styles.headerTop}>
                    <View>
                        <Text variant="titleLarge" style={styles.teamName}>{battingTeam.name}</Text>
                        <Text variant="labelSmall" style={styles.inningsLabel}>
                            {match.currentInningsNumber === 1 ? '1st Innings' : '2nd Innings'}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text variant="labelMedium" style={styles.oversText}>
                            Overs: {Math.floor(innings.currentOver.validBalls / 6) + innings.allOvers.length}.{innings.currentOver.validBalls % 6} / {match.totalOvers}
                        </Text>
                        <IconButton
                            icon="clipboard-text"
                            iconColor="#fff"
                            size={22}
                            onPress={() => setScorecardVisible(true)}
                            style={{ marginLeft: 4 }}
                        />
                    </View>
                </View>
                <View style={styles.scoreContainer}>
                    <Text variant="displayLarge" style={styles.scoreText}>
                        {innings.totalRuns}/{innings.totalWickets}
                    </Text>
                    <View style={styles.crrContainer}>
                        <Text variant="labelSmall" style={styles.crrLabel}>CRR</Text>
                        <Text variant="titleMedium" style={styles.crrValue}>
                            {innings.allOvers.length + (innings.currentOver.validBalls / 6) > 0
                                ? (innings.totalRuns / (innings.allOvers.length + (innings.currentOver.validBalls / 6))).toFixed(2)
                                : "0.00"}
                        </Text>
                    </View>
                </View>
                <View style={styles.targetContainer}>
                    {match.currentInningsNumber === 2 && match.firstInnings && (
                        <Text variant="bodyMedium" style={styles.targetText}>
                            Target: {match.firstInnings.totalRuns + 1} | Need {(match.firstInnings.totalRuns + 1) - innings.totalRuns} runs
                        </Text>
                    )}
                </View>
            </Surface>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Card style={styles.card} mode="elevated">
                    <Card.Title
                        title="Batting"
                        titleStyle={{ color: '#000000', fontWeight: 'bold' }}
                        left={(props) => <Avatar.Icon {...props} icon="cricket" size={40} style={{ backgroundColor: theme.colors.primary }} />}
                    />
                    <Card.Content style={styles.cardContent}>
                        <DataTable>
                            <DataTable.Header>
                                <DataTable.Title style={{ flex: 2 }} textStyle={{ color: '#000000', fontWeight: 'bold' }}>Batsman</DataTable.Title>
                                <DataTable.Title numeric textStyle={{ color: '#000000', fontWeight: 'bold' }}>R</DataTable.Title>
                                <DataTable.Title numeric textStyle={{ color: '#000000', fontWeight: 'bold' }}>B</DataTable.Title>
                                <DataTable.Title numeric textStyle={{ color: '#000000', fontWeight: 'bold' }}>4s</DataTable.Title>
                                <DataTable.Title numeric textStyle={{ color: '#000000', fontWeight: 'bold' }}>6s</DataTable.Title>
                                <DataTable.Title numeric textStyle={{ color: '#000000', fontWeight: 'bold' }}>SR</DataTable.Title>
                            </DataTable.Header>

                            <DataTable.Row style={styles.activeRow}>
                                <DataTable.Cell style={{ flex: 2 }}>
                                    <Text style={{ fontWeight: 'bold', color: '#000000' }}>{striker?.name} *</Text>
                                </DataTable.Cell>
                                <DataTable.Cell numeric textStyle={{ color: '#000000' }}>{strikerStats?.runs || 0}</DataTable.Cell>
                                <DataTable.Cell numeric textStyle={{ color: '#000000' }}>{strikerStats?.balls || 0}</DataTable.Cell>
                                <DataTable.Cell numeric textStyle={{ color: '#000000' }}>{strikerStats?.fours || 0}</DataTable.Cell>
                                <DataTable.Cell numeric textStyle={{ color: '#000000' }}>{strikerStats?.sixes || 0}</DataTable.Cell>
                                <DataTable.Cell numeric textStyle={{ color: '#000000' }}>{strikerStats?.balls ? ((strikerStats.runs / strikerStats.balls) * 100).toFixed(0) : 0}</DataTable.Cell>
                            </DataTable.Row>

                            <DataTable.Row>
                                <DataTable.Cell style={{ flex: 2 }} textStyle={{ color: '#000000' }}>{nonStriker?.name}</DataTable.Cell>
                                <DataTable.Cell numeric textStyle={{ color: '#000000' }}>{nonStrikerStats?.runs || 0}</DataTable.Cell>
                                <DataTable.Cell numeric textStyle={{ color: '#000000' }}>{nonStrikerStats?.balls || 0}</DataTable.Cell>
                                <DataTable.Cell numeric textStyle={{ color: '#000000' }}>{nonStrikerStats?.fours || 0}</DataTable.Cell>
                                <DataTable.Cell numeric textStyle={{ color: '#000000' }}>{nonStrikerStats?.sixes || 0}</DataTable.Cell>
                                <DataTable.Cell numeric textStyle={{ color: '#000000' }}>{nonStrikerStats?.balls ? ((nonStrikerStats.runs / nonStrikerStats.balls) * 100).toFixed(0) : 0}</DataTable.Cell>
                            </DataTable.Row>
                        </DataTable>
                    </Card.Content>
                </Card>

                <Card style={styles.card} mode="elevated">
                    <Card.Title
                        title="Bowling"
                        titleStyle={{ color: '#000000', fontWeight: 'bold' }}
                        left={(props) => <Avatar.Icon {...props} icon="tennis-ball" size={40} style={{ backgroundColor: theme.colors.secondary }} />}
                    />
                    <Card.Content style={styles.cardContent}>
                        <DataTable>
                            <DataTable.Header>
                                <DataTable.Title style={{ flex: 2 }} textStyle={{ color: '#000000', fontWeight: 'bold' }}>Bowler</DataTable.Title>
                                <DataTable.Title numeric textStyle={{ color: '#000000', fontWeight: 'bold' }}>O</DataTable.Title>
                                <DataTable.Title numeric textStyle={{ color: '#000000', fontWeight: 'bold' }}>M</DataTable.Title>
                                <DataTable.Title numeric textStyle={{ color: '#000000', fontWeight: 'bold' }}>R</DataTable.Title>
                                <DataTable.Title numeric textStyle={{ color: '#000000', fontWeight: 'bold' }}>W</DataTable.Title>
                                <DataTable.Title numeric textStyle={{ color: '#000000', fontWeight: 'bold' }}>Eco</DataTable.Title>
                            </DataTable.Header>

                            <DataTable.Row>
                                <DataTable.Cell style={{ flex: 2 }} textStyle={{ color: '#000000' }}>{currentBowler?.name || "Select Bowler"}</DataTable.Cell>
                                <DataTable.Cell numeric textStyle={{ color: '#000000' }}>{bowlerStats?.overs || 0}.{bowlerStats?.balls || 0}</DataTable.Cell>
                                <DataTable.Cell numeric textStyle={{ color: '#000000' }}>{bowlerStats?.maidens || 0}</DataTable.Cell>
                                <DataTable.Cell numeric textStyle={{ color: '#000000' }}>{bowlerStats?.runsConceded || 0}</DataTable.Cell>
                                <DataTable.Cell numeric textStyle={{ color: '#000000' }}>{bowlerStats?.wickets || 0}</DataTable.Cell>
                                <DataTable.Cell numeric textStyle={{ color: '#000000' }}>-</DataTable.Cell>
                            </DataTable.Row>
                        </DataTable>
                    </Card.Content>
                </Card>

                <Card style={styles.card} mode="elevated">
                    <Card.Content>
                        <Text variant="titleMedium" style={{ marginBottom: 12, color: '#000000', fontWeight: 'bold' }}>This Over</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ballContainer}>
                            {innings.currentOver.deliveries.length === 0 ? (
                                <Text style={{ color: '#888', fontStyle: 'italic' }}>No balls yet</Text>
                            ) : (
                                innings.currentOver.deliveries.map((d, i) => (
                                    <View key={i} style={[styles.ballCircle, getBallCircleStyle(d)]}>
                                        <Text style={styles.ballText}>
                                            {getBallLabel(d)}
                                        </Text>
                                    </View>
                                ))
                            )}
                        </ScrollView>
                    </Card.Content>
                </Card>
            </ScrollView>

            <Surface style={styles.controls} elevation={5}>
                {canUndo && (
                    <View style={styles.undoRow}>
                        <Button
                            mode="text"
                            icon="undo"
                            textColor="#F44336"
                            onPress={undoLastBall}
                            compact
                            style={styles.undoBtn}
                        >
                            Undo Last Ball
                        </Button>
                    </View>
                )}
                <View style={styles.controlGrid}>
                    <Button mode="contained-tonal" style={styles.controlBtnRound} contentStyle={styles.controlBtnContent} labelStyle={styles.controlBtnLabel} onPress={() => handleScore(0)}>0</Button>
                    <Button mode="contained-tonal" style={styles.controlBtnRound} contentStyle={styles.controlBtnContent} labelStyle={styles.controlBtnLabel} onPress={() => handleScore(1)}>1</Button>
                    <Button mode="contained-tonal" style={styles.controlBtnRound} contentStyle={styles.controlBtnContent} labelStyle={styles.controlBtnLabel} onPress={() => handleScore(2)}>2</Button>
                    <Button mode="contained" buttonColor="#4CAF50" style={styles.controlBtnRound} contentStyle={styles.controlBtnContent} labelStyle={styles.controlBtnLabel} onPress={() => handleScore(4)}>4</Button>
                    <Button mode="contained" buttonColor="#673AB7" style={styles.controlBtnRound} contentStyle={styles.controlBtnContent} labelStyle={styles.controlBtnLabel} onPress={() => handleScore(6)}>6</Button>

                    <Button mode="outlined" style={styles.controlBtnRoundSmall} contentStyle={styles.controlBtnContent} labelStyle={styles.controlLabelSmall} onPress={handleWide}>WD</Button>
                    <Button mode="outlined" style={styles.controlBtnRoundSmall} contentStyle={styles.controlBtnContent} labelStyle={styles.controlLabelSmall} onPress={handleNoBall}>NB</Button>
                    <Button mode="outlined" style={[styles.controlBtnRoundSmall, styles.byeBtnStyle]} contentStyle={styles.controlBtnContent} labelStyle={styles.byeLabel} onPress={() => openByeDialog('B')}>B</Button>
                    <Button mode="outlined" style={[styles.controlBtnRoundSmall, styles.byeBtnStyle]} contentStyle={styles.controlBtnContent} labelStyle={styles.byeLabel} onPress={() => openByeDialog('LB')}>LB</Button>
                    <Button mode="contained" buttonColor="#F44336" style={styles.controlBtnRound} contentStyle={styles.controlBtnContent} labelStyle={styles.controlBtnLabel} onPress={handleWicketClick}>W</Button>
                </View>
            </Surface>

            {/* Bowler Selection Modal */}
            <BowlerSelectionModal
                visible={needsBowlerSelection}
                players={bowlingTeam.players}
                lastBowlerId={lastBowlerId}
                onSelect={confirmNewBowler}
            />

            {/* Scorecard Bottom Sheet */}
            <ScorecardBottomSheet
                visible={scorecardVisible}
                onDismiss={() => setScorecardVisible(false)}
                innings={innings}
                battingTeamName={battingTeam.name}
                bowlingTeamName={bowlingTeam.name}
                battingPlayers={battingTeam.players}
                bowlingPlayers={bowlingTeam.players}
            />

            {/* Innings Complete Modal */}
            <InningsCompleteModal
                visible={inningsComplete}
                deliveries={inningsDeliveries}
                battingTeamName={battingTeam.name}
                totalRuns={innings.totalRuns}
                totalWickets={innings.totalWickets}
                totalOvers={match.totalOvers}
                onClose={handleInningsCompleteClose}
            />

            {/* Match Result Modal */}
            <MatchResultModal
                visible={!!matchResult}
                result={matchResult?.result || ''}
                winnerName={matchResult?.winnerName}
                teamAName={match.teamA.name}
                teamBName={match.teamB.name}
                firstInningsScore={firstInningsScore}
                secondInningsScore={secondInningsScore}
                totalOvers={match.totalOvers}
                onSaveAndExit={handleSaveAndExit}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 24,
        paddingTop: 10,
        backgroundColor: '#1a237e',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    teamName: {
        color: '#fff',
        fontWeight: 'bold',
        opacity: 0.9,
    },
    inningsLabel: {
        color: 'rgba(255,255,255,0.6)',
        marginTop: 2,
    },
    oversText: {
        color: '#fff',
        opacity: 0.8,
    },
    scoreContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    scoreText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 48,
        lineHeight: 56,
    },
    crrContainer: {
        alignItems: 'flex-end',
        paddingBottom: 8,
    },
    crrLabel: {
        color: 'rgba(255,255,255,0.7)',
    },
    crrValue: {
        color: '#fff',
        fontWeight: 'bold',
    },
    targetContainer: {
        marginTop: 4,
    },
    targetText: {
        color: '#FF9800',
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 240,
    },
    card: {
        marginBottom: 16,
        borderRadius: 12,
        backgroundColor: '#fff',
    },
    cardContent: {
        paddingHorizontal: 0,
        paddingBottom: 8,
    },
    activeRow: {
        backgroundColor: '#e8eaf6',
    },
    ballContainer: {
        flexDirection: 'row',
        gap: 8,
        paddingVertical: 4,
    },
    ballCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ballText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    controls: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 16,
        paddingBottom: 24,
    },
    controlGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
    },
    controlBtnRound: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 2,
    },
    controlBtnRoundSmall: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#FF9800',
        marginHorizontal: 2,
    },
    byeBtnStyle: {
        borderColor: '#00BCD4',
    },
    controlBtnContent: {
        height: 56,
        width: 56,
    },
    controlBtnLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 0,
        marginHorizontal: 0,
    },
    controlLabelSmall: {
        fontSize: 13,
        color: '#E65100',
        fontWeight: 'bold',
        marginVertical: 0,
        marginHorizontal: 0,
    },
    byeLabel: {
        fontSize: 13,
        color: '#00838F',
        fontWeight: 'bold',
        marginVertical: 0,
        marginHorizontal: 0,
    },
    dialogOptions: {
        gap: 10,
    },
    dialogBtn: {
        borderRadius: 8,
    },
    byeRunsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    byeRunBtn: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    byeRunBtnContent: {
        width: 56,
        height: 56,
    },
    byeRunBtnLabel: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    undoRow: {
        alignItems: 'flex-end',
        marginBottom: 4,
    },
    undoBtn: {
        borderRadius: 8,
    },
    miniScoreboard: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.15)',
        marginBottom: 8,
    },
    miniTeam: {
        alignItems: 'center',
    },
    miniTeamName: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 11,
    },
    miniScore: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
