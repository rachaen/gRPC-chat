import React, { useState, useEffect, useRef } from 'react';

export default function ChatRoom({ nickname }) {
  const [messages, setMessages] = useState([
    { nickname: '고양이', message: '안녕하세요!', timestamp: '16:31' },
    { nickname: '강아지', message: '반갑습니다!', timestamp: '16:32' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const messageRef = useRef();

  const sendMessage = () => {
    alert(`[${nickname}]: ${newMessage}\n 시간: ${new Date().toISOString()}`);
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
          {messages.map((msg, index) => (
            <div key={index} className='mb-2'>
              <strong>{msg.nickname}:</strong> {msg.message}{' '}
              <span className='text-gray-500 text-xs'>{msg.timestamp}</span>
            </div>
          ))}
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
