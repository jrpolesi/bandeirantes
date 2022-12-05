import { emitEvent, Game, GameStatus, Land } from '@bandeirantes/events';
import { Namespace } from 'socket.io';
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

  changeGameStatus(newStatus: GameStatus) {
    if (this.status === 'waiting' && newStatus === 'running') {
      this.tickInterval = this.createTickInterval(2);
      this.timeInterval = setInterval(this.tickTimeFunction.bind(this), 1000);

      this.status = 'running';
    }
  }

  private createTickInterval(ticksPerSecond: number) {
    const ms = 1000 / ticksPerSecond;

    return setInterval(this.tickFunction.bind(this), ms);
  }

  private tickTimeFunction() {
    if (this.gameOverTime.getTime() > new Date().getTime()) return;
    if (this.tickInterval) clearInterval(this.tickInterval);
    if (this.timeInterval) clearInterval(this.timeInterval);

    this.changeGameStatus('finished');
  }

  getNewPosition(playerIndex: number) {
    const { position, direction } = this.players[playerIndex];

    const newPosition = { ...position };

    if (direction === 'north') {
      if (position.y === 0) return newPosition;
      newPosition.y = position.y - 1;
    } else if (direction === 'south') {
      console.log(position.y, this.size);
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

      this.players[i].position = this.getNewPosition(i);
    }

    emitEvent('update_game', this.socketRoom as any, {
      id: this.id,
      gameOverTime: this.gameOverTime,
      lands: this.lands,
      players: this.players,
      status: this.status,
    });
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