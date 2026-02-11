export type WicketType = 'bowled' | 'caught' | 'lbw' | 'runout' | 'stumped' | 'hitwicket' | 'other';
export type ExtraType = 'WD' | 'NB' | 'B' | 'LB' | 'None';

export interface Player {
    id: string;
    name: string;
}

export interface Team {
    id: string;
    name: string;
    players: Player[];
}

export interface Delivery {
    ballNumber: number; // 1 to 6 (or more for extras)
    runs: number; // Runs scored off the bat or extras
    extraType: ExtraType;
    extraRuns: number; // Runs from the extra itself (e.g., 1 for WD/NB)
    isWicket: boolean;
    wicketType?: WicketType;
    playerOutId?: string;
    bowlerId: string;
    strikerId: string;
    nonStrikerId: string;
}

export interface Over {
    overNumber: number;
    deliveries: Delivery[];
    bowlerId: string;
    validBalls: number; // Count of valid balls to track over completion
}

export interface BatsmanStats {
    playerId: string;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    isOut: boolean;
    wicketType?: WicketType;
    bowlerId?: string; // Who took the wicket
}

export interface BowlerStats {
    playerId: string;
    overs: number; // Completed overs
    balls: number; // Balls in current over
    runsConceded: number;
    wickets: number;
    maidens: number;
}

export interface Innings {
    battingTeamId: string;
    bowlingTeamId: string;
    totalRuns: number;
    totalWickets: number;
    oversBowled: number; // e.g. 5.2
    currentOver: Over;
    battingStats: Record<string, BatsmanStats>;
    bowlingStats: Record<string, BowlerStats>;
    strikerId: string;
    nonStrikerId: string;
    currentBowlerId: string;
    allOvers: Over[];
}

export interface Match {
    id: string;
    teamA: Team;
    teamB: Team;
    totalOvers: number;
    currentInningsNumber: 1 | 2;
    firstInnings?: Innings;
    secondInnings?: Innings;
    status: 'NotStarted' | 'InProgress' | 'Completed';
    winnerId?: string;
    tossWinnerId?: string;
    tossDecision?: 'bat' | 'bowl';
}
