'use client';

import { useRouter } from 'next/navigation';
import { useRef, type KeyboardEvent } from 'react';
import { UserInfo } from '@/gen/server_pb';
import { getGrpcWebBaseUrl, getUserServiceClient } from '@/lib/grpc-web-clients';
import { useStore } from '@/store/store';

export function JoinPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const updateNickname = useStore((s) => s.updateNickname);
  const router = useRouter();

  const handleSubmit = () => {
    const nickname = inputRef.current?.value?.trim() ?? '';
    if (!nickname) return;

    updateNickname(nickname);
    const userInfo = new UserInfo();
    userInfo.setUsername(nickname);

    getUserServiceClient().login(userInfo, {}, (err, response) => {
      if (err) {
        // http status code: 0 = 브라우저가 응답을 못 받음(연결 거절·CORS·Envoy 미기동 등)
        const code = err && typeof err === 'object' && 'code' in err ? (err as { code: unknown }).code : undefined;
        console.error('[Login gRPC-Web]', {
          baseUrl: getGrpcWebBaseUrl(),
          message: err.message,
          code,
          err,
        });
        return;
      }
      if (response?.getStatus() === 'success') {
        router.push('/chat');
      } else {
        alert('Login failed');
      }
    });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-100">
      <h1 className="mb-4 text-2xl font-bold">채팅방 입장</h1>
      <input
        type="text"
        className="mb-4 rounded border border-gray-300 p-2"
        placeholder="닉네임을 입력하세요"
        ref={inputRef}
        onKeyDown={handleKeyDown}
      />
      <button
        type="button"
        onClick={handleSubmit}
        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
      >
        입장하기
      </button>
    </div>
  );
}
