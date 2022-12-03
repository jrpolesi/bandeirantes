import {
  BandeirantesSocket,
  emitEvent,
  Game,
  JoinRoom,
  ListenEvents,
  onEvent,
  PlayerMovement,
  Room,
} from '@bandeirantes/events';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { io } from 'socket.io-client';

export const GameContext = createContext<{ rooms: Room[] }>({
  rooms: [],
});

class GameSocketEvents {
  constructor(private socket: BandeirantesSocket) {}

  // Emitters events
  emitGetRoomsList() {
    emitEvent('get_room_list', this.socket);
  }

  emitJoinRoom(joinRoom: JoinRoom) {
    emitEvent('join_room', this.socket, joinRoom);
  }

  emitPlayerMovement(movement: PlayerMovement) {
    emitEvent('player_movement', this.socket, movement);
  }

  // Listeners events
  onConnect(registerListeners: () => void) {
    this.socket.on('connect', () => {
      registerListeners();
    });
  }

  onRoomList(listener: ListenEvents['room_list']) {
    onEvent('room_list', this.socket, listener);
  }

  onJoinRoomResponse(listener: ListenEvents['join_room_response']) {
    onEvent('join_room_response', this.socket, listener);
  }

  onUpdateGame(listener: ListenEvents['update_game']) {
    onEvent('update_game', this.socket, listener);
  }

  onFinishedGame(listener: ListenEvents['finished_game']) {
    onEvent('finished_game', this.socket, listener);
  }

  onGameError(listener: ListenEvents['game_error']) {
    onEvent('game_error', this.socket, listener);
  }
}

export function GameProvider({ children }: PropsWithChildren<{}>) {
  const [socket, setSocket] = useState<BandeirantesSocket>();
  const [roomList, setRoomList] = useState<Array<Room>>([]);
  const [game, setGame] = useState<Game>();

  useEffect(() => {
    if (!socket) {
      const newSocket = io('http://localhost:3000');

      setSocket(newSocket as any);
    }
  });

  useEffect(() => {
    if (socket) {
      const socketEvents = new GameSocketEvents(socket);

      socketEvents.onConnect(() => {
        console.log(socket);

        socketEvents.emitGetRoomsList();

        socketEvents.onRoomList((rooms) => {
          setRoomList(rooms);
        });
      });
    }
  }, [socket]);

  return (
    <GameContext.Provider value={{ rooms: roomList }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGameContext = () => useContext(GameContext);
