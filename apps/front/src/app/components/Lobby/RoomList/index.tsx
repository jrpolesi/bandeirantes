import { Room } from '@bandeirantes/events';
import styled from '@emotion/styled';
import { RoomCard, RoomCardProps } from './RoomCard';

export type RoomListProps = {
  rooms: Array<Room>;
  handleJoinRoom: RoomCardProps['handleClick'];
};

const StyledRoomList = styled.ul`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;

  > li {
    flex: 1;
    width: 100%;
  }
`;

export function RoomList({ rooms, handleJoinRoom }: RoomListProps) {
  return (
    <StyledRoomList>
      {rooms.map((room) => (
        <li key={room.id}>
          <RoomCard room={room} handleClick={handleJoinRoom} />{' '}
        </li>
      ))}
    </StyledRoomList>
  );
}
