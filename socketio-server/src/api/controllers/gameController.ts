import {
  ConnectedSocket,
  MessageBody,
  OnMessage,
  SocketController,
  SocketIO,
} from 'socket-controllers';
import { Server, Socket } from 'socket.io';
import gameRoomIdToUsernames from '../../db/gameRoomIdToUsernames';
import usernameToColor from '../../db/usernameToColor';
import { rules } from '../../xrp-battle';
import sendXrp from '../../xrpl-util/sendXrp';

@SocketController()
export class GameController {
  @OnMessage('update_game')
  public async updateGame(
    @SocketIO() io: Server,
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: any
  ) {
    const roomId = this.getSocketGameRoom(socket);

    if (message.captured) {
      const captureData = this.getCaptureData(roomId, message.captured);
      // send XRP
      sendXrp(captureData.capturedUsername, captureData.captorUsername, captureData.xrp);
      // send capture updates
      socket.emit('on_game_update', { captureData });
      socket.to(roomId).emit('on_game_update', { captureData });
    }

    socket.to(roomId).emit('on_game_update', message);
  }

  @OnMessage('game_win')
  public async gameWin(
    @SocketIO() io: Server,
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: any
  ) {
    const gameRoom = this.getSocketGameRoom(socket);
    socket.to(gameRoom).emit('on_game_win', message);
  }

  private getSocketGameRoom(socket: Socket): string {
    const socketRooms = Array.from(socket.rooms.values()).filter(
      (r) => r !== socket.id
    );
    const gameRoom = socketRooms && socketRooms[0];

    return gameRoom;
  }

  private getCaptureData(roomId, captured) {
    const usernames = gameRoomIdToUsernames.get(roomId);
    const capturedUsername = //@ts-ignore
      captured.color === usernameToColor.get(usernames[0]) //@ts-ignore
      ? usernames[0] : usernames[1];
    //@ts-ignore
    const captorUsername = capturedUsername === usernames[0] ? usernames[1] : usernames[0];

    const { xrp } = rules.find(rule => rule.id === captured.ruleId);

    return {
      capturedUsername,
      captorUsername,
      xrp,
    };
  }
}
