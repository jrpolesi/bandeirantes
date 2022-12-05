import {
  type Bandeirante,
  type PlayerMovement,
  emitEvent,
  Game,
  GameStatus,
} from '@bandeirantes/events';
import type { Namespace, Socket } from 'socket.io';
import { Player } from './player';
import { GameLand } from "./gameLand"

type GameTableConstructor = Pick<Game, 'id' | 'gameOverTime'> & {
  size: number;
  socketRoom: Namespace;
};

export class GameTable extends Game {
  readonly size: number;
  private readonly socketRoom: Namespace;
  players: Array<Player>;
  lands: Array<Array<GameLand>>
  tickInterval: NodeJS.Timer | undefined;

  constructor(data: GameTableConstructor) {
    super();

    this.id = data.id;
    this.lands = this.generateSquareBoard(data.size);
    this.gameOverTime = data.gameOverTime;
    this.socketRoom = data.socketRoom;
    this.size = data.size;

    this.players = [];
    this.status = 'waiting';
  }

  private contestLand(playerIndex: number, landCoords: { x: number; y: number }) {
    const player = this.players[playerIndex]
    const land = this.lands[landCoords.y][landCoords.x]

    if(land.owner &&land.owner.id === player.id && land.status !== null) return

    if(land.owner && land.owner.id !== player.id){
      this.lands[landCoords.y][landCoords.x].previousOwnerId = land.owner.id
    }

    this.lands[landCoords.y][landCoords.x].owner = player
    this.lands[landCoords.y][landCoords.x].status = "contesting"
  }

  changeGameStatus(newStatus: GameStatus) {
    if (this.status === 'waiting' && newStatus === 'running') {
      this.tickInterval = this.createTickInterval(4);
    } else if (this.status === 'running' && newStatus === 'finished') {
      if (this.tickInterval) {
        clearInterval(this.tickInterval);
        this.tickInterval = undefined;
      }
    }

    this.status = newStatus;
  }

  private createTickInterval(ticksPerSecond: number) {
    const ms = 1000 / ticksPerSecond;

    return setInterval(this.tickFunction.bind(this), ms);
  }

  private endGameFunction() {
    if (this.gameOverTime.getTime() > new Date().getTime()) return;
    this.changeGameStatus('finished');
  }

  private getLandFromPosition({y, x}:{y: number, x: number}){
    for(let i = 0; i < this.lands.length; i++){
      for(let i2 = 0; i2 < this.lands[i].length; i2++){
        if(i === y && i2 === x) return this.lands[i][i2]
      }
    }
  }

  onPlayerMovement(socket: Socket, { direction, isMoving }: PlayerMovement) {
    const playerIndex = this.players.findIndex((p) => p.id === socket.id);
    const currentDirection = this.players[playerIndex].direction;

    if (direction === currentDirection) return;

    if (typeof isMoving === 'boolean') {
      this.players[playerIndex].isMoving = isMoving;
    }

    if (!direction) return;
    if (currentDirection === 'north' && direction === 'south') return;
    if (currentDirection === 'east' && direction === 'west') return;

    this.players[playerIndex].direction = direction;

    const nextPos = this.getNewPosition(playerIndex);
    const currentPos = this.players[playerIndex].position;

    if (nextPos.y === currentPos.y && nextPos.x === currentPos.x) {
      return emitEvent('game_error', socket, {
        code: '0',
        message: 'Unable to go back',
      });
    }

    emitEvent('update_game', socket as any, {
      gameOverTime: this.gameOverTime,
      id: this.id,
      lands: this.lands,
      players: this.players.map(({ isMoving: _, ...rest }) => rest),
      status: this.status,
    });
  }

  getNewPosition(playerIndex: number) {
    const { position, direction } = this.players[playerIndex];

    const newPosition = { ...position };

    if (direction === 'north') {
      if (position.y === 0) return newPosition;
      newPosition.y = position.y - 1;
    } else if (direction === 'south') {
      if (position.y >= this.size - 1) return newPosition;
      newPosition.y = position.y + 1;
    } else if (direction === 'west') {
      if (position.x === 0) return newPosition;
      newPosition.x = position.x - 1;
    } else if (direction === 'east') {
      if (position.x >= this.size - 1) return newPosition;
      newPosition.x = position.x + 1;
    }

    return newPosition;
  }

  claimInitialLands(playerId: string, coords: {x: number, y:number}){
    const player = this.players.find( p => p.id === playerId)
    for(let i = coords.y - 1; i <= coords.y + 1; i++){
      for(let i2 = coords.x - 1; i2 <= coords.x + 1; i2++){
        this.lands[i][i2].owner = player
        this.lands[i][i2].status = "claimed"
      }
    }    
  }

  private tickFunction() {
    for (let i = 0; i < this.players.length; i++) {
      if (!this.players[i].isMoving) continue;

      const currentPos = this.players[i].position;
      const newPos = this.getNewPosition(i);

      if (currentPos.x === newPos.x && currentPos.y === newPos.y) continue

      const nextLand = this.getLandFromPosition(newPos)
      if(nextLand.owner) this.killPlayer(this.players[i], nextLand.owner)

      if(nextLand.status === "contesting" && nextLand.owner?.id === this.players[i].id) continue

      this.contestLand(i, currentPos)
      this.players[i].position = newPos;
    }

    this.endGameFunction()

    emitEvent('update_game', this.socketRoom as any, {
      id: this.id,
      gameOverTime: this.gameOverTime,
      lands: this.lands,
      players: this.players,
      status: this.status,
    });
  }

  resetPlayerTakenLands(playerIndex: number){
    const playerId = this.players[playerIndex].id

    for (let i = 0; i < this.lands.length; i++){
      for (let i2 = 0; i2 < this.lands[i].length; i2++){
        if (this.lands[i][i2].owner?.id === playerId) {
          if(this.lands[i][i2].previousOwnerId){
            const previousOwner = this.players.find( p => p.id === this.lands[i][i2].previousOwnerId)

            this.lands[i][i2].owner = previousOwner
            this.lands[i][i2].status = "claimed"
            this.lands[i][i2].previousOwnerId = null
          }else{
            this.lands[i][i2].owner = null
            this.lands[i][i2].status = null
            this.lands[i][i2].previousOwnerId = null
          }
        }
      }
    }
  }

  private killPlayer(killer: Player, target: Bandeirante){
    for (let i = 0; i < this.lands.length; i++){
      for (let i2 = 0; i2 < this.lands[i].length; i2++){
        if (this.lands[i][i2].owner?.id !== target.id) continue

        if(this.lands[i][i2].status === "contesting"){
          if(this.lands[i][i2].previousOwnerId){
            const previousOwner = this.players.find( p => p.id === this.lands[i][i2].previousOwnerId)

            this.lands[i][i2].owner = previousOwner
            this.lands[i][i2].status = "claimed"
            this.lands[i][i2].previousOwnerId = null
          }else{
            this.lands[i][i2].owner = null
            this.lands[i][i2].status = null
            this.lands[i][i2].previousOwnerId = null
          }
        }else if(this.lands[i][i2].status === "claimed"){
          this.lands[i][i2].owner = killer
          this.lands[i][i2].previousOwnerId = null
        }
      }
    }
  }

  private generateSquareBoard(size: number): Array<Array<GameLand>> {
    const board: Array<Array<GameLand>> = [];

    for (let i = 0; i < size; i++) {
      const line: Array<GameLand> = [];

      for (let i2 = 0; i2 < size; i2++) {
        line.push(new GameLand(`${i}-${i2}`));
      }

      board.push(line);
    }

    return board;
  }
}
