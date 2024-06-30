import React, { useState } from 'react';

export default function Join() {
  const [nickname, setNickname] = useState('');

  const handleInputChange = (e) => {
    setNickname(e.target.value);
  };

  const handleSubmit = () => {
    alert(`Joining as: ${nickname}`);
  };

  return (
    <div className='flex flex-col items-center justify-center h-screen bg-gray-100'>
      <h1 className='text-2xl font-bold mb-4'>Join Chat As...</h1>
      <input
        type='text'
        className='mb-4 p-2 border border-gray-300 rounded'
        placeholder='닉네임을 입력하세요'
        value={nickname}
        onChange={handleInputChange}
      />
      <button onClick={handleSubmit} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>
        Join
      </button>
    </div>
  );
}
