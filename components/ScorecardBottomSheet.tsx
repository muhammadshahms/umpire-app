import React from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { Button, DataTable, Divider, PaperProvider, Surface, Text } from 'react-native-paper';
import { BatsmanStats, BowlerStats, Innings, Player } from '../models/types';

interface ScorecardBottomSheetProps {
    visible: boolean;
    onDismiss: () => void;
    innings: Innings | null;
    battingTeamName: string;
    bowlingTeamName: string;
    battingPlayers: Player[];
    bowlingPlayers: Player[];
}

export const ScorecardBottomSheet: React.FC<ScorecardBottomSheetProps> = ({
    visible,
    onDismiss,
    innings,
    battingTeamName,
    bowlingTeamName,
    battingPlayers,
    bowlingPlayers,
}) => {
    if (!innings) return null;

    const getBatsmanName = (id: string) => battingPlayers.find(p => p.id === id)?.name || 'Unknown';
    const getBowlerName = (id: string) => bowlingPlayers.find(p => p.id === id)?.name || 'Unknown';

    const battingEntries: [string, BatsmanStats][] = Object.entries(innings.battingStats);
    const bowlingEntries: [string, BowlerStats][] = Object.entries(innings.bowlingStats);

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onDismiss}>
            <PaperProvider>
                <View style={styles.overlay}>
                    <Surface style={styles.sheet} elevation={5}>
                        {/* Handle bar */}
                        <View style={styles.handleBar}>
                            <View style={styles.handle} />
                        </View>

                        <View style={styles.header}>
                            <Text variant="titleLarge" style={styles.headerTitle}>📊 Scorecard</Text>
                            <Text variant="bodyMedium" style={styles.scoreText}>
                                {battingTeamName}: {innings.totalRuns}/{innings.totalWickets}
                            </Text>
                        </View>

                        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                            {/* Batting */}
                            <Text variant="titleMedium" style={styles.sectionTitle}>
                                🏏 {battingTeamName} - Batting
                            </Text>
                            <DataTable style={styles.table}>
                                <DataTable.Header style={styles.tableHeader}>
                                    <DataTable.Title style={{ flex: 2.5 }} textStyle={styles.headerCellText}>Batsman</DataTable.Title>
                                    <DataTable.Title numeric textStyle={styles.headerCellText}>R</DataTable.Title>
                                    <DataTable.Title numeric textStyle={styles.headerCellText}>B</DataTable.Title>
                                    <DataTable.Title numeric textStyle={styles.headerCellText}>4s</DataTable.Title>
                                    <DataTable.Title numeric textStyle={styles.headerCellText}>6s</DataTable.Title>
                                    <DataTable.Title numeric textStyle={styles.headerCellText}>SR</DataTable.Title>
                                </DataTable.Header>

                                {battingEntries.map(([id, stats]) => {
                                    const isStriker = id === innings.strikerId;
                                    const sr = stats.balls > 0 ? ((stats.runs / stats.balls) * 100).toFixed(0) : '0';
                                    return (
                                        <DataTable.Row key={id} style={isStriker ? styles.activeRow : undefined}>
                                            <DataTable.Cell style={{ flex: 2.5 }}>
                                                <Text style={[styles.cellText, stats.isOut && styles.outText]}>
                                                    {getBatsmanName(id)}{isStriker ? ' *' : ''}{stats.isOut ? ' ❌' : ''}
                                                </Text>
                                            </DataTable.Cell>
                                            <DataTable.Cell numeric textStyle={styles.cellText}>{stats.runs}</DataTable.Cell>
                                            <DataTable.Cell numeric textStyle={styles.cellText}>{stats.balls}</DataTable.Cell>
                                            <DataTable.Cell numeric textStyle={styles.cellText}>{stats.fours}</DataTable.Cell>
                                            <DataTable.Cell numeric textStyle={styles.cellText}>{stats.sixes}</DataTable.Cell>
                                            <DataTable.Cell numeric textStyle={styles.cellText}>{sr}</DataTable.Cell>
                                        </DataTable.Row>
                                    );
                                })}
                            </DataTable>

                            <Divider style={styles.divider} />

                            {/* Bowling */}
                            <Text variant="titleMedium" style={styles.sectionTitle}>
                                🎯 {bowlingTeamName} - Bowling
                            </Text>
                            <DataTable style={styles.table}>
                                <DataTable.Header style={styles.tableHeader}>
                                    <DataTable.Title style={{ flex: 2.5 }} textStyle={styles.headerCellText}>Bowler</DataTable.Title>
                                    <DataTable.Title numeric textStyle={styles.headerCellText}>O</DataTable.Title>
                                    <DataTable.Title numeric textStyle={styles.headerCellText}>M</DataTable.Title>
                                    <DataTable.Title numeric textStyle={styles.headerCellText}>R</DataTable.Title>
                                    <DataTable.Title numeric textStyle={styles.headerCellText}>W</DataTable.Title>
                                    <DataTable.Title numeric textStyle={styles.headerCellText}>Eco</DataTable.Title>
                                </DataTable.Header>

                                {bowlingEntries.map(([id, stats]) => {
                                    const totalOvers = stats.overs + stats.balls / 6;
                                    const eco = totalOvers > 0 ? (stats.runsConceded / totalOvers).toFixed(1) : '0.0';
                                    return (
                                        <DataTable.Row key={id}>
                                            <DataTable.Cell style={{ flex: 2.5 }}>
                                                <Text style={styles.cellText}>
                                                    {getBowlerName(id)}{id === innings.currentBowlerId ? ' *' : ''}
                                                </Text>
                                            </DataTable.Cell>
                                            <DataTable.Cell numeric textStyle={styles.cellText}>{stats.overs}.{stats.balls}</DataTable.Cell>
                                            <DataTable.Cell numeric textStyle={styles.cellText}>{stats.maidens}</DataTable.Cell>
                                            <DataTable.Cell numeric textStyle={styles.cellText}>{stats.runsConceded}</DataTable.Cell>
                                            <DataTable.Cell numeric textStyle={styles.cellText}>{stats.wickets}</DataTable.Cell>
                                            <DataTable.Cell numeric textStyle={styles.cellText}>{eco}</DataTable.Cell>
                                        </DataTable.Row>
                                    );
                                })}
                            </DataTable>
                        </ScrollView>

                        <View style={styles.footer}>
                            <Button mode="contained" onPress={onDismiss} buttonColor="#e94560" style={styles.closeBtn} contentStyle={styles.closeBtnContent}>
                                Close
                            </Button>
                        </View>
                    </Surface>
                </View>
            </PaperProvider>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: '#1a1a2e',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '85%',
    },
    handleBar: {
        alignItems: 'center',
        paddingTop: 12,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#555',
    },
    header: {
        padding: 16,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#0f3460',
    },
    headerTitle: {
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    scoreText: {
        color: '#4CAF50',
        fontWeight: '600',
    },
    scrollView: {
        maxHeight: 500,
    },
    scrollContent: {
        padding: 12,
    },
    sectionTitle: {
        fontWeight: 'bold',
        color: '#e94560',
        marginBottom: 8,
        marginTop: 8,
    },
    table: {
        backgroundColor: '#16213e',
        borderRadius: 12,
        overflow: 'hidden',
    },
    tableHeader: {
        backgroundColor: '#0f3460',
    },
    headerCellText: {
        color: '#aaa',
        fontWeight: 'bold',
        fontSize: 12,
    },
    cellText: {
        color: '#fff',
        fontSize: 13,
    },
    outText: {
        color: '#F44336',
    },
    activeRow: {
        backgroundColor: 'rgba(76, 175, 80, 0.15)',
    },
    divider: {
        marginVertical: 16,
        backgroundColor: '#0f3460',
    },
    footer: {
        padding: 16,
    },
    closeBtn: {
        borderRadius: 12,
    },
    closeBtnContent: {
        paddingVertical: 6,
    },
});
