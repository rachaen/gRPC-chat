/**
 * 채팅 메모리 허브: 메시지·입장·퇴장 이벤트를 모으고,
 * 연결된 gRPC 서버 스트림(ServerWritableStream)에 브로드캐스트합니다.
 *
 * TypeScript 메모:
 * - `Set<T>` : 중복 없는 집합. 스트림을 등록/해제할 때 사용합니다.
 * - `export type X = { ... }` : 런타임 값 없이 “타입만” export (인터페이스와 비슷).
 * - 제네릭 `<T>` : 함수/타입에 “나중에 정해질 타입”을 넘길 때 씁니다.
 */

import type * as grpc from '@grpc/grpc-js';
import { logError, logInfo, logWarn } from './logger.js';

export type ChatMessage = { username: string; text: string };
export type UserJoinEvt = { username: string };
export type UserLeaveEvt = { username: string };

const SCOPE = 'chatHub';

/** 지금까지 온 메시지(재접속 시 과거부터 보여줄 때 사용) */
const messages: ChatMessage[] = [];
const joins: UserJoinEvt[] = [];
const leaves: UserLeaveEvt[] = [];

/** 현재 살아 있는 스트림 구독자들 */
const messageStreams = new Set<grpc.ServerWritableStream<unknown, ChatMessage>>();
const joinStreams = new Set<grpc.ServerWritableStream<unknown, UserJoinEvt>>();
const leaveStreams = new Set<grpc.ServerWritableStream<unknown, UserLeaveEvt>>();

function cleanupStream<T>(
  set: Set<grpc.ServerWritableStream<unknown, T>>,
  call: grpc.ServerWritableStream<unknown, T>,
) {
  set.delete(call);
}

function safeWrite<T>(
  stream: grpc.ServerWritableStream<unknown, T>,
  payload: T,
  kind: 'message' | 'join' | 'leave',
  onRemove: () => void,
): void {
  try {
    stream.write(payload);
  } catch (e) {
    // 클라이언트가 끊긴 뒤 write 하면 여기로 올 수 있습니다.
    logError(SCOPE, `스트림으로 전송 실패 (${kind})`, e, { removed: true });
    onRemove();
  }
}

export function addMessage(msg: ChatMessage): void {
  messages.push(msg);
  for (const stream of messageStreams) {
    safeWrite(stream, msg, 'message', () => messageStreams.delete(stream));
  }
}

export function attachStreamMessages(call: grpc.ServerWritableStream<unknown, ChatMessage>): void {
  try {
    for (const m of messages) {
      call.write(m);
    }
  } catch (e) {
    logError(SCOPE, 'StreamMessages: 과거 메시지 replay 중 오류', e);
    try {
      call.destroy(e as Error);
    } catch {
      /* ignore */
    }
    return;
  }

  messageStreams.add(call);
  logInfo(SCOPE, 'StreamMessages 구독 시작', { subscribers: messageStreams.size });

  const detach = () => {
    cleanupStream(messageStreams, call);
    logInfo(SCOPE, 'StreamMessages 구독 종료', { subscribers: messageStreams.size });
  };
  call.on('cancelled', detach);
  call.on('close', detach);

  call.on('error', (err: Error) => {
    logWarn(SCOPE, 'StreamMessages 스트림 error 이벤트', { message: err?.message });
    detach();
  });
}

export function notifyUserJoin(username: string): void {
  const evt: UserJoinEvt = { username };
  joins.push(evt);
  for (const stream of joinStreams) {
    safeWrite(stream, evt, 'join', () => joinStreams.delete(stream));
  }
}

export function attachNotifyUserJoin(call: grpc.ServerWritableStream<unknown, UserJoinEvt>): void {
  try {
    for (const j of joins) {
      call.write(j);
    }
  } catch (e) {
    logError(SCOPE, 'NotifyUserJoin: replay 중 오류', e);
    try {
      call.destroy(e as Error);
    } catch {
      /* ignore */
    }
    return;
  }

  joinStreams.add(call);
  const detach = () => cleanupStream(joinStreams, call);
  call.on('cancelled', detach);
  call.on('close', detach);
  call.on('error', (err: Error) => {
    logWarn(SCOPE, 'NotifyUserJoin 스트림 error', { message: err?.message });
    detach();
  });
}

export function notifyUserLeave(username: string): void {
  const evt: UserLeaveEvt = { username };
  leaves.push(evt);
  for (const stream of leaveStreams) {
    safeWrite(stream, evt, 'leave', () => leaveStreams.delete(stream));
  }
}

export function attachNotifyUserLeave(call: grpc.ServerWritableStream<unknown, UserLeaveEvt>): void {
  try {
    for (const l of leaves) {
      call.write(l);
    }
  } catch (e) {
    logError(SCOPE, 'NotifyUserLeave: replay 중 오류', e);
    try {
      call.destroy(e as Error);
    } catch {
      /* ignore */
    }
    return;
  }

  leaveStreams.add(call);
  const detach = () => cleanupStream(leaveStreams, call);
  call.on('cancelled', detach);
  call.on('close', detach);
  call.on('error', (err: Error) => {
    logWarn(SCOPE, 'NotifyUserLeave 스트림 error', { message: err?.message });
    detach();
  });
}
