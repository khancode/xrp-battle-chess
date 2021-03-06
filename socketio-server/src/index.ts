const cors = require('cors');
const express = require('express');
const http = require('http');
const path = require('path');
import 'reflect-metadata';
import fundWallet from './xrpl-util/fundWallet';
import loginHelper from './db/loginHelper'
import socketServer from './socket';
import getXrpBalance from './xrpl-util/getXrpBalance';
import { rules } from './xrp-battle';
import gameRoomIdToRules from './db/gameRoomIdToRules';
import gameRoomIdToTimeLimit from './db/gameRoomIdToTimeLimit';
const app = express();
const port = 3000;

const server = http.createServer(app);
const io = socketServer(server);

app.use(cors({
    origin: 'http://localhost:9000',
    credentials: true,
}));

app.use(express.static(path.join(__dirname, '../../dist')))
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

app.get('/socketsConnected', async (req, res) => {
    const socketsConnected = Array.from(await io.allSockets());
    console.log(socketsConnected);
    res.send(socketsConnected);
});

app.post('/login', async (req, res) => {
    try {
        const { username } = req.body;
        const { wallet } = loginHelper(username);
        const xrpBalance = await getXrpBalance(username);
        res.json({
            wallet: {
                classicAddress: wallet.classicAddress,
                xrpBalance,
            }
        });
    } catch (err) {
        res.status(403).send({ error: err.message });
    }
});

app.get('/rooms', (req, res) => {
    const roomsMap = io.sockets.adapter.rooms;
    console.log('roomsMap:', roomsMap);
    const rooms = [];
    roomsMap.forEach((socketId, roomName) => {
        console.log('dat roomName:', roomName);
        if (!roomsMap.get(roomName).has(roomName)) {
            rooms.push(roomName);
        }
    })
    console.log('rooms:', rooms);
    res.send(rooms);
});

app.get('/rooms/vacancy', (req, res) => {
    const roomsMap = io.sockets.adapter.rooms;
    console.log('roomsMap:', roomsMap);
    const rooms = [];
    roomsMap.forEach((socketId, roomName) => {
        console.log('dat roomName:', roomName);
        if (!roomsMap.get(roomName).has(roomName)) {
            rooms.push({
                roomName: roomName,
                isVacant: roomsMap.get(roomName).size < 2,
            })
        }
    })
    console.log('rooms:', rooms);
    res.send(rooms);
});

app.post('/fundWallet', async (req, res) => {
    try {
        const result = await fundWallet(req.body.username);
        res.json(result);
    } catch (err) {
        res.status(403).send({ error: err.message });
    }
});

app.post('/getXrpBalance', async (req, res) => {
    try {
        const xrpBalance = await getXrpBalance(req.body.username);
        res.json({ xrpBalance });
    } catch (err) {
        res.status(403).send({ error: err.message });
    }
});

app.get('/xrpBattle/rules', (req, res) => {
    res.json(rules);
});

app.get('/xrpBattle/games', (req, res) => {
    const roomsMap = io.sockets.adapter.rooms;
    const deleteEmptyRooms = [];

    const games = [];
    gameRoomIdToRules.forEach((rules, roomId) => {
        if (roomsMap.has(roomId)) {
            const timeLimit = gameRoomIdToTimeLimit.get(roomId);
            games.push({ roomId, timeLimit, rules });
        } else {
            deleteEmptyRooms.push(roomId);
        }
    });

    res.json(games);

    deleteEmptyRooms.forEach(roomId => {
        gameRoomIdToRules.delete(roomId);
        gameRoomIdToTimeLimit.delete(roomId);
    });
});

server.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});