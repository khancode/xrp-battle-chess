import axios from 'axios';
import * as React from 'react';
import { useEffect, useState } from 'react';
import socketService from '../services/socketService';

export interface ProposeGameProps {}

export const ProposeGame = (props: ProposeGameProps) => {
    const connectSocket = async () => {
        const socket = await socketService
            .connect('http://localhost:3000')
            .catch((err) => {
            console.log("Error: ", err);
        });
    };

    const getAllRooms = async () => {
        // Make a request for a user with a given ID
        const response = await axios.get('http://localhost:3000/rooms');
        console.log(response.data);
    };

    useEffect(() => {
        connectSocket();
        getAllRooms();
    }, []);

    return (
        <div className="app">
            <h1>Propose a game</h1>
            <h2 className="description">
                Propose a game
            </h2>
        </div>
    );
};
