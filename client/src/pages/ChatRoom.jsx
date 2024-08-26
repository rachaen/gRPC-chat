import React, { useState, useEffect, useRef } from 'react';
import { MessageServiceClient } from '../server_grpc_web_pb';
import { Message, Empty } from '../server_pb';
import { useStore } from '../store/store';


const client = new MessageServiceClient('http://localhost:9001', null, null);
//const client = new MessageServiceClient('http://localhost:50051', null, null);

export default function ChatRoom() {
  /*   const [messages, setMessages] = useState([
    { type: 'system', message: '강아지님이 입장하셨습니다.', timestamp: '16:30' },
    { type: 'message', nickname: '강아지', message: '안녕하세요!', timestamp: '16:31' },
    { type: 'message', nickname: '고양이', message: '반갑습니다!', timestamp: '16:32' },
    { type: 'system', message: '고양이님이 퇴장하셨습니다.', timestamp: '16:32' },
  ]); */
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messageRef = useRef();
  const nickname = useStore((state) => state.nickname);

  useEffect(() => {
    const streamMessages = new Empty();
    const stream = client.streamMessages(streamMessages, {});

    stream.on('data', (response) => {
      const newMsg = {
        type: 'message',
        nickname: response.getUsername(),
        message: response.getText(),
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prevMessages) => [...prevMessages, newMsg]);
    });

    stream.on('error', (err) => {
      console.error('Error:', err);
    });

    const userJoinStream = client.notifyUserJoin(new Empty(), {});
    userJoinStream.on('data', (response) => {
      const joinMsg = {
        type: 'system',
        message: `${response.getUsername()}님이 입장하셨습니다.`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prevMessages) => [...prevMessages, joinMsg]);
    });

    const userLeaveStream = client.notifyUserLeave(new Empty(), {});
    userLeaveStream.on('data', (response) => {
      const leaveMsg = {
        type: 'system',
        message: `${response.getUsername()}님이 퇴장하셨습니다.`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prevMessages) => [...prevMessages, leaveMsg]);
    });

    return () => {
      stream.cancel();
      userJoinStream.cancel();
      userLeaveStream.cancel();
    };
  }, []);

  const sendMessage = () => {
    const message = new Message();
    message.setUsername(nickname);
    message.setText(newMessage);

    client.sendMessage(message, {}, (err, response) => {
      if (err) {
        console.error('Error sending message:', err);
        return;
      }
      console.log('Message sent:', response.getStatus());
    });

    setNewMessage('');
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage();
    }
  };

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollTop = messageRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className='flex flex-col items-center justify-center h-screen bg-gray-100'>
      <h1 className='text-2xl font-bold mb-4'>채팅방</h1>
      <div className='w-full max-w-lg p-4 bg-white rounded shadow-lg'>
        <div className='mb-4 h-64 overflow-y-auto border border-gray-300 p-2 rounded' ref={messageRef}>
          {messages.map((msg, index) =>
            msg.type === 'system' ? (
              <div key={index} className='text-center my-2'>
                <span className='bg-gray-200 text-gray-600 px-2 py-1 rounded text-sm'>{msg.message}</span>
              </div>
            ) : (
              <div key={index} className='mb-2'>
                <strong>{msg.nickname}:</strong> {msg.message}{' '}
                <span className='text-gray-500 text-xs'>{msg.timestamp}</span>
              </div>
            ),
          )}
        </div>
        <form onSubmit={handleSubmit} className='flex'>
          <input
            type='text'
            className='flex-1 p-2 border border-gray-300 rounded mr-2'
            placeholder='메시지를 입력하세요'
            value={newMessage}
            onChange={handleInputChange}
          />
          <button type='submit' className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>
            보내기
          </button>
        </form>
      </div>
    </div>
  );
}
