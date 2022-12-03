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
  lands: Array<Land>;
  gameOverTime: Date;
}

export class Room {
  id: string;
  gameId: Game['id'];
  name: string;
  password: null | string;
  maxPlayers: number;
  playerCount: number;
}

export type JoinRoom = {
  player: PlayerCredentials;
  roomId: string;
  password: null | string;
};

export type PlayerMovement = {
  direction: PlayerDirection;
  isMoving: boolean;
};

export type GameError = {
  code: number;
  message: string;
};

type VoidSyncOrAsync = void | Promise<void>;
type EventTypes = 'emit' | 'listen';

export interface EmitEvents {
  update_game: (game: Game) => void;

  get_room_list: () => void;

  room_list: (roomList: Array<Room>) => void;

  join_room: (payload: JoinRoom) => void;

  game_error: (error: GameError) => void;

  join_room_response: (response: JoinRoomResponse) => void;

  finished_game: () => void;

  player_movement: (playerMovement: PlayerMovement) => void;
}

export interface ListenEvents {
  update_game: (updatedGame: Game) => VoidSyncOrAsync;

  get_room_list: (roomList: Room[]) => VoidSyncOrAsync;

  room_list: () => VoidSyncOrAsync;

  join_room: (room: JoinRoom) => VoidSyncOrAsync;

  game_error: (error: GameError) => VoidSyncOrAsync;

  join_room_response: (response: JoinRoomResponse) => VoidSyncOrAsync;

  finished_game: (isFinished: boolean) => VoidSyncOrAsync;

  player_movement: (playerMovement: PlayerMovement) => VoidSyncOrAsync;
}

export type BandeirantesEvents<EventType extends EventTypes> =
  EventType extends 'emit' ? EmitEvents : ListenEvents;

export type BandeirantesSocket = Socket<
  BandeirantesEvents<'listen'>,
  BandeirantesEvents<'emit'>
>;
