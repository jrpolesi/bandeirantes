import { useState } from 'react';
import { RoomList } from '../../components';
import { useGameContext } from '../../contexts';

export function Lobby() {
  const [name, setName] = useState<string>();
  const { rooms } = useGameContext();

  return (
    <>
      <input
        type="text"
        value={name}
        onChange={(event) => setName(event.target.innerText)}
      />
      <RoomList rooms={rooms} />
    </>
  );
}
