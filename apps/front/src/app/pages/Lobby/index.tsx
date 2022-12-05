import { Room } from '@bandeirantes/events';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { RoomList } from '../../components';
import { useGameContext } from '../../contexts';

export function Lobby() {
  const { saveSocket } = useGameContext();
  const [rooms, setRooms] = useState<Array<Room>>();
  const [name, setName] = useState<string>("");
  const [nameError, setNameError] = useState<string>("")

  useEffect(() => {
    async function getRoomsFromApi() {
      try {
        const response = await fetch('http://localhost:3000/rooms');

        const rooms: Array<Room> = await response.json();

        setRooms(rooms);
      } catch (err) {
        console.log(err);
      }
    }

    getRoomsFromApi();
  }, []);

  function joinRoom(roomId: string, password?: string) {
    const wsUrl = 'ws://localhost:3000/room/' + roomId;

    const socket = io(wsUrl, { auth: { password, name } });

    saveSocket(socket);
  }

  return (
    <>
      <input
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      {}
      {rooms && <RoomList rooms={rooms} handleJoinRoom={joinRoom} />}
    </>
  );
}
