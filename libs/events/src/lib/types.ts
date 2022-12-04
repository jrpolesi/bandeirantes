import type { Socket } from 'socket.io';

export type PlayerDirection = 'north' | 'south' | 'west' | 'east';
export type LandStatus = null | 'claimed' | 'contesting';
export type GameStatus = 'waiting' | 'running' | 'finished';
export type JoinRoomResponse = {
  succeeded: boolean;
  message: string;
};

export class PlayerGame {
  id: string;
  name: string;
  color: string;
  direction: PlayerDirection;
  conqueredPercentage: number;
  position: {
    x: number;
    y: number;
  };
}

export class PlayerCredentials {
  name: PlayerGame['name'];
  color: PlayerGame['color'];
}

export class Land {
  id: string;
  status: LandStatus;
  owner: null | PlayerGame;
}

export class Game {
  id: string;
  status: GameStatus;
  players: Array<PlayerGame>;
  lands: Array<Array<Land>>;
  gameOverTime: Date;
}

export class Room {
  id: string;
  name: string;
  hasPassword: boolean;
  maxPlayers: number;
  playerCount: number;
}

export type JoinRoom = {
  player: PlayerCredentials;
  id: string;
  password: null | string;
};

export type PlayerMovement = {
  direction: PlayerDirection | null;
  isMoving: boolean;
};

export type GameError = {
  code: string;
  message: string;
};

type EventTypes = 'emit' | 'listen';

export interface EmitEvents {
  update_game: (game: Game) => void;

  join_room: (payload: JoinRoom) => void;

  game_error: (error: GameError) => void;

  join_room_response: (response: JoinRoomResponse) => void;

  finished_game: () => void;

  player_movement: (playerMovement: PlayerMovement) => void;
}

export interface ListenEvents {
  update_game: (updatedGame: Game) => any;

  join_room: (room: JoinRoom) => any;

  game_error: (error: GameError) => any;

  join_room_response: (response: JoinRoomResponse) => any;

  finished_game: (isFinished: boolean) => any;

  player_movement: (playerMovement: PlayerMovement) => any;
}

export type BandeirantesEvents<EventType extends EventTypes> =
  EventType extends 'emit' ? EmitEvents : ListenEvents;

export type BandeirantesSocket = Socket<
  BandeirantesEvents<'listen'>,
  BandeirantesEvents<'emit'>
> &
  Socket;
