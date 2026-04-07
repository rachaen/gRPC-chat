import { ChatRoom } from '@/components/chat-room';

export default function ChatPage() {
  return (
    <main>
      <header className="p-4 text-center text-lg font-semibold">gRPC 채팅</header>
      <ChatRoom />
    </main>
  );
}
