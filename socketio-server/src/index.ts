const cors = require('cors');
const express = require('express');
const http = require('http');
const path = require('path');
import 'reflect-metadata';
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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

app.get('/socketsConnected', async (req, res) => {
    const socketsConnected = Array.from(await io.allSockets());
    console.log(socketsConnected);
    res.send(socketsConnected);
});

app.get('/rooms', (req, res) => {
    const rooms = io.sockets.adapter.rooms;
    console.log(rooms);
    res.send(Array.from(rooms.keys()));
});

// app.listen(port, () => {
//     console.log(`Example app listening at http://localhost:${port}`);
// });

server.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});