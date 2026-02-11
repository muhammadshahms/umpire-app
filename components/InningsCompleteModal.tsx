import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Modal,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { Button, PaperProvider, Surface, Text } from 'react-native-paper';
import { Delivery } from '../models/types';

interface InningsCompleteModalProps {
    visible: boolean;
    deliveries: Delivery[];
    battingTeamName: string;
    totalRuns: number;
    totalWickets: number;
    totalOvers: number;
    onClose: () => void;
}

const getBallColor = (delivery: Delivery): string => {
    if (delivery.isWicket) return '#F44336';
    if (delivery.extraType === 'WD' || delivery.extraType === 'NB') return '#FF9800';
    if (delivery.runs === 6) return '#673AB7';
    if (delivery.runs === 4) return '#4CAF50';
    if (delivery.runs === 0) return '#9E9E9E';
    return '#2196F3';
};

const getBallLabel = (delivery: Delivery): string => {
    if (delivery.isWicket) return 'W';
    if (delivery.extraType === 'WD') return 'WD';
    if (delivery.extraType === 'NB') return 'NB';
    if (delivery.extraType === 'B') return `${delivery.runs}B`;
    if (delivery.extraType === 'LB') return `${delivery.runs}LB`;
    return delivery.runs.toString();
};

const groupDeliveriesIntoOvers = (deliveries: Delivery[]): Delivery[][] => {
    const overs: Delivery[][] = [];
    let currentOver: Delivery[] = [];
    let validBalls = 0;

    for (const d of deliveries) {
        currentOver.push(d);
        const isValid = d.extraType !== 'WD' && d.extraType !== 'NB';
        if (isValid) validBalls++;
        if (validBalls >= 6) {
            overs.push(currentOver);
            currentOver = [];
            validBalls = 0;
        }
    }
    if (currentOver.length > 0) {
        overs.push(currentOver);
    }
    return overs;
};

const AnimatedBall: React.FC<{ delivery: Delivery; delay: number }> = ({ delivery, delay }) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 4,
                    tension: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }, delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <Animated.View
            style={[
                styles.ballCircle,
                {
                    backgroundColor: getBallColor(delivery),
                    transform: [{ scale: scaleAnim }],
                    opacity: opacityAnim,
                },
            ]}
        >
            <Text style={styles.ballText}>{getBallLabel(delivery)}</Text>
        </Animated.View>
    );
};

export const InningsCompleteModal: React.FC<InningsCompleteModalProps> = ({
    visible,
    deliveries,
    battingTeamName,
    totalRuns,
    totalWickets,
    totalOvers,
    onClose,
}) => {
    const [showCloseButton, setShowCloseButton] = useState(false);

    useEffect(() => {
        if (visible && deliveries.length > 0) {
            const totalDelay = deliveries.length * 200 + 500;
            const timer = setTimeout(() => setShowCloseButton(true), totalDelay);
            return () => clearTimeout(timer);
        } else {
            setShowCloseButton(false);
        }
    }, [visible, deliveries]);

    const overs = groupDeliveriesIntoOvers(deliveries);
    let ballIndex = 0;

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
            <PaperProvider>
                <View style={styles.overlay}>
                    <Surface style={styles.modalContainer} elevation={5}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text variant="headlineSmall" style={styles.headerTitle}>
                                Innings Complete!
                            </Text>
                            <Text variant="displaySmall" style={styles.scoreText}>
                                {battingTeamName}: {totalRuns}/{totalWickets}
                            </Text>
                            <Text variant="bodyMedium" style={styles.oversText}>
                                ({totalOvers} overs)
                            </Text>
                        </View>

                        {/* Ball-by-Ball Animation */}
                        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                            {overs.map((overDeliveries, overIdx) => (
                                <View key={overIdx} style={styles.overContainer}>
                                    <Text variant="labelLarge" style={styles.overLabel}>
                                        Over {overIdx + 1}
                                    </Text>
                                    <View style={styles.overBalls}>
                                        {overDeliveries.map((delivery, idx) => {
                                            const currentBallIndex = ballIndex;
                                            ballIndex++;
                                            return (
                                                <AnimatedBall
                                                    key={`${overIdx}-${idx}`}
                                                    delivery={delivery}
                                                    delay={currentBallIndex * 200}
                                                />
                                            );
                                        })}
                                    </View>
                                </View>
                            ))}
                        </ScrollView>

                        {/* Close Button */}
                        {showCloseButton && (
                            <View style={styles.closeButtonContainer}>
                                <Button
                                    mode="contained"
                                    onPress={onClose}
                                    buttonColor="#e94560"
                                    style={styles.closeButton}
                                    contentStyle={styles.closeButtonContent}
                                >
                                    Continue
                                </Button>
                            </View>
                        )}
                    </Surface>
                </View>
            </PaperProvider>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        maxHeight: '80%',
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
        color: '#e94560',
        marginBottom: 8,
    },
    scoreText: {
        fontWeight: 'bold',
        color: '#fff',
    },
    oversText: {
        color: '#aaa',
        marginTop: 4,
    },
    scrollView: {
        maxHeight: 400,
    },
    scrollContent: {
        padding: 16,
    },
    overContainer: {
        marginBottom: 16,
    },
    overLabel: {
        color: '#e94560',
        marginBottom: 8,
        letterSpacing: 1,
    },
    overBalls: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    ballCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    ballText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    closeButtonContainer: {
        padding: 16,
    },
    closeButton: {
        borderRadius: 12,
    },
    closeButtonContent: {
        paddingVertical: 6,
    },
});
