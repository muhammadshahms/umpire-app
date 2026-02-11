import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
    Button,
    Chip,
    Divider,
    IconButton,
    Surface,
    Text,
    TextInput,
    useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTeamViewModel } from '../viewmodels/useTeamViewModel';

export default function AddPlayersScreen() {
    const router = useRouter();
    const theme = useTheme();
    const params = useLocalSearchParams();
    const { teamAName, teamBName, overs } = params;

    const { createTeam, addPlayer, teams } = useTeamViewModel();

    const [teamAId, setTeamAId] = useState<string>('');
    const [teamBId, setTeamBId] = useState<string>('');
    const [newPlayerName, setNewPlayerName] = useState('');
    const [activeTeamTab, setActiveTeamTab] = useState<'A' | 'B'>('A');

    useEffect(() => {
        if (teamAName && teamBName) {
            const tA = createTeam(teamAName as string);
            const tB = createTeam(teamBName as string);
            setTeamAId(tA.id);
            setTeamBId(tB.id);
        }
    }, [teamAName, teamBName]);

    const currentTeamId = activeTeamTab === 'A' ? teamAId : teamBId;
    const currentTeamName = activeTeamTab === 'A' ? teamAName : teamBName;
    const currentTeam = teams.find(t => t.id === currentTeamId);

    const handleAddPlayer = () => {
        if (!newPlayerName.trim()) return;
        addPlayer(currentTeamId, newPlayerName);
        setNewPlayerName('');
    };

    const handleStartMatch = () => {
        const teamA = teams.find(t => t.id === teamAId);
        const teamB = teams.find(t => t.id === teamBId);

        if (!teamA || !teamB) return;

        if (teamA.players.length < 2 || teamB.players.length < 2) {
            return; // Could show a Snackbar here
        }

        router.push({
            pathname: '/match',
            params: {
                teamA: JSON.stringify(teamA),
                teamB: JSON.stringify(teamB),
                overs: overs,
            }
        });
    };

    const teamA = teams.find(t => t.id === teamAId);
    const teamB = teams.find(t => t.id === teamBId);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.colors.surfaceVariant }]}>
                <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                    Add Players
                </Text>
            </View>

            {/* Team Tabs */}
            <View style={styles.tabs}>
                <Chip
                    selected={activeTeamTab === 'A'}
                    onPress={() => setActiveTeamTab('A')}
                    style={[styles.chip, activeTeamTab === 'A' && { backgroundColor: theme.colors.primaryContainer }]}
                    textStyle={activeTeamTab === 'A' ? { color: theme.colors.primary, fontWeight: 'bold' } : {}}
                    icon="shield"
                    showSelectedCheck={false}
                >
                    {teamAName} ({teamA?.players.length || 0})
                </Chip>
                <Chip
                    selected={activeTeamTab === 'B'}
                    onPress={() => setActiveTeamTab('B')}
                    style={[styles.chip, activeTeamTab === 'B' && { backgroundColor: theme.colors.primaryContainer }]}
                    textStyle={activeTeamTab === 'B' ? { color: theme.colors.primary, fontWeight: 'bold' } : {}}
                    icon="shield"
                    showSelectedCheck={false}
                >
                    {teamBName} ({teamB?.players.length || 0})
                </Chip>
            </View>

            {/* Add Player Input */}
            <View style={styles.inputContainer}>
                <TextInput
                    label={`Player name`}
                    placeholder={`Add player to ${currentTeamName}`}
                    value={newPlayerName}
                    onChangeText={setNewPlayerName}
                    onSubmitEditing={handleAddPlayer}
                    mode="outlined"
                    style={styles.input}
                    left={<TextInput.Icon icon="account-plus" />}
                    dense
                />
                <IconButton
                    icon="plus"
                    mode="contained"
                    iconColor="#fff"
                    containerColor={theme.colors.primary}
                    size={24}
                    onPress={handleAddPlayer}
                    style={styles.addButton}
                />
            </View>

            {/* Player List */}
            <FlatList
                data={currentTeam?.players || []}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <Surface style={styles.playerItem} elevation={1}>
                        <View style={styles.playerContent}>
                            <View style={[styles.playerNumber, { backgroundColor: theme.colors.primaryContainer }]}>
                                <Text variant="labelLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                                    {index + 1}
                                </Text>
                            </View>
                            <Text variant="bodyLarge" style={styles.playerText}>{item.name}</Text>
                        </View>
                    </Surface>
                )}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                            No players added yet
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                            Add at least 2 players per team
                        </Text>
                    </View>
                }
            />

            <Divider />

            {/* Footer */}
            <View style={styles.footer}>
                <Button
                    mode="contained"
                    onPress={handleStartMatch}
                    style={styles.startButton}
                    contentStyle={styles.startButtonContent}
                    icon="cricket"
                    buttonColor="#4CAF50"
                    disabled={!teamA || !teamB || (teamA?.players.length || 0) < 2 || (teamB?.players.length || 0) < 2}
                >
                    Start Match
                </Button>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        alignItems: 'center',
    },
    tabs: {
        flexDirection: 'row',
        padding: 12,
        gap: 8,
        justifyContent: 'center',
    },
    chip: {
        flex: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 12,
        alignItems: 'center',
        gap: 8,
    },
    input: {
        flex: 1,
    },
    addButton: {
        marginTop: 6,
    },
    list: {
        flex: 1,
    },
    listContent: {
        padding: 12,
        gap: 8,
    },
    playerItem: {
        borderRadius: 10,
        overflow: 'hidden',
    },
    playerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 12,
    },
    playerNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playerText: {
        flex: 1,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    footer: {
        padding: 16,
    },
    startButton: {
        borderRadius: 12,
    },
    startButtonContent: {
        paddingVertical: 6,
    },
});
