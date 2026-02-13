import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import { WagonWheelData } from '../models/types';
import { WagonWheel } from './WagonWheel';

interface WagonWheelDialogProps {
    visible: boolean;
    onDismiss: () => void;
    onConfirm: (data: WagonWheelData | undefined) => void;
    runs: number;
}

export const WagonWheelDialog: React.FC<WagonWheelDialogProps> = ({
    visible,
    onDismiss,
    onConfirm,
    runs,
}) => {
    const [selectedShot, setSelectedShot] = useState<WagonWheelData | null>(null);

    const handleConfirm = () => {
        if (selectedShot) {
            onConfirm(selectedShot);
            setSelectedShot(null); // Reset for next time
        } else {
            // Allow confirming without data if they want to skip?
            onConfirm(undefined);
        }
    };

    const handleSkip = () => {
        onConfirm(undefined);
        setSelectedShot(null);
    };

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
                <Dialog.Title style={styles.title}>
                    Target {runs} Runs 🎯
                </Dialog.Title>
                <Dialog.Content>
                    <Text variant="bodyMedium" style={styles.instruction}>
                        Where was the shot played? (Tap on ground)
                    </Text>
                    <View style={styles.wheelContainer}>
                        <WagonWheel
                            size={280}
                            onSelect={setSelectedShot}
                            shots={selectedShot ? [{ ...selectedShot, runs }] : []}
                        />
                    </View>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={handleSkip}>Skip</Button>
                    <Button
                        mode="contained"
                        onPress={handleConfirm}
                        disabled={!selectedShot}
                    >
                        Confirm
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

const styles = StyleSheet.create({
    dialog: {
        maxHeight: '90%',
    },
    title: {
        textAlign: 'center',
    },
    instruction: {
        textAlign: 'center',
        marginBottom: 10,
        color: '#666',
    },
    wheelContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
});
