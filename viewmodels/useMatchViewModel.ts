import { useCallback, useState } from 'react';
import { Delivery, ExtraType, Innings, Match, Team, WicketType } from '../models/types';

export const useMatchViewModel = () => {
    const [match, setMatch] = useState<Match | null>(null);
    const [inningsComplete, setInningsComplete] = useState(false);
    const [inningsDeliveries, setInningsDeliveries] = useState<Delivery[]>([]);

    const startMatch = useCallback((teamA: Team, teamB: Team, totalOvers: number) => {
        const newMatch: Match = {
            id: Date.now().toString(),
            teamA,
            teamB,
            totalOvers,
            currentInningsNumber: 1,
            status: 'InProgress',
            firstInnings: createInnings(teamA.id, teamB.id, teamA.players[0].id, teamA.players[1].id, teamB.players[0].id),
        };
        setMatch(newMatch);
    }, []);

    const createInnings = (battingTeamId: string, bowlingTeamId: string, strikerId: string, nonStrikerId: string, bowlerId: string): Innings => {
        return {
            battingTeamId,
            bowlingTeamId,
            totalRuns: 0,
            totalWickets: 0,
            oversBowled: 0,
            currentOver: {
                overNumber: 1,
                deliveries: [],
                bowlerId,
                validBalls: 0,
            },
            battingStats: {
                [strikerId]: createBatsmanStats(strikerId),
                [nonStrikerId]: createBatsmanStats(nonStrikerId),
            },
            bowlingStats: {
                [bowlerId]: createBowlerStats(bowlerId),
            },
            strikerId,
            nonStrikerId,
            currentBowlerId: bowlerId,
            allOvers: [],
        };
    };

    const createBatsmanStats = (playerId: string) => ({
        playerId,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        isOut: false,
    });

    const createBowlerStats = (playerId: string) => ({
        playerId,
        overs: 0,
        balls: 0,
        runsConceded: 0,
        wickets: 0,
        maidens: 0,
    });

    const getCurrentInnings = useCallback(() => {
        if (!match) return null;
        return match.currentInningsNumber === 1 ? match.firstInnings : match.secondInnings;
    }, [match]);

    const updateInnings = useCallback((updatedInnings: Innings) => {
        setMatch(prev => {
            if (!prev) return null;
            return {
                ...prev,
                [prev.currentInningsNumber === 1 ? 'firstInnings' : 'secondInnings']: updatedInnings,
            };
        });
    }, []);

    const scoreBall = useCallback((runs: number, extraType: ExtraType = 'None', isWicket: boolean = false, wicketType?: WicketType, playerOutId?: string) => {
        const innings = getCurrentInnings();
        if (!innings || !match) return;

        let totalRunsToAdd = runs;
        let extraRuns = 0;
        const isWide = extraType === 'WD';
        const isNoBall = extraType === 'NB';
        const isValidBall = !isWide && !isNoBall;

        if (isWide || isNoBall) {
            extraRuns = 1;
            totalRunsToAdd += 1;
        }

        const newBattingStats = { ...innings.battingStats };
        const newBowlingStats = { ...innings.bowlingStats };

        const striker = { ...newBattingStats[innings.strikerId] };
        const bowler = { ...newBowlingStats[innings.currentBowlerId] };

        // Updating Batsman
        if (isValidBall && extraType !== 'B' && extraType !== 'LB') {
            striker.runs += runs;
            striker.balls += 1;
            if (runs === 4) striker.fours += 1;
            if (runs === 6) striker.sixes += 1;
        } else if (isValidBall) {
            striker.balls += 1;
        }

        // Updating Bowler
        if (isValidBall) {
            bowler.balls += 1;
            if (bowler.balls >= 6) {
                bowler.overs += 1;
                bowler.balls = 0;
            }
        }

        let runsChargedToBowler = runs;
        if (extraType === 'B' || extraType === 'LB') runsChargedToBowler = 0;
        if (isWide || isNoBall) runsChargedToBowler += 1;

        bowler.runsConceded += runsChargedToBowler;

        if (isWicket && wicketType !== 'runout') {
            bowler.wickets += 1;
        }

        newBattingStats[innings.strikerId] = striker;
        newBowlingStats[innings.currentBowlerId] = bowler;

        // Delivery info
        const delivery: Delivery = {
            ballNumber: innings.currentOver.validBalls + (isValidBall ? 1 : 0),
            runs,
            extraType,
            extraRuns,
            isWicket,
            wicketType,
            playerOutId,
            bowlerId: innings.currentBowlerId,
            strikerId: innings.strikerId,
            nonStrikerId: innings.nonStrikerId,
        };

        const updatedOver = {
            ...innings.currentOver,
            deliveries: [...innings.currentOver.deliveries, delivery]
        };

        if (isValidBall) {
            updatedOver.validBalls += 1;
        }

        let newStriker = innings.strikerId;
        let newNonStriker = innings.nonStrikerId;

        if (isWicket && playerOutId) {
            if (newBattingStats[playerOutId]) {
                newBattingStats[playerOutId] = {
                    ...newBattingStats[playerOutId],
                    isOut: true,
                    wicketType,
                    bowlerId: innings.currentBowlerId
                };
            }
        } else {
            if (runs % 2 !== 0) {
                [newStriker, newNonStriker] = [newNonStriker, newStriker];
            }
        }

        const updatedInnings: Innings = {
            ...innings,
            totalRuns: innings.totalRuns + totalRunsToAdd,
            totalWickets: isWicket ? (innings.totalWickets + 1) : innings.totalWickets,
            currentOver: updatedOver,
            strikerId: newStriker,
            nonStrikerId: newNonStriker,
            battingStats: newBattingStats,
            bowlingStats: newBowlingStats,
        };

        if (updatedOver.validBalls >= 6) {
            updatedInnings.allOvers = [...updatedInnings.allOvers, updatedOver];
            [updatedInnings.strikerId, updatedInnings.nonStrikerId] = [updatedInnings.nonStrikerId, updatedInnings.strikerId];

            if (updatedInnings.allOvers.length >= match.totalOvers) {
                const allBalls: Delivery[] = [];
                updatedInnings.allOvers.forEach(over => over.deliveries.forEach(d => allBalls.push(d)));
                setInningsDeliveries(allBalls);
                setInningsComplete(true);
            }

            updatedInnings.currentOver = {
                overNumber: updatedInnings.allOvers.length + 1,
                deliveries: [],
                bowlerId: '',
                validBalls: 0,
            };
        }

        updateInnings(updatedInnings);
    }, [match, getCurrentInnings, updateInnings]);

    const setNewBowler = useCallback((bowlerId: string) => {
        const innings = getCurrentInnings();
        if (!innings) return;
        const newStats = innings.bowlingStats[bowlerId] || createBowlerStats(bowlerId);
        updateInnings({
            ...innings,
            currentBowlerId: bowlerId,
            currentOver: { ...innings.currentOver, bowlerId },
            bowlingStats: { ...innings.bowlingStats, [bowlerId]: newStats }
        });
    }, [getCurrentInnings, updateInnings]);

    const setNewBatsman = useCallback((oldBatsmanId: string, newBatsmanId: string) => {
        const innings = getCurrentInnings();
        if (!innings) return;
        let isStriker = innings.strikerId === oldBatsmanId;
        updateInnings({
            ...innings,
            strikerId: isStriker ? newBatsmanId : innings.strikerId,
            nonStrikerId: isStriker ? innings.nonStrikerId : newBatsmanId,
            battingStats: { ...innings.battingStats, [newBatsmanId]: createBatsmanStats(newBatsmanId) }
        });
    }, [getCurrentInnings, updateInnings]);

    const resetInningsComplete = useCallback(() => {
        setInningsComplete(false);
        setInningsDeliveries([]);
    }, []);

    return {
        match,
        getCurrentInnings,
        startMatch,
        scoreBall,
        setNewBowler,
        setNewBatsman,
        inningsComplete,
        inningsDeliveries,
        resetInningsComplete,
    };
};
