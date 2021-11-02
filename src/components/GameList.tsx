import { Avatar, Button, Dialog, DialogTitle, List, ListItem, ListItemAvatar, ListItemText, TextField } from '@mui/material';
import axios from 'axios';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import socketService from '../services/socketService';
import './GameList.css';
import gameService from '../services/gameService';

export interface GameListProps {}

export const GameList = (props: GameListProps) => {
    const [gameName, setGameName] = useState('');
    const [rooms, setRooms] = useState([]);
    const [waitForGameDialog, setWaitForGameDialog] = useState(false);
    const history = useHistory();

    const getAllRooms = async () => {
        const response = await axios.get('http://localhost:3000/rooms');
        console.log(response.data);
        setRooms(response.data);
    };

    const handleGameStart = () => {
        if (socketService.socket) {
            gameService.onStartGame(socketService.socket, (options) => {
                console.log('options: ', { options });
                setWaitForGameDialog(false);
                history.push('/game', options)
            });
        }
    };

    useEffect(() => {
        getAllRooms();
    }, []);

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
    }

    const createRoom = async(event) => {
        event.preventDefault();
        if (!gameName.length) {
            return;
        }

        joinRoom(gameName);

        setWaitForGameDialog(true);
    };

    const joinRoom = async(gameName) => {
        const joined = await gameService
            .joinGameRoom(socketService.socket, gameName)
            .catch((err) => {
                alert(err);
            });
        
        handleGameStart();
    }

    return (
        <div className="game-list">
            <h1>All Rooms</h1>
            <h2 className="description">
                Join a game or create one.
            </h2>
            <form className="create-game-input" onSubmit={createRoom}>
                <TextField
                    id="outlined-basic"
                    required
                    label="Game Name"
                    variant="outlined"
                    value={gameName}
                    onChange={onGameNameChange}
                    disabled={false}
                />
                <Button
                    variant="outlined"
                    onClick={createRoom}
                    type="submit"
                >
                    Create a Game Room
                </Button>
            </form>
            {showRooms()}
            <Dialog open={waitForGameDialog}>
                <DialogTitle>
                    Waiting for a player to join your game...
                </DialogTitle>
            </Dialog>
        </div>
    );
};
