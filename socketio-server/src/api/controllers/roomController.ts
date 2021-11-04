import {
  ConnectedSocket,
  MessageBody,
  OnMessage,
  SocketController,
  SocketIO,
} from "socket-controllers";
import { Server, Socket } from "socket.io";
import getXrpBalance from '../../xrpl-util/getXrpBalance';
import gameRoomIdToRules from '../../db/gameRoomIdToRules';
import gameRoomIdToTimeLimit from "../../db/gameRoomIdToTimeLimit";
import gameRoomIdToUsernames from "../../db/gameRoomIdToUsernames";
import usernameToColor from "../../db/usernameToColor";

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

    if (!gameRoomIdToUsernames.has(message.roomId)) {
      gameRoomIdToUsernames.set(message.roomId, []);
    }
    //@ts-ignore
    gameRoomIdToUsernames.get(message.roomId).push(message.username);

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

        // Assign color to username map
        const usernames = gameRoomIdToUsernames.get(message.roomId);
        //@ts-ignore
        usernameToColor.set(usernames[0], color1);
        //@ts-ignore
        usernameToColor.set(usernames[1], color2);

        console.log('this feel is too real');
        console.log(usernames);
        console.log(usernameToColor);

        const colorToUsername = {};
        //@ts-ignore
        colorToUsername[color1] = usernames[0];
        //@ts-ignore
        colorToUsername[color2] = usernames[1];

        //@ts-ignore
        const xrpBalance1 = await getXrpBalance(usernames[0]);
        //@ts-ignore
        const xrpBalance2 = await getXrpBalance(usernames[1]);

        const usernameToXrpBalance = {};
        //@ts-ignore
        usernameToXrpBalance[usernames[0]] = await getXrpBalance(usernames[0]);
        //@ts-ignore
        usernameToXrpBalance[usernames[1]] = await getXrpBalance(usernames[1]);

        socket.emit(
          "start_game",
          { 
            start: true,
            color: color2,
            colorToUsername,
            usernameToXrpBalance,
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
              color: color1,
              colorToUsername,
              usernameToXrpBalance,
              startTime,
              timeLengthMs: gameTimeLimit,
              gameRules,
            });
      }
    }
  }
}
