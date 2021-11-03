export interface GameRule {
    id: string;
    description: string;
    xrp: number;
};

// Game rules for chess
export const rules: Array<GameRule> = [
    {
        id: 'PAWN_CAPTURE',
        description: 'Pawn capture',
        xrp: 2,
    },
    {
        id: 'BISHOP_CAPTURE',
        description: 'Bishop capture',
        xrp: 4,
    },
    {
        id: 'KNIGHT_CAPTURE',
        description: 'Knight capture',
        xrp: 4,
    },
    {
        id: 'ROOK_CAPTURE',
        description: 'Rook capture',
        xrp: 8,
    },
    {
        id: 'QUEEN_CAPTURE',
        description: 'Queen capture',
        xrp: 20,
    },
    {
        id: 'CHECKMATE',
        description: 'Checkmate',
        xrp: 50,
    },
    {
        id: 'WIN_ON_TIME',
        description: 'Win on time',
        xrp: 40,
    },
    // {
    //     id: 'STALEMATE',
    //     description: 'Stalemate',
    //     xrp: 0,
    // },
    // {
    //     id: 'DRAW',
    //     description: 'Draw',
    //     xrp: 0,
    // },
];
