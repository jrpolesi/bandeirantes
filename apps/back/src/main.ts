import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { logger } from './utils/logger';
import { Room, emitEvent, onEvent, Game, PlayerGame } from '@bandeirantes/events';
import { joinRoomError } from "./errors/joinRoomError"


const game01 = new Game()
game01.id = "0"
game01.players = []
game01.status = "waiting"
game01.lands = []
game01.gameOverTime = new Date()

const room01 = new Room();
room01.id = game01.id;
room01.maxPlayers = 5;
room01.name = 'Room 01';
room01.password = null;
room01.playerCount = 0;

const rooms: Array<Room> = [room01];
const games: Array<Game> = [game01]

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});



io.on('connection', (socket) => {
  logger.info(`Socket connection with id:${socket.id}`);
  onEvent('get_room_list', socket, () => emitEvent('room_list', socket, rooms));

  onEvent('join_room', socket, (roomCredentials) => {
    let roomIndex: number, gameIndex: number

    const foundRoom = rooms.find((r, i) => {
      roomIndex = i
      return r.id === roomCredentials.id
    });
    if (!foundRoom) return joinRoomError("roomId", socket)
    
    const foundGame = games.find((g, i) => {
      gameIndex = i
      return g.id === foundRoom.gameId
    })
    if (!foundRoom) return joinRoomError("gameId", socket)

    if(foundGame.players.length >= foundRoom.maxPlayers) {
      return joinRoomError("playerLimit", socket)
    }
    
    if (foundRoom.password && foundRoom.password !== roomCredentials.password) {
      return joinRoomError("password", socket)
    }

    const newPlayer = new PlayerGame()
    newPlayer.id = socket.id
    newPlayer.color = roomCredentials.player.color
    newPlayer.name = roomCredentials.player.name
    newPlayer.direction = "south"
    newPlayer.conqueredPercentage = 0
    newPlayer.position = {
      x: 0,
      y: 0
    }

    games[gameIndex].players.push(newPlayer)

    emitEvent("join_room_response", socket, {
      message: `You entered into room:${foundRoom.name}`,
      succeeded: true
    })
  });

});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => logger.info(`Server running at ${PORT}`));
