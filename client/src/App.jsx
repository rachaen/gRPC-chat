import './App.css';
import ChatRoom from './pages/ChatRoom';
import Join from './pages/Join';

function App() {
  return (
    <div className='App'>
      <header>gRCP 채팅 클라이언트</header>
      <Join />
      <ChatRoom />
    </div>
  );
}

export default App;
