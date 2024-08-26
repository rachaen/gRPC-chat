import React, { useRef } from 'react';
import { useStore } from '../store/store';
import { useNavigate } from 'react-router-dom';

// Envoy가 gRPC를 HTTP로 변환하여 받아들일 엔드포인트
const ENVOY_API_URL = 'http://localhost:8080'; // Envoy의 URL

export default function Join() {
  const inputRef = useRef();
  const updateNickname = useStore((state) => state.updateNickname);
  const navigator = useNavigate();

  const handleSubmit = async () => {
    const _nickname = inputRef.current.value;
    updateNickname(_nickname);

    // HTTP 요청으로 전송
    try {
      const response = await fetch(`${ENVOY_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: _nickname }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        navigator('/chat');
      } else {
        alert('Login failed');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('An error occurred during login');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className='flex flex-col items-center justify-center h-screen bg-gray-100'>
      <h1 className='text-2xl font-bold mb-4'>채팅방 입장</h1>
      <input
        type='text'
        className='mb-4 p-2 border border-gray-300 rounded'
        placeholder='닉네임을 입력하세요'
        ref={inputRef}
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleSubmit} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>
        입장하기
      </button>
    </div>
  );
}

// import React, { useRef } from 'react';
// import { UserServiceClient } from '../server_grpc_web_pb';
// import { UserInfo } from '../server_pb';
// import { useStore } from '../store/store';
// import { useNavigate } from 'react-router-dom';
//
// const client = new UserServiceClient('http://localhost:9001', null, null);
// // const client = new UserServiceClient('http://localhost:50051', null, null);
//
// export default function Join() {
//   const inputRef = useRef();
//   const updateNickname = useStore((state) => state.updateNickname);
//   const navigator = useNavigate();
//
//   const handleSubmit = () => {
//     const _nickname = inputRef.current.value;
//     updateNickname(_nickname);
//     const userInfo = new UserInfo();
//     userInfo.setUsername(_nickname);
//
//     client.login(userInfo, {}, (err, response) => {
//       if (err) {
//         console.error(err.message);
//         return;
//       }
//       console.log(response.getStatus());
//       if (response.getStatus() === 'success') {
//         navigator('/chat');
//       } else {
//         alert('Login failed');
//       }
//     });
//   };
//
//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter') {
//       handleSubmit();
//     }
//   };
//
//   return (
//     <div className='flex flex-col items-center justify-center h-screen bg-gray-100'>
//       <h1 className='text-2xl font-bold mb-4'>채팅방 입장</h1>
//       <input
//         type='text'
//         className='mb-4 p-2 border border-gray-300 rounded'
//         placeholder='닉네임을 입력하세요'
//         ref={inputRef}
//         onKeyDown={handleKeyDown}
//       />
//       <button onClick={handleSubmit} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>
//         입장하기
//       </button>
//     </div>
//   );
// }