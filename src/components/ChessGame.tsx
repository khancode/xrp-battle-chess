import * as ChessJS from 'chess.js';
import { Chessboard } from 'react-chessboard';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloseIcon from '@mui/icons-material/Close';
import './ChessGame.css';
import socketService from '../services/socketService';
import gameService from '../services/gameService';
import { Alert, Collapse, IconButton, Typography } from '@mui/material';
import axios from 'axios';

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
      {white: {p: 0, n: 0, b: 0, r: 0, q: 0},
       black: {p: 0, n: 0, b: 0, r: 0, q: 0}}
   );
   const { state }: any = useLocation<Location>();
   const [gameRules] = useState(state.gameRules);
   const [playerColor] = useState(state.color);
   const [username] = useState(state.colorToUsername[state.color]);
   const [playerXrpBalance, setPlayerXrpBalance] = useState(state.usernameToXrpBalance[username]);
   const [opponentUsername] = useState(state.colorToUsername[state.color === 'white' ? 'black' : 'white']);
   const [opponentXrpBalance, setOpponentXrpBalance] = useState(state.usernameToXrpBalance[opponentUsername])
   const [playerTimeRemainingMs, setPlayerTimeRemainingMs] = useState(state.timeLengthMs);
   const [playerClock, setPlayerClock] = useState('');
   const [timeLengthMs] = useState(state.timeLengthMs);
   const [xrpAlertMessage, setXrpAlertMessage] = useState('');
   const [xrpAlertSeverity, setXrpAlertSeverity] = useState('');
   const [showXrpAlert, setShowXrpAlert] = useState(false);

   const [opponentTimeRemainingMs, setOpponentTimeRemainingMs] = useState(state.timeLengthMs);
   const [opponentClock, setOpponentClock] = useState('');

   const handleGameUpdate = () => {
      if (socketService.socket) {
         gameService.onGameUpdate(socketService.socket, (options) => {
            const { fen, updateOpponentTimeRemainingMs, captureData } = options;

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

            if (captureData) {
               console.log('dat captureData bro!:', captureData);
               if (captureData.capturedUsername === username) {
                  setXrpAlertMessage(`You lost ${captureData.xrp} XRP! :o`);
                  setXrpAlertSeverity('error');
               } else {
                  setXrpAlertMessage(`Woohoo! You won ${captureData.xrp} XRP! :D`);
                  setXrpAlertSeverity('success');
               }
               setShowXrpAlert(true);
               setTimeout(() => {
                  setShowXrpAlert(false);
               }, 20000);

               fetchXrpBalances();
            }
         });
      }
   };

   const fetchXrpBalances = async () => {
      setPlayerXrpBalance('updating...');
      setOpponentXrpBalance('updating...');
      fetchPlayerXrp();
      fetchOpponentXrp();
   }

   const fetchPlayerXrp = () => {
      setTimeout(async () => {
         const response = await axios.post(
            `http://localhost:3000/getXrpBalance`,
            { username },
         );
         if (response.data.xrpBalance  === playerXrpBalance) {
            // Retry request if xrpBalance didn't update
            fetchPlayerXrp();
         } else {
            setPlayerXrpBalance(response.data.xrpBalance);
         }
      }, 8000);
   };

   const fetchOpponentXrp = () => {
      setTimeout(async () => {
         const response = await axios.post(
            `http://localhost:3000/getXrpBalance`,
            { username: opponentUsername },
         );
         if (response.data.xrpBalance  === opponentXrpBalance) {
            // Retry request if xrpBalance didn't update
            fetchOpponentXrp();
         } else {
            setOpponentXrpBalance(response.data.xrpBalance);
         }
      }, 8000);
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


      let captured = null;
      // @ts-ignore: Object is possibly 'null'.
      if (move != null && move.captured) {
         // @ts-ignore: Object is possibly 'null'.
         const color = move.color == 'w' ? 'black' : 'white';
         // @ts-ignore: Object is possibly 'null'.
         const piece = move.captured;

         captured = {
            color,
            ruleId: getCaptureRuleId(piece)
         };

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
            captured,
         },
      );

      return true;
   }

   const getCaptureRuleId = (piece) => {
      switch (piece) {
         case 'p':
            return 'PAWN_CAPTURE';
         case 'b':
            return 'BISHOP_CAPTURE';
         case 'n':
            return 'KNIGHT_CAPTURE';
         case 'r':
            return 'ROOK_CAPTURE';
         case 'q':
            return 'QUEEN_CAPTURE';
      }
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

   const getTurnClassName = (color) => {
      return game.turn() === color.charAt(0) ? 'player-turn' : 'standby-turn';
   }

   return (
      <div className="game">
         <h1>XRP Battle</h1>
         <h2 className="description">
            {username} vs. {opponentUsername}
         </h2>
         <Div className={`player-data ${getTurnClassName(playerColor === 'white' ? 'black' : 'white')}`}>
            <Typography variant="h6" className="player-data-item xrp-balance">XRP: {opponentXrpBalance}</Typography>
            <Typography variant="h6" className="player-data-item">{opponentUsername}</Typography>
            <Typography variant="h6" className="player-data-item clock-group"><AccessTimeIcon className="clock-icon" fontSize="inherit" />{opponentClock}</Typography>
         </Div>
         <Chessboard
            position={game.fen()}
            onPieceDrop={onDrop}
            onPieceClick={onClick}
            boardOrientation={playerColor}
            />
         <Div className={`player-data ${getTurnClassName(playerColor)}`}>
            <Typography variant="h6" className="player-data-item xrp-balance">XRP: {playerXrpBalance}</Typography>
            <Typography variant="h6" className="player-data-item">{username}</Typography>
            <Typography variant="h6" className="player-data-item clock-group"><AccessTimeIcon className="clock-icon" fontSize="inherit" />{playerClock}</Typography>
         </Div>
         <Collapse in={showXrpAlert}>
            <Alert
               icon={false}
               severity={xrpAlertSeverity === 'success' ? 'success' : 'error'}
               action={
                  <IconButton
                     aria-label="close"
                     color="inherit"
                     size="small"
                     onClick={() => setShowXrpAlert(false)}
                  >
                     <CloseIcon fontSize="inherit" />
                  </IconButton>
               }
               sx={{ mb: 2 }}
            >
               {xrpAlertMessage}
            </Alert>
         </Collapse>
      </div>
   );
};
