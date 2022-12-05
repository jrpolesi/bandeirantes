import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { logger } from './utils/logger';
import { RoomSocket } from "./model/roomSocket"
import type { Room } from "@bandeirantes/events"

const httpServer = createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")

  if(!req.url.match(/\/rooms$/) || req.method !== "GET") {
    res.statusCode = 404
    return res.end("Not found")
  }

  res.setHeader('Content-Type', 'application/json')

  const roomsList: Array<Room> = rooms.map( r => {
    return {
      id: r.id,
      name: r.name,
      hasPassword: !!r.password,
      maxPlayers: r.maxPlayers,
      playerCount: r.game.players.length
    }
  })

  res.end(JSON.stringify(roomsList))
});

const io = new Server(httpServer, {
    cors: {
      origin: "*"
    }
  },
);

const rooms: Array<RoomSocket> = [
  new RoomSocket(
    {
      id: '1',
      maxPlayers: 5,
      name: 'Main Room',
      password: null,
      playerCount: 0,
      size: 20
    },
    io
  ),
  new RoomSocket(
    {
      id: '2',
      maxPlayers: 5,
      name: 'Com senha',
      password: "senha",
      playerCount: 0,
      size: 10
    },
    io
  ),
];

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => logger.info(`Server running at ${PORT}`));
