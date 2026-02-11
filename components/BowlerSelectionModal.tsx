import React from 'react';
import { FlatList, Modal, StyleSheet, View } from 'react-native';
import { Button, PaperProvider, Surface, Text, TouchableRipple } from 'react-native-paper';
import { Player } from '../models/types';

interface BowlerSelectionModalProps {
    visible: boolean;
    players: Player[];
    lastBowlerId?: string;
    onSelect: (playerId: string) => void;
}

export const BowlerSelectionModal: React.FC<BowlerSelectionModalProps> = ({
    visible,
    players,
    lastBowlerId,
    onSelect,
}) => {
    return (
        <Modal visible={visible} animationType="slide" transparent>
            <PaperProvider>
                <View style={styles.overlay}>
                    <Surface style={styles.container} elevation={5}>
                        <View style={styles.header}>
                            <Text variant="headlineSmall" style={styles.headerTitle}>
                                🏏 Select New Bowler
                            </Text>
                            <Text variant="bodyMedium" style={styles.subtitle}>
                                Over complete! Choose the next bowler.
                            </Text>
                        </View>

                        <FlatList
                            data={players}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContent}
                            renderItem={({ item }) => {
                                const isLastBowler = item.id === lastBowlerId;
                                return (
                                    <TouchableRipple
                                        onPress={() => !isLastBowler && onSelect(item.id)}
                                        disabled={isLastBowler}
                                        style={[
                                            styles.playerItem,
                                            isLastBowler && styles.disabledItem,
                                        ]}
                                    >
                                        <View style={styles.playerContent}>
                                            <View style={[styles.avatar, isLastBowler && { backgroundColor: '#555' }]}>
                                                <Text style={styles.avatarText}>
                                                    {item.name.charAt(0).toUpperCase()}
                                                </Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text
                                                    variant="bodyLarge"
                                                    style={[
                                                        styles.playerName,
                                                        isLastBowler && { color: '#666' },
                                                    ]}
                                                >
                                                    {item.name}
                                                </Text>
                                                {isLastBowler && (
                                                    <Text variant="bodySmall" style={{ color: '#888' }}>
                                                        Bowled last over
                                                    </Text>
                                                )}
                                            </View>
                                            {!isLastBowler && (
                                                <Button mode="text" textColor="#4CAF50" compact>
                                                    Select
                                                </Button>
                                            )}
                                        </View>
                                    </TouchableRipple>
                                );
                            }}
                        />
                    </Surface>
                </View>
            </PaperProvider>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '90%',
        maxHeight: '75%',
        backgroundColor: '#1a1a2e',
        borderRadius: 20,
        overflow: 'hidden',
    },
    header: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#16213e',
        borderBottomWidth: 1,
        borderBottomColor: '#0f3460',
    },
    headerTitle: {
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 4,
    },
    subtitle: {
        color: '#aaa',
    },
    listContent: {
        padding: 12,
        gap: 8,
    },
    playerItem: {
        backgroundColor: '#16213e',
        borderRadius: 12,
        overflow: 'hidden',
    },
    disabledItem: {
        backgroundColor: '#1a1a2e',
        opacity: 0.5,
    },
    playerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#0f3460',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    playerName: {
        color: '#fff',
        fontWeight: '600',
    },
});
