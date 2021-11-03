const cors = require('cors');
const express = require('express');
const http = require('http');
const path = require('path');
import 'reflect-metadata';
import fundWallet from './xrpl-util/fundWallet';
import loginHelper from './db/loginHelper'
import socketServer from './socket';
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
        const result = loginHelper(req.body.username);
        res.json(result);
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

// app.listen(port, () => {
//     console.log(`Example app listening at http://localhost:${port}`);
// });

server.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});