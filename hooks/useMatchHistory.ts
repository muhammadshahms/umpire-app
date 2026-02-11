import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useState } from 'react';
import { Match, MatchHistoryItem } from '../models/types';

const HISTORY_KEY = 'match_history';

export const useMatchHistory = () => {
    const [history, setHistory] = useState<MatchHistoryItem[]>([]);
    const [loading, setLoading] = useState(false);

    const loadHistory = useCallback(async () => {
        setLoading(true);
        try {
            const data = await AsyncStorage.getItem(HISTORY_KEY);
            const items: MatchHistoryItem[] = data ? JSON.parse(data) : [];
            setHistory(items);
            return items;
        } catch {
            setHistory([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const saveMatch = useCallback(async (match: Match) => {
        try {
            const existing = await AsyncStorage.getItem(HISTORY_KEY);
            const items: MatchHistoryItem[] = existing ? JSON.parse(existing) : [];

            const firstScore = match.firstInnings
                ? `${match.firstInnings.totalRuns}/${match.firstInnings.totalWickets}`
                : '-';
            const secondScore = match.secondInnings
                ? `${match.secondInnings.totalRuns}/${match.secondInnings.totalWickets}`
                : '-';

            const item: MatchHistoryItem = {
                id: match.id,
                date: new Date().toISOString(),
                teamAName: match.teamA.name,
                teamBName: match.teamB.name,
                overs: match.totalOvers,
                firstInningsScore: firstScore,
                secondInningsScore: secondScore,
                result: match.result || 'No result',
                winnerName: match.winnerName,
            };

            items.unshift(item);
            await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(items));
            setHistory(items);
        } catch (e) {
            console.error('Failed to save match history:', e);
        }
    }, []);

    const clearHistory = useCallback(async () => {
        try {
            await AsyncStorage.removeItem(HISTORY_KEY);
            setHistory([]);
        } catch (e) {
            console.error('Failed to clear history:', e);
        }
    }, []);

    return { history, loading, loadHistory, saveMatch, clearHistory };
};
