import { useCallback, useState } from 'react';
import { Delivery, ExtraType, Innings, Match, Team, WicketType } from '../models/types';

export const useMatchViewModel = () => {
    const [match, setMatch] = useState<Match | null>(null);
    const [inningsComplete, setInningsComplete] = useState(false);
    const [inningsDeliveries, setInningsDeliveries] = useState<Delivery[]>([]);
    const [needsBowlerSelection, setNeedsBowlerSelection] = useState(false);
    const [lastBowlerId, setLastBowlerId] = useState<string | undefined>(undefined);
    const [matchResult, setMatchResult] = useState<{ result: string; winnerName?: string } | null>(null);
    const [previousSnapshot, setPreviousSnapshot] = useState<{ innings: Innings; matchState: Match } | null>(null);

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

    const checkMatchResult = useCallback((updatedInnings: Innings, currentMatch: Match) => {
        if (currentMatch.currentInningsNumber !== 2 || !currentMatch.firstInnings) return null;

        const target = currentMatch.firstInnings.totalRuns + 1;
        const battingTeam = updatedInnings.battingTeamId === currentMatch.teamA.id ? currentMatch.teamA : currentMatch.teamB;
        const bowlingTeam = updatedInnings.bowlingTeamId === currentMatch.teamA.id ? currentMatch.teamA : currentMatch.teamB;

        // Chasing team reached target
        if (updatedInnings.totalRuns >= target) {
            const wicketsRemaining = battingTeam.players.length - 1 - updatedInnings.totalWickets;
            return {
                winnerId: battingTeam.id,
                winnerName: battingTeam.name,
                result: `${battingTeam.name} won by ${wicketsRemaining} wicket${wicketsRemaining !== 1 ? 's' : ''}`,
            };
        }

        // All out
        const allOut = updatedInnings.totalWickets >= battingTeam.players.length - 1;
        // All overs done
        const oversComplete = updatedInnings.allOvers.length >= currentMatch.totalOvers;

        if (allOut || oversComplete) {
            if (updatedInnings.totalRuns === currentMatch.firstInnings.totalRuns) {
                return {
                    result: 'Match Tied!',
                };
            } else {
                const runDiff = currentMatch.firstInnings.totalRuns - updatedInnings.totalRuns;
                return {
                    winnerId: bowlingTeam.id,
                    winnerName: bowlingTeam.name,
                    result: `${bowlingTeam.name} won by ${runDiff} run${runDiff !== 1 ? 's' : ''}`,
                };
            }
        }

        return null;
    }, []);

    const scoreBall = useCallback((runs: number, extraType: ExtraType = 'None', isWicket: boolean = false, wicketType?: WicketType, playerOutId?: string) => {
        const innings = getCurrentInnings();
        if (!innings || !match) return;

        // Save snapshot for undo (deep copy)
        setPreviousSnapshot({
            innings: JSON.parse(JSON.stringify(innings)),
            matchState: JSON.parse(JSON.stringify(match)),
        });

        let totalRunsToAdd = runs;
        let extraRuns = 0;
        const isWide = extraType === 'WD';
        const isNoBall = extraType === 'NB';
        const isBye = extraType === 'B';
        const isLegBye = extraType === 'LB';
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
        if (isValidBall && !isBye && !isLegBye) {
            striker.runs += runs;
            striker.balls += 1;
            if (runs === 4) striker.fours += 1;
            if (runs === 6) striker.sixes += 1;
        } else if (isValidBall) {
            // Bye or Leg Bye — count the ball but NOT runs for batsman
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
        if (isBye || isLegBye) runsChargedToBowler = 0;
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

        // Check if over is complete
        if (updatedOver.validBalls >= 6) {
            updatedInnings.allOvers = [...updatedInnings.allOvers, updatedOver];

            // Switch strike at end of over
            [updatedInnings.strikerId, updatedInnings.nonStrikerId] = [updatedInnings.nonStrikerId, updatedInnings.strikerId];

            // Check if innings is complete (all overs bowled)
            if (updatedInnings.allOvers.length >= match.totalOvers) {
                const allBalls: Delivery[] = [];
                updatedInnings.allOvers.forEach(over => over.deliveries.forEach(d => allBalls.push(d)));
                setInningsDeliveries(allBalls);

                // Check for match result in 2nd innings
                const result = checkMatchResult(updatedInnings, match);
                if (result) {
                    updateInnings(updatedInnings);
                    setMatch(prev => {
                        if (!prev) return null;
                        return {
                            ...prev,
                            [prev.currentInningsNumber === 1 ? 'firstInnings' : 'secondInnings']: updatedInnings,
                            status: 'Completed',
                            winnerId: result.winnerId,
                            winnerName: result.winnerName,
                            result: result.result,
                        };
                    });
                    setMatchResult(result);
                    return;
                }

                setInningsComplete(true);
                updateInnings(updatedInnings);
                return;
            }

            // Over complete but innings not done — need new bowler
            setLastBowlerId(innings.currentBowlerId);
            updatedInnings.currentOver = {
                overNumber: updatedInnings.allOvers.length + 1,
                deliveries: [],
                bowlerId: '',
                validBalls: 0,
            };

            updateInnings(updatedInnings);
            setNeedsBowlerSelection(true);
            return;
        }

        // Check for match result mid-over (target reached in 2nd innings)
        if (match.currentInningsNumber === 2) {
            const result = checkMatchResult(updatedInnings, match);
            if (result) {
                setMatch(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        [prev.currentInningsNumber === 1 ? 'firstInnings' : 'secondInnings']: updatedInnings,
                        status: 'Completed',
                        winnerId: result.winnerId,
                        winnerName: result.winnerName,
                        result: result.result,
                    };
                });
                setMatchResult(result);
                return;
            }
        }

        // Check all out
        if (match) {
            const battingTeam = updatedInnings.battingTeamId === match.teamA.id ? match.teamA : match.teamB;
            if (updatedInnings.totalWickets >= battingTeam.players.length - 1) {
                // All out
                const allBalls: Delivery[] = [];
                updatedInnings.allOvers.forEach(over => over.deliveries.forEach(d => allBalls.push(d)));
                updatedOver.deliveries.forEach(d => allBalls.push(d));
                setInningsDeliveries(allBalls);

                if (match.currentInningsNumber === 2) {
                    const result = checkMatchResult(updatedInnings, match);
                    if (result) {
                        setMatch(prev => {
                            if (!prev) return null;
                            return {
                                ...prev,
                                secondInnings: updatedInnings,
                                status: 'Completed',
                                winnerId: result.winnerId,
                                winnerName: result.winnerName,
                                result: result.result,
                            };
                        });
                        setMatchResult(result);
                        return;
                    }
                }

                setInningsComplete(true);
                updateInnings(updatedInnings);
                return;
            }
        }

        updateInnings(updatedInnings);
    }, [match, getCurrentInnings, updateInnings, checkMatchResult]);

    const confirmNewBowler = useCallback((bowlerId: string) => {
        const innings = getCurrentInnings();
        if (!innings) return;
        const newStats = innings.bowlingStats[bowlerId] || createBowlerStats(bowlerId);
        updateInnings({
            ...innings,
            currentBowlerId: bowlerId,
            currentOver: { ...innings.currentOver, bowlerId },
            bowlingStats: { ...innings.bowlingStats, [bowlerId]: newStats }
        });
        setNeedsBowlerSelection(false);
    }, [getCurrentInnings, updateInnings]);

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

    const startSecondInnings = useCallback(() => {
        if (!match) return;
        setInningsComplete(false);
        setInningsDeliveries([]);

        // Swap: team that was bowling now bats
        const newBattingTeam = match.firstInnings!.bowlingTeamId === match.teamA.id ? match.teamA : match.teamB;
        const newBowlingTeam = match.firstInnings!.battingTeamId === match.teamA.id ? match.teamA : match.teamB;

        const secondInnings = createInnings(
            newBattingTeam.id,
            newBowlingTeam.id,
            newBattingTeam.players[0].id,
            newBattingTeam.players[1].id,
            newBowlingTeam.players[0].id
        );

        setMatch(prev => {
            if (!prev) return null;
            return {
                ...prev,
                currentInningsNumber: 2,
                secondInnings,
            };
        });
    }, [match]);

    const resetInningsComplete = useCallback(() => {
        setInningsComplete(false);
        setInningsDeliveries([]);
    }, []);

    const undoLastBall = useCallback(() => {
        if (!previousSnapshot) return;
        setMatch(previousSnapshot.matchState);
        setNeedsBowlerSelection(false);
        setInningsComplete(false);
        setMatchResult(null);
        setPreviousSnapshot(null);
    }, [previousSnapshot]);

    const canUndo = !!previousSnapshot;

    return {
        match,
        getCurrentInnings,
        startMatch,
        scoreBall,
        setNewBowler,
        setNewBatsman,
        confirmNewBowler,
        inningsComplete,
        inningsDeliveries,
        resetInningsComplete,
        needsBowlerSelection,
        lastBowlerId,
        startSecondInnings,
        matchResult,
        undoLastBall,
        canUndo,
    };
};
