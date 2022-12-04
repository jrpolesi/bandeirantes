import type { Server, Namespace} from "socket.io"
import { Room, Game, PlayerGame, Land, emitEvent, onEvent } from "@bandeirantes/events"
import { logger } from "../utils/logger"
import { setInterval } from "node:timers/promises";

interface RoomSocketConstructor extends Omit<Omit<Room, 'gameId'>, 'hasPassword'> {
  password: string | null
  size: number
}

export class RoomSocket extends Room {
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
      let { position, direction } = this.game.players[i]

      if(direction === "north") {
        if(position.y === 0) continue
        position.y --
      }

      if(direction === "south") {
        if(position.y === this.size - 1) continue
        position.y ++
      }

      if(direction === "west") {
        if(position.x === 0) continue
        position.x --
      }

      if(direction === "east") {
        if(position.x === this.size - 1) continue
        position.x ++
      }

      this.game.players[i].position = position
      
    }


    emitEvent("update_game", this.socketRoom as any, this.game)
  }

  listenEvents() {
    this.socketRoom.on('connection', (socket) => {
      const { password, name } = socket.handshake.auth

      if (this.game.players.length >= this.maxPlayers){
        emitEvent('join_room_response', socket, {
          message: 'Room have reached the maximum amount of players',
          succeeded: false,
        });
  
        return socket.disconnect(true);
      }

      if (this.password && this.password !== password) {
        emitEvent('join_room_response', socket, {
          message: 'Invalid password',
          succeeded: false,
        });

        return socket.disconnect(true);
      }
      
      if (!name || name.length < 1) {
        emitEvent('join_room_response', socket, {
          message: 'Name must have at least one character',
          succeeded: false,
        });
  
        return socket.disconnect(true);
      }

      emitEvent('join_room_response', socket, {
        message: `You entered room:"${this.name}"`,
        succeeded: true,
      });

      logger.info(`Room ${this.name}: User ${socket.id} entered into room.`);
      
      emitEvent("update_game", socket, this.game)


      socket.on("disconnect", () => {
        socket._cleanup()
        
        const playerIndex = this.game.players.findIndex( p => p.id === socket.id)
        this.game.players.splice(playerIndex, 1)
      })

      const newPlayer = new PlayerGame()
      newPlayer.id = socket.id
      newPlayer.color = "red"
      newPlayer.name = name
      newPlayer.direction = "south"
      newPlayer.conqueredPercentage = 0
      newPlayer.position = {
        x: 0,
        y: 0
      }


      onEvent("player_movement", socket, (direction) => {})

    });
  }
}