'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Empty, Message } from '@/gen/server_pb';
import { getMessageServiceClient } from '@/lib/grpc-web-clients';
import { useStore } from '@/store/store';

type UiMessage =
  | { type: 'system'; message: string; timestamp: string }
  | { type: 'message'; nickname: string; message: string; timestamp: string };

export function ChatRoom() {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messageRef = useRef<HTMLDivElement>(null);
  const nickname = useStore((s) => s.nickname);

  useEffect(() => {
    const client = getMessageServiceClient();
    const streamMessages = new Empty();
    const stream = client.streamMessages(streamMessages, {});

    stream.on('data', (response: { getUsername: () => string; getText: () => string }) => {
      const msg: UiMessage = {
        type: 'message',
        nickname: response.getUsername(),
        message: response.getText(),
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, msg]);
    });

    stream.on('error', (err: unknown) => {
      console.error('StreamMessages error:', err);
    });

    const userJoinStream = client.notifyUserJoin(new Empty(), {});
    userJoinStream.on('data', (response: { getUsername: () => string }) => {
      const joinMsg: UiMessage = {
        type: 'system',
        message: `${response.getUsername()}님이 입장하셨습니다.`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, joinMsg]);
    });

    const userLeaveStream = client.notifyUserLeave(new Empty(), {});
    userLeaveStream.on('data', (response: { getUsername: () => string }) => {
      const leaveMsg: UiMessage = {
        type: 'system',
        message: `${response.getUsername()}님이 퇴장하셨습니다.`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, leaveMsg]);
    });

    return () => {
      stream.cancel();
      userJoinStream.cancel();
      userLeaveStream.cancel();
    };
  }, []);

  const sendMessage = () => {
    if (!nickname || !newMessage.trim()) return;

    const message = new Message();
    message.setUsername(nickname);
    message.setText(newMessage);

    getMessageServiceClient().sendMessage(message, {}, (err, response) => {
      if (err) {
        console.error('Error sending message:', err);
        return;
      }
      console.log('Message sent:', response?.getStatus());
    });

    setNewMessage('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) sendMessage();
  };

  useEffect(() => {
    messageRef.current?.scrollTo({ top: messageRef.current.scrollHeight });
  }, [messages]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-gray-100">
      <h1 className="mb-4 text-2xl font-bold">채팅방</h1>
      <div className="w-full max-w-lg rounded bg-white p-4 shadow-lg">
        <div
          className="mb-4 h-64 overflow-y-auto rounded border border-gray-300 p-2"
          ref={messageRef}
        >
          {messages.map((msg, index) =>
            msg.type === 'system' ? (
              <div key={index} className="my-2 text-center">
                <span className="rounded bg-gray-200 px-2 py-1 text-sm text-gray-600">
                  {msg.message}
                </span>
              </div>
            ) : (
              <div key={index} className="mb-2">
                <strong>{msg.nickname}:</strong> {msg.message}{' '}
                <span className="text-xs text-gray-500">{msg.timestamp}</span>
              </div>
            ),
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            className="mr-2 flex-1 rounded border border-gray-300 p-2"
            placeholder="메시지를 입력하세요"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
          >
            보내기
          </button>
        </form>
      </div>
    </div>
  );
}
