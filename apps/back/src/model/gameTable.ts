import {
  emitEvent,
  Game,
  GameStatus,
  Land,
  PlayerMovement,
} from '@bandeirantes/events';
import type { Namespace, Socket } from 'socket.io';
import { Player } from './player';

type GameTableConstructor = Pick<Game, 'id' | 'gameOverTime'> & {
  size: number;
  socketRoom: Namespace;
};

export class GameTable extends Game {
  readonly size: number;
  private readonly socketRoom: Namespace;
  players: Array<Player>;
  tickInterval: NodeJS.Timer | undefined;
  timeInterval: NodeJS.Timer | undefined;

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

  contestLand(playerIndex: number, landCoords: { x: number; y: number }) {
    const player = this.players[playerIndex]

    this.lands[landCoords.y][landCoords.x].owner = player
    this.lands[landCoords.y][landCoords.x].status = "contesting"
  }

  changeGameStatus(newStatus: GameStatus) {
    if (this.status === 'waiting' && newStatus === 'running') {
      this.tickInterval = this.createTickInterval(4);
      this.timeInterval = setInterval(this.tickTimeFunction.bind(this), 1000);
    } else if (this.status === 'running' && newStatus === 'finished') {
      if (this.tickInterval) {
        clearInterval(this.tickInterval);
        this.tickInterval = undefined;
      }
      if (this.timeInterval) {
        clearInterval(this.timeInterval);
        this.tickInterval = undefined;
      }
    }

    this.status = newStatus;
  }

  private createTickInterval(ticksPerSecond: number) {
    const ms = 1000 / ticksPerSecond;

    return setInterval(this.tickFunction.bind(this), ms);
  }

  private tickTimeFunction() {
    if (this.gameOverTime.getTime() > new Date().getTime()) return;
    this.changeGameStatus('finished');
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

  private tickFunction() {
    for (let i = 0; i < this.players.length; i++) {
      if (!this.players[i].isMoving) continue;

      const currentPos = this.players[i].position;
      const newPos = this.getNewPosition(i);

      this.contestLand(i, currentPos)

      this.players[i].position = newPos;
    }

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
          this.lands[i][i2].owner = null
          this.lands[i][i2].status = null
        }
      }
    }
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
        });
      }

      board.push(line);
    }

    return board;
  }
}
