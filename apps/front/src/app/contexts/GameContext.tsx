import {
  BandeirantesSocket,
  emitEvent,
  Game,
  GameError,
  JoinRoom,
  JoinRoomResponse,
  ListenEvents,
  onEvent,
  PlayerDirection,
  PlayerMovement,
} from '@bandeirantes/events';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export const GameContext = createContext<any>({});

class GameSocketEvents {
  constructor(private socket: BandeirantesSocket) {}

  // Emitters events
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
  const [game, setGame] = useState<Game>();
  const [joinRoomResponse, setJoinRoomResponse] = useState<JoinRoomResponse>();
  const [gameError, setGameError] = useState<GameError>()

  const socketEvents = useMemo(
    () => socket && new GameSocketEvents(socket),
    [socket]
  );

  useEffect(() => {
    if (socketEvents) {
      socketEvents.onConnect(() => {
        console.log(socket);

        socketEvents.onJoinRoomResponse((response) => {
          console.log(response)
          setJoinRoomResponse(response);
        });

        socketEvents.onGameError((error) => {
          setGameError(error)
        })

        socketEvents.onUpdateGame((game) => {
          setGame(game);
        });
      });
    }
  }, [socketEvents]);

  function saveSocket(socket: BandeirantesSocket) {
    setSocket(socket);
  }

  function changeDirection(direction: PlayerDirection | null) {
    socketEvents?.emitPlayerMovement({
      direction,
      isMoving: !!direction,
    });
  }

  return (
    <GameContext.Provider
      value={{ game, saveSocket, joinRoomResponse, setIsConnected: setJoinRoomResponse, changeDirection }}
    >
      {children}
    </GameContext.Provider>
  );
}

export const useGameContext = () => useContext(GameContext);
