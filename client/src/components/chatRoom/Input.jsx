import React, { useState } from 'react';

export default function Input() {
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  return (
    <>
      <input
        type='text'
        className='mb-4 p-2 border border-gray-300 rounded'
        value={message}
        onChange={handleInputChange}
      />
    </>
  );
}
