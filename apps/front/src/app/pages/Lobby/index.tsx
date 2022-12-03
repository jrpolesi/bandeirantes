import { useGameContext } from '../../contexts';

export function Lobby() {
  const { rooms } = useGameContext();

  return (
    <ul>
      {rooms.map((room) => (
        <li key={room.id}>{room.name}</li>
      ))}
    </ul>
  );
}
