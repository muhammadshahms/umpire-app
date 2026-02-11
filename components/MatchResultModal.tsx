import React, { useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, View } from 'react-native';
import { Button, PaperProvider, Surface, Text } from 'react-native-paper';

interface MatchResultModalProps {
    visible: boolean;
    result: string;
    winnerName?: string;
    teamAName: string;
    teamBName: string;
    firstInningsScore: string;
    secondInningsScore: string;
    totalOvers: number;
    onSaveAndExit: () => void;
}

export const MatchResultModal: React.FC<MatchResultModalProps> = ({
    visible,
    result,
    winnerName,
    teamAName,
    teamBName,
    firstInningsScore,
    secondInningsScore,
    totalOvers,
    onSaveAndExit,
}) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            scaleAnim.setValue(0);
            fadeAnim.setValue(0);
            Animated.sequence([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 4,
                    tension: 80,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const isTie = !winnerName;

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <PaperProvider>
                <View style={styles.overlay}>
                    <Surface style={styles.container} elevation={5}>
                        <Animated.View style={[styles.trophyContainer, { transform: [{ scale: scaleAnim }] }]}>
                            <Text style={styles.trophyEmoji}>{isTie ? '🤝' : '🏆'}</Text>
                        </Animated.View>

                        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                            <Text variant="headlineMedium" style={styles.resultTitle}>
                                {isTie ? 'Match Tied!' : 'Match Over!'}
                            </Text>

                            {winnerName && (
                                <Text variant="headlineSmall" style={styles.winnerText}>
                                    {winnerName} Wins! 🎉
                                </Text>
                            )}

                            <Text variant="bodyLarge" style={styles.resultDetail}>
                                {result}
                            </Text>

                            <View style={styles.scoreBoard}>
                                <View style={styles.teamScore}>
                                    <Text variant="titleMedium" style={styles.teamNameText}>{teamAName}</Text>
                                    <Text variant="headlineSmall" style={styles.scoreValue}>{firstInningsScore}</Text>
                                    <Text variant="bodySmall" style={styles.oversLabel}>({totalOvers} ov)</Text>
                                </View>
                                <Text variant="titleLarge" style={styles.vsText}>vs</Text>
                                <View style={styles.teamScore}>
                                    <Text variant="titleMedium" style={styles.teamNameText}>{teamBName}</Text>
                                    <Text variant="headlineSmall" style={styles.scoreValue}>{secondInningsScore}</Text>
                                    <Text variant="bodySmall" style={styles.oversLabel}>({totalOvers} ov)</Text>
                                </View>
                            </View>

                            <Button
                                mode="contained"
                                onPress={onSaveAndExit}
                                buttonColor="#4CAF50"
                                style={styles.exitButton}
                                contentStyle={styles.exitButtonContent}
                                icon="check-circle"
                            >
                                Save & Exit
                            </Button>
                        </Animated.View>
                    </Surface>
                </View>
            </PaperProvider>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '92%',
        backgroundColor: '#1a1a2e',
        borderRadius: 24,
        overflow: 'hidden',
        alignItems: 'center',
        paddingBottom: 24,
    },
    trophyContainer: {
        marginTop: 30,
        marginBottom: 10,
    },
    trophyEmoji: {
        fontSize: 80,
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 20,
        width: '100%',
    },
    resultTitle: {
        fontWeight: 'bold',
        color: '#e94560',
        marginBottom: 4,
    },
    winnerText: {
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 8,
    },
    resultDetail: {
        color: '#ccc',
        textAlign: 'center',
        marginBottom: 20,
    },
    scoreBoard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '100%',
        backgroundColor: '#16213e',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    teamScore: {
        alignItems: 'center',
        flex: 1,
    },
    teamNameText: {
        color: '#aaa',
        fontWeight: '600',
        marginBottom: 4,
    },
    scoreValue: {
        color: '#fff',
        fontWeight: 'bold',
    },
    oversLabel: {
        color: '#888',
        marginTop: 2,
    },
    vsText: {
        color: '#555',
        fontWeight: 'bold',
    },
    exitButton: {
        width: '100%',
        borderRadius: 14,
    },
    exitButtonContent: {
        paddingVertical: 8,
    },
});
