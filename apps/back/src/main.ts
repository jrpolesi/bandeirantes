import { createServer } from 'node:http';
import { Server, type Socket, type Namespace } from 'socket.io';
import { logger } from './utils/logger';
import { Room, emitEvent, onEvent, Game, PlayerGame, Land } from '@bandeirantes/events';
import { joinRoomError } from "./errors/joinRoomError"

class RoomSocket extends Room {

  private socketRoom: Namespace
  private game: Game

  constructor(data: Omit<Room, "gameId">, io: Server){
    super()

    this.id = data.id
    this.name = data.name
    this.password = data.password
    this.maxPlayers = 5
    this.playerCount = 0

    const game = new Game()
    game.id = "0"
    game.lands = this.generateSquareBoard(10)
    game.players = []
    game.status = "waiting"
    game.gameOverTime = new Date()

    this.game = game
    this.socketRoom = io.of(`/room/${this.id}`)
  }

  private generateSquareBoard(size: number): Array<Array<Land>> {
    const board: Array<Array<Land>> = []

    for (let i = 0; i < size; i++){
      const line:Array<Land> = []

      for (let i2 = 0; i2 < size; i2++){
        line.push({
          id: `${i}-${i2}`,
          owner: null,
          status: "contesting"
        })  
      }

      board.push(line)
    }
    
    return board
  }

  tick(){
    for(let i = 0; i < this.game.players.length; i++ ){

      this.game.players

    }
  }

  listenEvents(){
    this.socketRoom.on("connection", (socket) => {
      if(this.password && this.password !== socket.handshake.auth.password) {
        emitEvent("join_room_response", socket, {
          message: "Invalid password",
          succeeded: false
        })
        
        return socket.disconnect()
      }

      emitEvent("join_room_response", socket, {
        message: `You entered room:${this.name}`,
        succeeded: false
      })

      logger.info(`Room ${this.name}: User ${socket.id} entered into room.`)
    })

    // onEvent("player_movement", this.socketRoom as any, (arg) => {
      
    // })
  }
}




const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});



io.on('connection', (socket) => {
  logger.info(`Socket connection with id:${socket.id}`);
  onEvent('get_room_list', socket, () => emitEvent('room_list', socket, rooms));

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
  new RoomSocket({
    id: "1",
    maxPlayers: 5,
    name: "Main Room",
    password: null,
    playerCount: 0
  }, io )
];

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => logger.info(`Server running at ${PORT}`));
