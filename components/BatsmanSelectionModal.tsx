import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Dialog, Portal, RadioButton, Text, useTheme } from 'react-native-paper';
import { Player } from '../models/types';

interface BatsmanSelectionModalProps {
    visible: boolean;
    players: Player[];
    battingStats: { [id: string]: any }; // To identify who has already batted/is out
    onSelect: (playerId: string) => void;
}

export const BatsmanSelectionModal = ({ visible, players, battingStats, onSelect }: BatsmanSelectionModalProps) => {
    const theme = useTheme();
    const [selectedPlayerId, setSelectedPlayerId] = React.useState<string>('');

    // Filter players who have NOT batted yet (not in battingStats)
    // Note: The two current batsmen are in battingStats (isOut=false).
    // The one who just got OUT is in battingStats (isOut=true).
    // So we need players who are *not* in battingStats at all.
    // Wait, createInnings initializes stats for openers. Other players don't have stats yet.
    const availablePlayers = players.filter(p => !battingStats[p.id]);

    React.useEffect(() => {
        if (visible) {
            setSelectedPlayerId('');
        }
    }, [visible]);

    return (
        <Portal>
            <Dialog visible={visible} dismissable={false} style={{ backgroundColor: theme.colors.surface }}>
                <Dialog.Title style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    🏏 Select Next Batsman
                </Dialog.Title>
                <Dialog.Content>
                    <DataList
                        data={availablePlayers}
                        selectedId={selectedPlayerId}
                        onSelect={setSelectedPlayerId}
                    />
                </Dialog.Content>
                <Dialog.Actions>
                    <Button
                        mode="contained"
                        onPress={() => onSelect(selectedPlayerId)}
                        disabled={!selectedPlayerId}
                        style={{ paddingHorizontal: 20 }}
                    >
                        Confirm Batsman
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

const DataList = ({ data, selectedId, onSelect }: { data: Player[], selectedId: string, onSelect: (id: string) => void }) => {
    const theme = useTheme();

    if (data.length === 0) {
        return (
            <View style={{ padding: 20, alignItems: 'center' }}>
                <Text>No more batsmen available!</Text>
            </View>
        );
    }

    return (
        <View style={{ height: 300 }}>
            <FlatList
                data={data}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <Card
                        style={[
                            styles.playerCard,
                            selectedId === item.id && { backgroundColor: theme.colors.primaryContainer }
                        ]}
                        onPress={() => onSelect(item.id)}
                        mode="outlined"
                    >
                        <Card.Content style={styles.cardContent}>
                            <View style={styles.playerRow}>
                                <Avatar.Text size={40} label={item.name.substring(0, 2).toUpperCase()} />
                                <Text variant="bodyLarge" style={styles.playerName}>{item.name}</Text>
                            </View>
                            <RadioButton
                                value={item.id}
                                status={selectedId === item.id ? 'checked' : 'unchecked'}
                                onPress={() => onSelect(item.id)}
                            />
                        </Card.Content>
                    </Card>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    playerCard: {
        marginBottom: 8,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    playerName: {
        fontWeight: 'bold',
    },
});
