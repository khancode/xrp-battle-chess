import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, List, ListItem, ListItemAvatar, ListItemText, TextField } from '@mui/material';
import axios from 'axios';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import socketService from '../services/socketService';
import './GameList.css';
import gameService from '../services/gameService';

export interface GameListProps {
    username: string;
}

export interface GameRule {
    id: string;
    description: string;
    xrp: string;
};

export const GameList = (props: GameListProps) => {
    const [gameName, setGameName] = useState('');
    const [gameTimeLimit, setGameTimeLimit] = useState('5'); // 5 minute default
    const [games, setGames] = useState([]);
    const [gameRules, setGameRules] = useState<Array<GameRule>>();
    const [createGameDialog, setCreateGameDialog] = useState(false);
    const [waitForGameDialog, setWaitForGameDialog] = useState(false);
    const [viewGameRulesDialog, setViewGameRulesDialog] = useState(false);
    const [gameSelected, setGameSelected] = useState(null);
    const history = useHistory();

    const getAllGames = async () => {
        const response = await axios.get('http://localhost:3000/xrpbattle/games');
        setGames(response.data);
    };

    const getGameRules = async () => {
        const response = await axios.get('http://localhost:3000/xrpbattle/rules');
        setGameRules(response.data);
    }

    useEffect(() => {
        getAllGames();
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

    const onViewRules = (game) => {
        setGameSelected(game);
        toggleViewGameRulesDialog();
    }

    const showGames = () => {
        return (
            <List dense={false}>
                {games.map((game) => (
                    <ListItem
                        key={game.roomId}
                        secondaryAction={
                            <Button variant="contained" onClick={() => onViewRules(game)}>
                                View Rules
                            </Button>
                        }
                    >
                        <ListItemAvatar>
                            <Avatar>
                                <AutoAwesomeOutlinedIcon />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={`Game Name: ${game.roomId}`}
                            secondary={false ? 'Secondary text' : null}
                        />
                    </ListItem>
                ))}
            </List>
        );
    };

    const toggleViewGameRulesDialog = () => {
        setViewGameRulesDialog(!viewGameRulesDialog);
    }

    const onGameNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault()
        setGameName(event.target.value)
    };

    const onGameTimeLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault()
        setGameTimeLimit(event.target.value)
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

    const renderGameRules = (rules) => {
        if (!rules) return;

        return (
            <div className="game-rules-form">
                {rules.map(rule => {
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

        joinRoom(gameName, props.username, gameTimeLimit, true);

        setWaitForGameDialog(true);
    };

    const joinRoom = async(gameName, username, gameTimeLimit, isGameCreator=false) => {
        const joined = await gameService
            .joinGameRoom(
                socketService.socket,
                gameName,
                username,
                isGameCreator ? convertMinutesToMilliseconds(gameTimeLimit) : null,
                isGameCreator ? gameRules : null,
            ).catch((err) => {
                alert(err);
            });
        
        handleGameStart();
    };

    const convertMinutesToMilliseconds = (minutes) => {
        return minutes * 60000;
    }

    const convertMillisecondsToMinutes = (milliseconds) => {
        return milliseconds / 60000;
    }

    return (
        <div className="game-list">
            <h1>All Games</h1>
            <h2 className="description">
                Join a game or create one.
            </h2>
            <Button
                variant="outlined"
                onClick={toggleCreateGameDialog}
            >
                Create a Game Room
            </Button>

            {showGames()}

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
                        <TextField
                            id="outlined-basic"
                            required
                            type="number"
                            label="Time Limit (minutes)"
                            variant="outlined"
                            value={gameTimeLimit}
                            onChange={onGameTimeLimitChange}
                            disabled={false}
                        />
                        {renderGameRules(gameRules)}
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

            {
                gameSelected &&
                <Dialog
                    fullWidth={true}
                    maxWidth="sm"
                    open={viewGameRulesDialog}
                >
                    <DialogTitle>
                        Game Rules
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            These are the rules for this game.
                        </DialogContentText>
                        <form className="create-game-form" onSubmit={createRoom}>
                            <TextField
                                id="outlined-basic"
                                required
                                label="Game Name"
                                variant="outlined"
                                value={gameSelected.roomId}
                                onChange={onGameNameChange}
                                disabled={false}
                            />
                            <TextField
                                id="outlined-basic"
                                required
                                type="number"
                                label="Time Limit (minutes)"
                                variant="outlined"
                                value={convertMillisecondsToMinutes(gameSelected.timeLimit)}
                                onChange={onGameTimeLimitChange}
                                disabled={false}
                            />
                            {renderGameRules(gameSelected.rules)}
                        </form>
                        <DialogActions>
                            <Button onClick={toggleViewGameRulesDialog}>Cancel</Button>
                            <Button variant="contained" onClick={() => joinRoom(gameSelected.roomId, props.username, null)}>Accept Game</Button>
                        </DialogActions>
                    </DialogContent>
                </Dialog>
            }
        </div>
    );
};
