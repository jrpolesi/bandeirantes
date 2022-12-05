import {
  type Bandeirante,
  type PlayerMovement,
  emitEvent,
  Game,
  GameStatus,
} from '@bandeirantes/events';
import type { Namespace, Socket } from 'socket.io';
import { Player } from './player';
import { GameLand } from './gameLand';

type GameTableConstructor = Pick<Game, 'id' | 'gameOverTime'> & {
  size: number;
  socketRoom: Namespace;
};

export class GameTable extends Game {
  readonly size: number;
  private readonly socketRoom: Namespace;
  players: Array<Player>;
  lands: Array<Array<GameLand>>;
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

  private contestLand(
    player: Player,
    landCoords: { x: number; y: number }
  ) {
    const land = this.lands[landCoords.y][landCoords.x];

    if (land.owner && land.owner.id === player.id && land.status !== null)
      return;

    if (land.owner && land.owner.id !== player.id) {
      land.previousOwnerId = land.owner.id;
    }

    land.owner = player;
    land.status = 'contesting';
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

  private getLandFromPosition({ y, x }: { y: number; x: number }) {
    for (let i = 0; i < this.lands.length; i++) {
      for (let i2 = 0; i2 < this.lands[i].length; i2++) {
        if (i === y && i2 === x) return this.lands[i][i2];
      }
    }
  }

  getRandomSpawnPosition() {
    const pos = {
      x: 0,
      y: 0,
    };

    const firstAxis = Math.round(Math.random()) ? 'y' : 'x';
    const secondAxis = firstAxis === 'x' ? 'y' : 'x';
    const atMinimum = !!Math.round(Math.random());

    if (atMinimum) pos[firstAxis] = 1;
    else pos[firstAxis] = this.size - 2;

    let secondAxisIndex = Math.trunc(Math.random() * (this.size - 1));
    if (secondAxisIndex === 0) secondAxisIndex++;
    else if (secondAxisIndex === this.size - 1) secondAxisIndex--;

    pos[secondAxis] = secondAxisIndex;

    return pos;
  }

  onPlayerMovement(socket: Socket, { direction, isMoving }: PlayerMovement) {
    const player = this.players.find((p) => p.id === socket.id);

    if (direction === player.direction) return;

    if (typeof isMoving === 'boolean') {
      player.isMoving = isMoving;
    }

    if (!direction) return;
    if (player.direction === 'north' && direction === 'south') return;
    if (player.direction === 'east' && direction === 'west') return;

    player.direction = direction;

    const nextPos = this.getNewPosition(player);
    const currentPos = player.position;

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

  getNewPosition(player: Player) {
    const { position, direction } = player;

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

  claimInitialLands(player: Player, coords: { x: number; y: number }) {
    for (let i = coords.y - 1; i <= coords.y + 1; i++) {
      for (let i2 = coords.x - 1; i2 <= coords.x + 1; i2++) {
        this.lands[i][i2].owner = player;
        this.lands[i][i2].status = 'claimed';
      }
    }
  }

  private tickFunction() {
    for (const player of this.players) {
      if (!player.isMoving) continue;

      const currentPos = player.position;
      const newPos = this.getNewPosition(player);

      if (currentPos.x === newPos.x && currentPos.y === newPos.y) continue;

      const nextLand = this.getLandFromPosition(newPos);

      if (nextLand.owner && nextLand.status === 'contesting') {
        const target = this.players.find(p => p.id === nextLand.owner.id)
        
        this.killPlayer(player, target);

        if (player.id === target.id) continue 
      }

      this.contestLand(player, currentPos);
      player.position = newPos;
    }

    this.endGameFunction();

    emitEvent('update_game', this.socketRoom as any, {
      id: this.id,
      gameOverTime: this.gameOverTime,
      lands: this.lands,
      players: this.players,
      status: this.status,
    });
  }

  resetPlayerTakenLands(player: Player) {
    for (let i = 0; i < this.lands.length; i++) {
      for (let i2 = 0; i2 < this.lands[i].length; i2++) {
        const land = this.lands[i][i2]
        
        if (land.owner?.id === player.id) {
          if (land.previousOwnerId) {
            const previousOwner = this.players.find(
              (p) => p.id === land.previousOwnerId
            );

            land.owner = previousOwner;
            land.status = 'claimed';
            land.previousOwnerId = null;
          } else {
            land.owner = null;
            land.status = null;
            land.previousOwnerId = null;
          }
        }
      }
    }
  }

  private killPlayer(killer: Player, target: Player) {
    for (const landY of this.lands) {
      for (const land of landY) {
        if (land.owner?.id !== target.id) continue;

        if (land.status === 'contesting') {
          if (land.previousOwnerId) {
            const previousOwner = this.players.find(
              (p) => p.id === land.previousOwnerId
            );

            land.owner = previousOwner;
            land.status = 'claimed';
            land.previousOwnerId = null;
          } else {
            land.owner = null;
            land.status = null;
            land.previousOwnerId = null;
          }
        } else if (land.status === 'claimed') {
          if(land.owner.id === killer.id){
            land.owner = null;
            land.previousOwnerId = null;
            land.status = null;

          } else{
            land.owner = killer;
            land.previousOwnerId = null;
          }
        }
      }
    }

    const newPos = this.getRandomSpawnPosition();

    target.isMoving = false;
    target.position = newPos;
    target.conqueredPercentage = 0;
    target.direction = 'south';
    this.claimInitialLands(target, newPos)
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
