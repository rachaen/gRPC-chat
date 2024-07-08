import React, { useRef } from 'react';
// import { UserServiceClient } from '../server_grpc_web_pb';
import { useStore } from '../store/store';

// const client = new UserServiceClient('http://localhost:8080', null, null);

export default function Join() {
  const inputRef = useRef();
  const updateNickname = useStore((state) => state.updateNickname);

  const handleSubmit = () => {
    const _nickname = inputRef.current.value;
    updateNickname(_nickname);
  };

  return (
    <div className='flex flex-col items-center justify-center h-screen bg-gray-100'>
      <h1 className='text-2xl font-bold mb-4'>채팅방 입장</h1>
      <input
        type='text'
        className='mb-4 p-2 border border-gray-300 rounded'
        placeholder='닉네임을 입력하세요'
        ref={inputRef}
      />
      <button onClick={handleSubmit} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>
        입장하기
      </button>
    </div>
  );
}
