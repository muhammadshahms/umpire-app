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
            // 1. Save summary to history list
            const existing = await AsyncStorage.getItem(HISTORY_KEY);
            const items: MatchHistoryItem[] = existing ? JSON.parse(existing) : [];

            const firstScore = match.firstInnings
                ? `${match.firstInnings.totalRuns}/${match.firstInnings.totalWickets}`
                : '-';
            const secondScore = match.secondInnings
                ? `${match.secondInnings.totalRuns}/${match.secondInnings.totalWickets}`
                : '-';

            // Check if update or new
            const existingIndex = items.findIndex(i => i.id === match.id);

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

            if (existingIndex >= 0) {
                items[existingIndex] = item;
            } else {
                items.unshift(item);
            }

            await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(items));
            setHistory(items);

            // 2. Save FULL match details to separate key
            await AsyncStorage.setItem(`match_${match.id}`, JSON.stringify(match));

        } catch (e) {
            console.error('Failed to save match history:', e);
        }
    }, []);

    const getMatchDetails = useCallback(async (id: string): Promise<Match | null> => {
        try {
            const data = await AsyncStorage.getItem(`match_${id}`);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Failed to load match details:', e);
            return null;
        }
    }, []);

    const clearHistory = useCallback(async () => {
        try {
            // Ideally we should delete all match_ keys too, but for now clearing the list is enough to hide them
            // A more robust app would track all keys or use a collection pattern
            const keys = await AsyncStorage.getAllKeys();
            const matchKeys = keys.filter(k => k.startsWith('match_') || k === HISTORY_KEY);
            await AsyncStorage.multiRemove(matchKeys);
            setHistory([]);
        } catch (e) {
            console.error('Failed to clear history:', e);
        }
    }, []);

    return { history, loading, loadHistory, saveMatch, getMatchDetails, clearHistory };
};
