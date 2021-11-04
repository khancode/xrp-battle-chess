import * as ChessJS from 'chess.js';
import { Chessboard } from 'react-chessboard';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import './ChessGame.css';
import socketService from '../services/socketService';
import gameService from '../services/gameService';

const Chess = typeof ChessJS === "function" ? ChessJS : ChessJS.Chess;

const Div = styled('div')(({ theme }) => ({
   ...theme.typography.button,
   backgroundColor: theme.palette.background.paper,
   padding: theme.spacing(1),
}));

let timeInterval;

export interface ChessGameProps {}

export const ChessGame = (props: ChessGameProps) => {
   const [game, setGame] = useState(new Chess());
   const [captured, setCaptured] = useState(
      {w: {p: 0, n: 0, b: 0, r: 0, q: 0},
       b: {p: 0, n: 0, b: 0, r: 0, q: 0}}
   );
   const { state }: any = useLocation<Location>();
   const [playerColor] = useState(state.color);
   const [playerTimeRemainingMs, setPlayerTimeRemainingMs] = useState(state.timeLengthMs);
   const [playerClock, setPlayerClock] = useState('');
   const [timeLengthMs] = useState(state.timeLengthMs);

   const [opponentTimeRemainingMs, setOpponentTimeRemainingMs] = useState(state.timeLengthMs);
   const [opponentClock, setOpponentClock] = useState('');

   const handleGameUpdate = () => {
      if (socketService.socket) {
         gameService.onGameUpdate(socketService.socket, (options) => {
            const { fen, updateOpponentTimeRemainingMs } = options;

            if (fen) {
               safeGameMutate((game) => {
                  game.load(fen)
               });

               startPlayerTimer();
            }

            if (updateOpponentTimeRemainingMs) {
               setOpponentTimeRemainingMs(updateOpponentTimeRemainingMs);
               setOpponentClock(formatClock(new Date(updateOpponentTimeRemainingMs)));
            }
         });
      }
   };

   const startPlayerTimer = () => {
      timeInterval = setInterval(() => {
         setPlayerTimeRemainingMs(playerTimeRemainingMs => {
            setPlayerClock(formatClock(new Date(playerTimeRemainingMs - 1000)));

            gameService.updateGame(
               socketService.socket, 
               {
                  updateOpponentTimeRemainingMs: playerTimeRemainingMs - 1000,
               },
            );

            return playerTimeRemainingMs - 1000;
         });

         // TODO: implement case when time runs out
         // if (t.total <= 0) {
         //    stopPlayerTimer();
         // }
      }, 1000);
   };

   const stopPlayerTimer = () => {
      clearInterval(timeInterval);
   }

   useEffect(() => {
      handleGameUpdate();
      initClocks();
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

      // Prevent player from moving any pieces when it's the opponent's turn.
      if (game.turn() !== playerColor.charAt(0)) {
         return;
      }

      let move = null;
      safeGameMutate((game) => {
         move = game.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q' // always promote to a queen for example simplicity
         });
      });
      if (move === null) return false; // illegal move

      stopPlayerTimer();

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

      gameService.updateGame(
         socketService.socket, 
         {
            fen: game.fen(),
         },
      );

      return true;
   }

   const onClick = (piece) => {
      console.log(piece);
   };

   function getTimeRemaining(endtime){
      const total = Date.parse(endtime) - Date.parse(Date());
      const seconds = Math.floor( (total/1000) % 60 );
      const minutes = Math.floor( (total/1000/60) % 60 );
      const hours = Math.floor( (total/(1000*60*60)) % 24 );
      const days = Math.floor( total/(1000*60*60*24) );
      
      return {
         total,
         days,
         hours,
         minutes,
         seconds
      };
   }

   function initClocks() {
      const endDate = new Date(timeLengthMs);
      const clockText = formatClock(endDate);
      setPlayerClock(clockText);
      setOpponentClock(clockText);

      if (playerColor === 'white') {
         startPlayerTimer();
      }
   }

   function formatClock(date) {
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      return `${minutes}:${(seconds < 10 ? '0' : '') + seconds}`;
   }

   return (
      <div className="home">
         <h1>Chess Game</h1>
         <h2 className="description">
            This is a Chess Game component.
         </h2>
         {/* <div>lastUpdateTime: {lastUpdateTimeFormatted()} {(new Date(lastUpdateTime)).toLocaleTimeString()}</div> */}
         {/* <div>timeLengthMs: {timeLengthMs}</div> */}
         <Div>Opponent Clock {opponentClock}</Div>
         <Chessboard
            position={game.fen()}
            onPieceDrop={onDrop}
            onPieceClick={onClick}
            boardOrientation={playerColor}
            />
         <Div>Player Clock {playerClock}</Div>
      </div>
   );
};
