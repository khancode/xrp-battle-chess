import * as ChessJS from 'chess.js';
import { Chessboard } from 'react-chessboard';
import * as React from 'react';
import { useState } from 'react';
import './ChessGame.css';

const Chess = typeof ChessJS === "function" ? ChessJS : ChessJS.Chess;

export interface ChessGameProps {}

export const ChessGame = (props: ChessGameProps) => {
   const [game, setGame] = useState(new Chess());
   const [captured, setCaptured] = useState(
      {w: {p: 0, n: 0, b: 0, r: 0, q: 0},
       b: {p: 0, n: 0, b: 0, r: 0, q: 0}}
   );

   function safeGameMutate(modify: any) {
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
  
   function onDrop(sourceSquare: any, targetSquare: any) {
      console.log('sourceSquare:', sourceSquare);
      console.log('targetSquare:', targetSquare);
      console.log(game.turn());


      let move = null;
      safeGameMutate((game: any) => {
         move = game.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q' // always promote to a queen for example simplicity
         });
      });
      if (move === null) return false; // illegal move
      setTimeout(makeRandomMove, 200);

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

      return true;
   }

   const onClick = (piece: any) => {
      console.log(piece);
   };

   return (
      <div className="home">
         <h1>Chess Game</h1>
         <h2 className="description">
            This is a Chess Game component.
         </h2>
         <Chessboard position={game.fen()} onPieceDrop={onDrop} onPieceClick={onClick} boardOrientation="white" />
      </div>
   );
};
