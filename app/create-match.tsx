import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateMatchScreen() {
    const router = useRouter();
    const theme = useTheme();
    const [teamAName, setTeamAName] = useState('');
    const [teamBName, setTeamBName] = useState('');
    const [overs, setOvers] = useState('5');
    const [errors, setErrors] = useState<{ teamA?: string; teamB?: string; overs?: string }>({});

    const handleNext = () => {
        const newErrors: typeof errors = {};
        if (!teamAName.trim()) newErrors.teamA = 'Team A name is required';
        if (!teamBName.trim()) newErrors.teamB = 'Team B name is required';
        const totalOvers = parseInt(overs);
        if (isNaN(totalOvers) || totalOvers <= 0) newErrors.overs = 'Enter valid overs';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        router.push({
            pathname: '/add-players',
            params: {
                teamAName,
                teamBName,
                overs: totalOvers.toString()
            }
        });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text variant="headlineMedium" style={[styles.headerTitle, { color: theme.colors.primary }]}>
                    Create Match
                </Text>

                <TextInput
                    label="Team A Name"
                    placeholder="e.g. Royals"
                    value={teamAName}
                    onChangeText={(text) => { setTeamAName(text); setErrors(e => ({ ...e, teamA: undefined })); }}
                    mode="outlined"
                    style={styles.input}
                    left={<TextInput.Icon icon="shield-half-full" />}
                    error={!!errors.teamA}
                />
                {errors.teamA && <Text variant="bodySmall" style={{ color: theme.colors.error, marginBottom: 8, marginLeft: 8 }}>{errors.teamA}</Text>}

                <TextInput
                    label="Team B Name"
                    placeholder="e.g. Kings"
                    value={teamBName}
                    onChangeText={(text) => { setTeamBName(text); setErrors(e => ({ ...e, teamB: undefined })); }}
                    mode="outlined"
                    style={styles.input}
                    left={<TextInput.Icon icon="shield-half-full" />}
                    error={!!errors.teamB}
                />
                {errors.teamB && <Text variant="bodySmall" style={{ color: theme.colors.error, marginBottom: 8, marginLeft: 8 }}>{errors.teamB}</Text>}

                <TextInput
                    label="Overs per Innings"
                    placeholder="5"
                    value={overs}
                    onChangeText={(text) => { setOvers(text); setErrors(e => ({ ...e, overs: undefined })); }}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.input}
                    left={<TextInput.Icon icon="numeric" />}
                    error={!!errors.overs}
                />
                {errors.overs && <Text variant="bodySmall" style={{ color: theme.colors.error, marginBottom: 8, marginLeft: 8 }}>{errors.overs}</Text>}

                <Button
                    mode="contained"
                    onPress={handleNext}
                    style={styles.primaryButton}
                    contentStyle={styles.buttonContent}
                    icon="arrow-right"
                >
                    Next: Add Players
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
    },
    headerTitle: {
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        marginBottom: 16,
    },
    primaryButton: {
        marginTop: 12,
        borderRadius: 12,
    },
    buttonContent: {
        paddingVertical: 6,
        flexDirection: 'row-reverse',
    },
});
