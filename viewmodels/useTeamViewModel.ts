import { useState } from 'react';
import { Player, Team } from '../models/types';
// import uuid from 'react-native-uuid'; // Assuming we might add this, but using Math.random currently

export const useTeamViewModel = () => {
    const [teams, setTeams] = useState<Team[]>([]);

    const createTeam = (name: string) => {
        const newTeam: Team = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            players: [],
        };
        setTeams(prev => [...prev, newTeam]);
        return newTeam;
    };

    const addPlayer = (teamId: string, playerName: string) => {
        setTeams(prev => prev.map(team => {
            if (team.id === teamId) {
                const newPlayer: Player = {
                    id: Math.random().toString(36).substr(2, 9),
                    name: playerName,
                };
                return { ...team, players: [...team.players, newPlayer] };
            }
            return team;
        }));
    };

    const getTeam = (teamId: string) => teams.find(t => t.id === teamId);

    return {
        teams,
        createTeam,
        addPlayer,
        getTeam
    };
};
