import { library } from '@fortawesome/fontawesome-svg-core';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { useGameContext } from './contexts';
import { Game as GamePage, Lobby } from './pages';
import { GlobalStyle, ResetCSS } from './styles';

library.add(fas, far);

export function App() {
  const { joinRoomResponse, game } = useGameContext();

  console.log(joinRoomResponse)

  return (
    <>
      <ResetCSS />
      <GlobalStyle />
      {joinRoomResponse?.succeeded ? <GamePage game={game} /> : <Lobby />}
    </>
  );
}

export default App;
