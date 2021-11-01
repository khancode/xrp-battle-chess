import { Avatar, Button, List, ListItem, ListItemAvatar, ListItemText, styled } from '@mui/material';
import axios from 'axios';
import * as React from 'react';
import { useEffect, useState } from 'react';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import socketService from '../services/socketService';
import './GameList.css';

export interface GameListProps {}

export const GameList = (props: GameListProps) => {
    const [rooms, setRooms] = useState([]);

    const getAllRooms = async () => {
        const response = await axios.get('http://localhost:3000/rooms');
        console.log(response.data);
        setRooms(response.data);
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
                            <Button variant="contained" onClick={() => alert('TODO implement')}>
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

    const createRoom = async () => {
        const socket = await socketService
            .connect('http://localhost:3000')
            .catch((err) => {
            console.log("Error: ", err);
        });
        getAllRooms();
    };

    return (
        <div className="game-list">
            <h1>All Rooms</h1>
            <h2 className="description">
                Join a game or create one.
            </h2>
            <Button
                variant="outlined"
                onClick={createRoom}
            >
                Create a Game Room
            </Button>
            {showRooms()}
        </div>
    );
};
