import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, List, ListItem, ListItemAvatar, ListItemText, TextField } from '@mui/material';
import axios from 'axios';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import socketService from '../services/socketService';
import './GameList.css';
import gameService from '../services/gameService';

export interface GameListProps {}

export interface GameRule {
    id: string;
    description: string;
    xrp: string;
};

export const GameList = (props: GameListProps) => {
    const [gameName, setGameName] = useState('');
    const [rooms, setRooms] = useState([]);
    const [gameRules, setGameRules] = useState<Array<GameRule>>();
    const [createGameDialog, setCreateGameDialog] = useState(false);
    const [waitForGameDialog, setWaitForGameDialog] = useState(false);
    const history = useHistory();

    const getAllRooms = async () => {
        const response = await axios.get('http://localhost:3000/rooms');
        setRooms(response.data);
    };

    const getGameRules = async () => {
        const response = await axios.get('http://localhost:3000/xrpbattle/rules');
        console.log(response.data);
        setGameRules(response.data);
    }

    useEffect(() => {
        getAllRooms();
        getGameRules();
    }, []);

    const handleGameStart = () => {
        if (socketService.socket) {
            gameService.onStartGame(socketService.socket, (options) => {
                console.log('options: ', { options });
                setWaitForGameDialog(false);
                history.push('/game', options)
            });
        }
    };

    const showRooms = () => {
        return (
            <List dense={false}>
                {rooms.map((room) => (
                    <ListItem
                        key={room}
                        secondaryAction={
                            <Button variant="contained" onClick={() => joinRoom(room)}>
                                Join Game
                            </Button>
                        }
                    >
                        <ListItemAvatar>
                            <Avatar>
                                <AutoAwesomeOutlinedIcon />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={`Room Name: ${room}`}
                            secondary={false ? 'Secondary text' : null}
                        />
                    </ListItem>
                ))}
            </List>
        );
    };

    const onGameNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault()
        setGameName(event.target.value)
    };

    const toggleCreateGameDialog = () => {
        setCreateGameDialog(!createGameDialog)
    };

    const onGameRuleChange = (event, ruleId) => {
        const xrpChange = event.target.value;
        
        setGameRules(rules => {
            const updatedRules = [...rules];
            updatedRules.forEach(rule => {
                if (rule.id === ruleId) {
                    rule.xrp = xrpChange;
                }
            })
            return updatedRules;
        });
    };

    const renderGameRules = () => {
        if (!gameRules) return;

        return (
            <div className="game-rules-form">
                {gameRules.map(rule => {
                    return (
                        <div key={rule.id} className="game-rule-input-group">
                            <div className="game-rule-description">{rule.description}</div>
                            <TextField
                                id="outlined-number"
                                required
                                label="XRP"
                                type="number"
                                value={rule.xrp}
                                onChange={(event) => onGameRuleChange(event, rule.id)}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        );
    }

    const createRoom = async(event) => {
        event.preventDefault();
        if (!gameName.length) {
            return;
        }

        joinRoom(gameName, true);

        setWaitForGameDialog(true);
    };

    const joinRoom = async(gameName, isGameCreator=false) => {
        const joined = await gameService
            .joinGameRoom(
                socketService.socket,
                gameName,
                isGameCreator ? gameRules : null,
            ).catch((err) => {
                alert(err);
            });
        
        handleGameStart();
    };

    return (
        <div className="game-list">
            <h1>All Rooms</h1>
            <h2 className="description">
                Join a game or create one.
            </h2>
            <Button
                variant="outlined"
                onClick={toggleCreateGameDialog}
            >
                Create a Game Room
            </Button>

            {showRooms()}

            <Dialog
                fullWidth={true}
                maxWidth="sm"
                open={createGameDialog}
            >
                <DialogTitle>
                    Create a new game
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Specify rules for the game.
                    </DialogContentText>
                    <form className="create-game-form" onSubmit={createRoom}>
                        <TextField
                            id="outlined-basic"
                            required
                            label="Game Name"
                            variant="outlined"
                            value={gameName}
                            onChange={onGameNameChange}
                            disabled={false}
                        />
                        {renderGameRules()}
                    </form>
                    <DialogActions>
                        <Button onClick={toggleCreateGameDialog}>Cancel</Button>
                        <Button variant="contained" onClick={createRoom}>Create Game</Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>

            <Dialog open={waitForGameDialog}>
                <DialogTitle>
                    Waiting for a player to join your game...
                </DialogTitle>
            </Dialog>
        </div>
    );
};
