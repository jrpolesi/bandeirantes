import {
  emitEvent, Game, Land, Room
} from '@bandeirantes/events';
import { createServer } from 'node:http';
import { setInterval } from "node:timers/promises";
import { Server, type Namespace } from 'socket.io';
import { logger } from './utils/logger';

interface RoomSocketConstructor extends Omit<Omit<Room, 'gameId'>, 'hasPassword'> {
  password: string | null
  size: number
}

class RoomSocket extends Room {
  private socketRoom: Namespace;
  readonly size: number
  game: Game;
  password: string | null
  interval: AsyncIterable<() => void>

  constructor(data: RoomSocketConstructor, io: Server) {
    super();

    this.id = data.id;
    this.name = data.name;
    this.password = data.password;
    this.maxPlayers = 5;
    this.playerCount = 0;
    this.size = data.size
    
    const game = new Game();
    game.id = '0';
    game.lands = this.generateSquareBoard(data.size);
    game.players = [];
    game.status = 'waiting';
    game.gameOverTime = new Date();

    this.game = game;
    this.socketRoom = io.of(`/room/${this.id}`);

    this.listenEvents()
  }

  private generateSquareBoard(size: number): Array<Array<Land>> {
    const board: Array<Array<Land>> = [];

    for (let i = 0; i < size; i++) {
      const line: Array<Land> = [];

      for (let i2 = 0; i2 < size; i2++) {
        line.push({
          id: `${i}-${i2}`,
          owner: null,
          status: null,
        })
      }

      board.push(line);
    }

    return board;
  }

  createInterval(ticksPerSecond: number) {
    const ms = ticksPerSecond / 1000

    this.interval = setInterval(ms, this.tickFunction)
  }

  tickFunction() {
    for (let i = 0; i < this.game.players.length; i++) {
      this.game.players[i].direction
    }

    setTimeout
  }

  listenEvents() {
    this.socketRoom.on('connection', (socket) => {
      if (this.password && this.password !== socket.handshake.auth.password) {
        emitEvent('join_room_response', socket, {
          message: 'Invalid password',
          succeeded: false,
        });

        return socket.disconnect(true);
      }

      emitEvent('join_room_response', socket, {
        message: `You entered room:"${this.name}"`,
        succeeded: true,
      });

      logger.info(`Room ${this.name}: User ${socket.id} entered into room.`);
    });
  }
}

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

io.on('connection', (socket) => {
  logger.info(`Socket connection with id:${socket.id}`);
  // onEvent('get_room_list', socket, () => emitEvent('room_list', socket, rooms));

  // onEvent('join_room', socket, (roomCredentials) => {
  //   let roomIndex: number, gameIndex: number

  //   const foundRoom = rooms.find((r, i) => {
  //     roomIndex = i
  //     return r.id === roomCredentials.id
  //   });
  //   if (!foundRoom) return joinRoomError("roomId", socket)

  //   const foundGame = games.find((g, i) => {
  //     gameIndex = i
  //     return g.id === foundRoom.gameId
  //   })
  //   if (!foundRoom) return joinRoomError("gameId", socket)

  //   if(foundGame.players.length >= foundRoom.maxPlayers) {
  //     return joinRoomError("playerLimit", socket)
  //   }

  //   if (foundRoom.password && foundRoom.password !== roomCredentials.password) {
  //     return joinRoomError("password", socket)
  //   }

  //   const newPlayer = new PlayerGame()
  //   newPlayer.id = socket.id
  //   newPlayer.color = roomCredentials.player.color
  //   newPlayer.name = roomCredentials.player.name
  //   newPlayer.direction = "south"
  //   newPlayer.conqueredPercentage = 0
  //   newPlayer.position = {
  //     x: 0,
  //     y: 0
  //   }

  //   // games[gameIndex].players.push(newPlayer)

  //   emitEvent("join_room_response", socket, {
  //     message: `You entered into room:${foundRoom.name}`,
  //     succeeded: true
  //   })
  // });
});

const rooms: Array<RoomSocket> = [
  new RoomSocket(
    {
      id: '1',
      maxPlayers: 5,
      name: 'Main Room',
      password: null,
      playerCount: 0,
      size:10
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
      size:10
    },
    io
  ),
];

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => logger.info(`Server running at ${PORT}`));
