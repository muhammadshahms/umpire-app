import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, Portal, RadioButton, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { Player, WicketType } from '../models/types';

interface WicketTypeDialogProps {
    visible: boolean;
    onDismiss: () => void;
    onConfirm: (wicketType: WicketType, playerOutId: string, fielderName?: string) => void;
    striker: Player;
    nonStriker: Player;
}

export const WicketTypeDialog: React.FC<WicketTypeDialogProps> = ({
    visible,
    onDismiss,
    onConfirm,
    striker,
    nonStriker,
}) => {
    const [wicketType, setWicketType] = useState<WicketType>('caught');
    const [selectedPlayerId, setSelectedPlayerId] = useState<string>(striker.id);
    const [fielderName, setFielderName] = useState('');

    useEffect(() => {
        if (visible) {
            setSelectedPlayerId(striker.id);
            setWicketType('caught');
            setFielderName('');
        }
    }, [visible, striker]);

    const handleConfirm = () => {
        onConfirm(wicketType, selectedPlayerId, fielderName);
    };

    const isFielderRequired = wicketType === 'caught' || wicketType === 'runout' || wicketType === 'stumped';

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss}>
                <Dialog.Title>Wicket Details ☝️</Dialog.Title>
                <Dialog.ScrollArea style={styles.scrollArea}>
                    <ScrollView contentContainerStyle={styles.content}>
                        <Text variant="titleSmall" style={styles.sectionTitle}>Who is OUT?</Text>
                        <SegmentedButtons
                            value={selectedPlayerId}
                            onValueChange={setSelectedPlayerId}
                            buttons={[
                                { value: striker.id, label: `${striker.name} (Str)` },
                                { value: nonStriker.id, label: nonStriker.name },
                            ]}
                            style={styles.segmentedBtn}
                        />

                        <Text variant="titleSmall" style={styles.sectionTitle}>How?</Text>
                        <RadioButton.Group onValueChange={val => setWicketType(val as WicketType)} value={wicketType}>
                            <View style={styles.radioRow}>
                                <RadioButton.Item label="Caught" value="caught" style={styles.radioItem} />
                                <RadioButton.Item label="Bowled" value="bowled" style={styles.radioItem} />
                            </View>
                            <View style={styles.radioRow}>
                                <RadioButton.Item label="LBW" value="lbw" style={styles.radioItem} />
                                <RadioButton.Item label="Run Out" value="runout" style={styles.radioItem} />
                            </View>
                            <View style={styles.radioRow}>
                                <RadioButton.Item label="Stumped" value="stumped" style={styles.radioItem} />
                                <RadioButton.Item label="Hit Wicket" value="hitwicket" style={styles.radioItem} />
                            </View>
                            <View style={styles.radioRow}>
                                <RadioButton.Item label="Other" value="other" style={styles.radioItem} />
                            </View>
                        </RadioButton.Group>

                        {isFielderRequired && (
                            <View style={styles.inputContainer}>
                                <TextInput
                                    label={wicketType === 'runout' ? "Fielder Name (Optional)" : "Fielder Name"}
                                    value={fielderName}
                                    onChangeText={setFielderName}
                                    mode="outlined"
                                    placeholder="Enter fielder's name"
                                />
                            </View>
                        )}
                    </ScrollView>
                </Dialog.ScrollArea>
                <Dialog.Actions>
                    <Button onPress={onDismiss}>Cancel</Button>
                    <Button mode="contained" onPress={handleConfirm} buttonColor="#F44336">
                        Confirm Wicket
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

const styles = StyleSheet.create({
    scrollArea: {
        maxHeight: 400,
        paddingHorizontal: 0,
    },
    content: {
        paddingHorizontal: 24,
        paddingBottom: 10,
    },
    sectionTitle: {
        marginTop: 15,
        marginBottom: 8,
        fontWeight: 'bold',
    },
    segmentedBtn: {
        marginBottom: 5,
    },
    radioRow: {
        flexDirection: 'row',
        // justifyContent: 'space-between',
    },
    radioItem: {
        flex: 1,
        paddingVertical: 4,
    },
    inputContainer: {
        marginTop: 10,
    },
});
