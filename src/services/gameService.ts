import { Socket } from 'socket.io-client';
import { GameRule } from '../components/GameList';
// import { IPlayMatrix, IStartGame } from '../../components/game';

class GameService {
    public async joinGameRoom(socket: Socket, roomId: string, username: string, gameTimeLimit = null, gameRules: Array<GameRule> = null): Promise<boolean> {
        return new Promise((rs, rj) => {
            socket.emit(
                'join_game',
                {
                    roomId,
                    username,
                    gameTimeLimit,
                    gameRules,
                },
            );
            socket.on('room_joined', () => rs(true));
            socket.on('room_join_error', ({ error }) => rj(error));
        });
    }

    public async updateGame(socket: Socket, options) {
        socket.emit('update_game', options);
    }

    public async onGameUpdate(
        socket: Socket,
        listener: (options) => void
    ) {
        socket.on('on_game_update', (options) => listener(options));
    }

    public async onStartGame(
        socket: Socket,
        listener: (options) => void
    ) {
        socket.on('start_game', listener);
    }

//   public async gameWin(socket: Socket, message: string) {
//     socket.emit('game_win', { message });
//   }

//   public async onGameWin(socket: Socket, listiner: (message: string) => void) {
//     socket.on('on_game_win', ({ message }) => listiner(message));
//   }
}

export default new GameService();
