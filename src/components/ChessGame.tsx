import * as ChessJS from 'chess.js';
import { Chessboard } from 'react-chessboard';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'
import './ChessGame.css';
import socketService from '../services/socketService';
import gameService from '../services/gameService';

const Chess = typeof ChessJS === "function" ? ChessJS : ChessJS.Chess;

export interface ChessGameProps {}

export const ChessGame = (props: ChessGameProps) => {
   const [game, setGame] = useState(new Chess());
   const [captured, setCaptured] = useState(
      {w: {p: 0, n: 0, b: 0, r: 0, q: 0},
       b: {p: 0, n: 0, b: 0, r: 0, q: 0}}
   );
   const { state }: any = useLocation<Location>();
   const [playerColor] = useState(state.color);
   const [startTime] = useState(state.startTime);
   const [timeLengthMs] = useState(state.timeLengthMs);

   const handleGameUpdate = () => {
      if (socketService.socket) {
         gameService.onGameUpdate(socketService.socket, (fen) => {
            safeGameMutate((game) => {
               game.load(fen)
            });
         });
      }
   };

   useEffect(() => {
      handleGameUpdate();
   }, []);

   function safeGameMutate(modify) {
      setGame((g) => {
         const update = { ...g };
         modify(update);
         return update;
      });
   }
  
   function makeRandomMove() {
      const possibleMoves = game.moves();
      if (game.game_over() || game.in_draw() || possibleMoves.length === 0) return; // exit if the game is over
      const randomIndex = Math.floor(Math.random() * possibleMoves.length);
      safeGameMutate((game: any) => {
         game.move(possibleMoves[randomIndex]);
      });
   }
  
   function onDrop(sourceSquare, targetSquare) {
      console.log('sourceSquare:', sourceSquare);
      console.log('targetSquare:', targetSquare);
      console.log(game.turn());


      let move = null;
      safeGameMutate((game) => {
         move = game.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q' // always promote to a queen for example simplicity
         });
      });
      if (move === null) return false; // illegal move

      /* Uncomment line below to have the computer play */
      // setTimeout(makeRandomMove, 200);

      // @ts-ignore: Object is possibly 'null'.
      if (move != null && move.captured) {
         // @ts-ignore: Object is possibly 'null'.
         const color = move.color == 'w' ? 'b' : 'w';
         // @ts-ignore: Object is possibly 'null'.
         const piece = move.captured;
         setCaptured((c: any) => {
            const update = {...c};
            update[color][piece]++;
            console.log('captured:', update);
            return update;
         });
      }

      gameService.updateGame(socketService.socket, game.fen());

      return true;
   }

   const onClick = (piece) => {
      console.log(piece);
   };

   return (
      <div className="home">
         <h1>Chess Game</h1>
         <h2 className="description">
            This is a Chess Game component.
         </h2>
         <div>startTime: {(new Date(startTime)).toLocaleDateString()} {(new Date(startTime)).toLocaleTimeString()}</div>
         <div>timeLengthMs: {timeLengthMs}</div>
         <Chessboard
            position={game.fen()}
            onPieceDrop={onDrop}
            onPieceClick={onClick}
            boardOrientation={playerColor}
            />
      </div>
   );
};
