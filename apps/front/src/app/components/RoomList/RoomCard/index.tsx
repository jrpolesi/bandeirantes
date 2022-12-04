import { Room } from '@bandeirantes/events';
import styled from '@emotion/styled';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

export type RoomCredentials = {
  password?: string;
};

export type RoomCardProps = {
  room: Room;
  handleClick: (roomId: string, password?: string) => void;
};

const StyledRoomCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: auto;
  padding: 10px 15px;
  background-color: #28afb0;
  border-radius: 5px;
  max-width: 350px;

  .roomcard__header {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: space-between;

    h2 {
      font-size: 1.3rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .roomcard__player_counter {
      font-size: 1.2rem;

      span {
        margin-right: 10px;
      }
    }
  }

  .roomcard__password_wrapper {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 0px 10px;

    input {
      flex: 1;
      border-radius: 5px;
      border: none;
      padding: 5px 7px;
    }
  }

  button {
    padding: 8px 10px;
    border-radius: 5px;
    border: none;
    background-color: #0b3954;
    color: white;
    font-weight: 600;
    font-size: 1rem;
  }
`;

export function RoomCard({ room, handleClick }: RoomCardProps) {
  const [password, setPassword] = useState<string>('');
  console.log(room);

  return (
    <StyledRoomCard>
      <div className="roomcard__header">
        <h2>{room.name}</h2>

        <span className="roomcard__player_counter">
          <span>{`${room.playerCount} / ${room.maxPlayers}`}</span>
          <FontAwesomeIcon size="sm" icon={['fas', 'user']} />
        </span>
      </div>

      <div className="roomcard__password_wrapper">
        <FontAwesomeIcon
          size="xl"
          color="#0b3954"
          icon={room.hasPassword ? ['fas', 'lock'] : ['fas', 'unlock']}
        />

        <input
          type="text"
          placeholder="Password room..."
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={!room.hasPassword}
        />
      </div>

      <button
        onClick={() => handleClick(room.id, password)}
        disabled={room.maxPlayers === room.playerCount}
      >
        Join Room
      </button>
    </StyledRoomCard>
  );
}
