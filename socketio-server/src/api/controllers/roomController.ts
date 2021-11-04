import {
  ConnectedSocket,
  MessageBody,
  OnMessage,
  SocketController,
  SocketIO,
} from "socket-controllers";
import { Server, Socket } from "socket.io";
import gameRoomIdToRules from '../../db/gameRoomIdToRules';
import gameRoomIdToTimeLimit from "../../db/gameRoomIdToTimeLimit";

enum PlayerColor {
  white = 'white',
  black = 'black',
}
// const timeLengthMs = 600000; // 10 minutes (in milliseconds)

@SocketController()
export class RoomController {
  @OnMessage("join_game")
  public async joinGame(
    @SocketIO() io: Server,
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: any
  ) {
    console.log("New User joining room: ", message);

    // gameRules is defined if a new game is created
    if (message.gameRules) {
      gameRoomIdToRules.set(message.roomId, message.gameRules);
      gameRoomIdToTimeLimit.set(message.roomId, message.gameTimeLimit);
    }

    const connectedSockets = io.sockets.adapter.rooms.get(message.roomId);
    const socketRooms = Array.from(socket.rooms.values()).filter(
      (r) => r !== socket.id
    );

    if (
      socketRooms.length > 0 ||
      (connectedSockets && connectedSockets.size === 2)
    ) {
      socket.emit("room_join_error", {
        error: "Room is full please choose another room to play!",
      });
    } else {
      await socket.join(message.roomId);
      socket.emit("room_joined");

      if (io.sockets.adapter.rooms.get(message.roomId).size === 2) {
        // Simulate coin flip to randomly assign colors to each player
        const { white, black } = PlayerColor;
        const color1 = Math.round(Math.random()) === 0 ? white : black;
        const color2 = color1 === white ? black : white;
        const startTime = Date.now();
        const gameRules = gameRoomIdToRules.get(message.roomId);
        const gameTimeLimit = gameRoomIdToTimeLimit.get(message.roomId);

        socket.emit(
          "start_game",
          { 
            start: true,
            color: color1,
            startTime,
            timeLengthMs: gameTimeLimit,
            gameRules,
          });
        socket
          .to(message.roomId)
          .emit(
            "start_game",
            {
              start: false,
              color: color2,
              startTime,
              timeLengthMs: gameTimeLimit,
              gameRules,
            });
      }
    }
  }
}
