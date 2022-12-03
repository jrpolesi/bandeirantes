import { Room } from '@bandeirantes/events';
import { useState } from 'react';

export type RoomCredentials = {
  password?: string;
};

export type RoomCardProps = {
  room: Room;
  handleClick: (password?: string) => void;
};

export function RoomCard({ room, handleClick }: RoomCardProps) {
  const [password, setPassword] = useState<string>();
  console.log(room);

  return (
    <div>
      <h2>{room.name}</h2>

      <span> players {`${room.playerCount} / ${room.maxPlayers}`}</span>

      {room.password && (
        <input
          type="text"
          placeholder="password"
          value={password}
          onChange={(event) => setPassword(event.target.innerText)}
        />
      )}

      <button onClick={() => handleClick(password)}>Start</button>
    </div>
  );
}
