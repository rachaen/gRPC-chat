/**
 * gRPC 서버 진입점입니다.
 *
 * TypeScript / Node 메모:
 * - `import type { X }` : 타입만 가져옵니다(컴파일 후 JS에 남지 않음).
 * - `function f(): void` : 반환값이 없음을 타입으로 명시.
 * - `A as B` : 타입 단언(“여기서는 B로 취급해”) — proto 로딩 결과처럼 any에 가까울 때만 최소한으로 사용.
 * - `??` : null/undefined일 때만 오른쪽 값 사용 (`||`와 다름: 0, '' 은 유지).
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as grpc from '@grpc/grpc-js';
import type { sendUnaryData } from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import {
  addMessage,
  attachNotifyUserJoin,
  attachNotifyUserLeave,
  attachStreamMessages,
  notifyUserJoin,
  notifyUserLeave,
} from './chatHub.js';
import { logError, logInfo, logWarn } from './logger.js';

const SCOPE = 'grpc-server';

// ESM에서는 예전 CommonJS의 __dirname이 없어서, 현재 파일 경로로부터 계산합니다.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// packages/grpc-server/src → 저장소 루트(…/gRPC-chat)까지 세 단계 위로
const repoRoot = path.resolve(__dirname, '../../..');
const PROTO_PATH = path.join(repoRoot, 'proto/server.proto');

function loadServices(): Record<string, unknown> {
  try {
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true, // proto 필드 이름 그대로(username 등)
      longs: String,
      enums: String,
      defaults: true, // 없는 필드도 기본값으로 채움
      oneofs: true,
      includeDirs: [path.dirname(PROTO_PATH)],
    });
    return grpc.loadPackageDefinition(packageDefinition) as Record<string, unknown>;
  } catch (e) {
    logError(SCOPE, `proto 로드 실패: ${PROTO_PATH}`, e);
    throw e;
  }
}

/** gRPC 표준 오류 객체로 바꿔서 클라이언트가 code/message로 구분할 수 있게 합니다. */
function toServiceError(code: grpc.status, message: string): grpc.ServiceError {
  return { name: 'ServiceError', message, code, details: '', metadata: new grpc.Metadata() };
}

function parsePort(raw: string | undefined, fallback: number): number {
  const n = Number(raw ?? fallback);
  if (!Number.isFinite(n) || n < 1 || n > 65535) {
    logWarn(SCOPE, `GRPC_PORT 값이 이상합니다. 기본값 ${fallback} 사용`, { raw });
    return fallback;
  }
  return n;
}

function main(): void {
  let root: Record<string, unknown>;
  try {
    root = loadServices();
  } catch {
    process.exit(1);
    return;
  }

  const serverPkg = root.server as Record<string, grpc.ServiceClientConstructor | undefined>;
  const UserService = serverPkg.UserService;
  const MessageService = serverPkg.MessageService;

  if (!UserService?.service || !MessageService?.service) {
    logError(SCOPE, 'proto에서 server.UserService / server.MessageService를 찾지 못했습니다.', undefined, {
      rootKeys: Object.keys(root),
    });
    throw new Error('Failed to load server.UserService / server.MessageService from proto');
  }

  /**
   * Unary RPC: 요청 1번 → 응답 1번. 콜백 `cb`의 첫 인자가 에러(null이면 성공).
   * `sendUnaryData<Response>` : 성공 시 보내는 응답 바디 타입 힌트.
   */
  const userImpl: grpc.UntypedServiceImplementation = {
    Register: (
      call: grpc.ServerUnaryCall<{ username: string }, { status: string }>,
      cb: sendUnaryData<{ status: string }>,
    ) => {
      try {
        const username = call.request?.username?.trim() ?? '';
        logInfo(SCOPE, 'Register', { username: username || '(empty)' });
        if (!username) {
          cb(toServiceError(grpc.status.INVALID_ARGUMENT, 'username is required'));
          return;
        }
        cb(null, { status: 'User registered' });
      } catch (e) {
        logError(SCOPE, 'Register 처리 중 예외', e);
        cb(toServiceError(grpc.status.INTERNAL, e instanceof Error ? e.message : 'internal error'));
      }
    },
    Login: (
      call: grpc.ServerUnaryCall<{ username: string }, { status: string }>,
      cb: sendUnaryData<{ status: string }>,
    ) => {
      try {
        const username = call.request?.username?.trim() ?? '';
        logInfo(SCOPE, 'Login', { username: username || '(empty)' });
        if (!username) {
          cb(toServiceError(grpc.status.INVALID_ARGUMENT, 'username is required'));
          return;
        }
        notifyUserJoin(username);
        cb(null, { status: 'success' });
      } catch (e) {
        logError(SCOPE, 'Login 처리 중 예외', e);
        cb(toServiceError(grpc.status.INTERNAL, e instanceof Error ? e.message : 'internal error'));
      }
    },
    Logout: (
      call: grpc.ServerUnaryCall<{ username: string }, { status: string }>,
      cb: sendUnaryData<{ status: string }>,
    ) => {
      try {
        const username = call.request?.username?.trim() ?? '';
        logInfo(SCOPE, 'Logout', { username: username || '(empty)' });
        if (!username) {
          cb(toServiceError(grpc.status.INVALID_ARGUMENT, 'username is required'));
          return;
        }
        notifyUserLeave(username);
        cb(null, { status: 'User logged out' });
      } catch (e) {
        logError(SCOPE, 'Logout 처리 중 예외', e);
        cb(toServiceError(grpc.status.INTERNAL, e instanceof Error ? e.message : 'internal error'));
      }
    },
  };

  const messageImpl: grpc.UntypedServiceImplementation = {
    SendMessage: (
      call: grpc.ServerUnaryCall<{ username: string; text: string }, { status: string }>,
      cb: sendUnaryData<{ status: string }>,
    ) => {
      try {
        const username = call.request?.username?.trim() ?? '';
        const text = call.request?.text?.trim() ?? '';
        if (!username || !text) {
          logWarn(SCOPE, 'SendMessage: 빈 username 또는 text', { hasUser: !!username, hasText: !!text });
          cb(toServiceError(grpc.status.INVALID_ARGUMENT, 'username and text are required'));
          return;
        }
        addMessage({ username, text });
        cb(null, { status: 'Message received' });
      } catch (e) {
        logError(SCOPE, 'SendMessage 처리 중 예외', e);
        cb(toServiceError(grpc.status.INTERNAL, e instanceof Error ? e.message : 'internal error'));
      }
    },
    /**
     * Server streaming: 클라이언트 요청 1번 → 서버가 여러 번 push.
     * 스트림은 chatHub에서 관리합니다.
     */
    StreamMessages: (call: grpc.ServerWritableStream<Record<string, unknown>, { username: string; text: string }>) => {
      try {
        attachStreamMessages(call);
      } catch (e) {
        logError(SCOPE, 'StreamMessages 핸들러 예외', e);
        try {
          call.destroy(e instanceof Error ? e : new Error(String(e)));
        } catch {
          /* ignore */
        }
      }
    },
    NotifyUserJoin: (call: grpc.ServerWritableStream<Record<string, unknown>, { username: string }>) => {
      try {
        attachNotifyUserJoin(call);
      } catch (e) {
        logError(SCOPE, 'NotifyUserJoin 핸들러 예외', e);
        try {
          call.destroy(e instanceof Error ? e : new Error(String(e)));
        } catch {
          /* ignore */
        }
      }
    },
    NotifyUserLeave: (call: grpc.ServerWritableStream<Record<string, unknown>, { username: string }>) => {
      try {
        attachNotifyUserLeave(call);
      } catch (e) {
        logError(SCOPE, 'NotifyUserLeave 핸들러 예외', e);
        try {
          call.destroy(e instanceof Error ? e : new Error(String(e)));
        } catch {
          /* ignore */
        }
      }
    },
  };

  const server = new grpc.Server();
  server.addService(UserService.service, userImpl);
  server.addService(MessageService.service, messageImpl);

  const port = parsePort(process.env.GRPC_PORT, 50051);
  const host = process.env.GRPC_HOST ?? '0.0.0.0';
  const bindAddr = `${host}:${port}`;

  server.bindAsync(bindAddr, grpc.ServerCredentials.createInsecure(), (err, boundPort) => {
    if (err) {
      logError(SCOPE, `bind 실패: ${bindAddr}`, err);
      process.exit(1);
      return;
    }
    logInfo(SCOPE, `리스닝 시작`, { bindAddr, boundPort, proto: PROTO_PATH });
  });
}

try {
  main();
} catch (e) {
  logError(SCOPE, 'main() 실행 중 치명적 오류 — 프로세스를 종료합니다.', e);
  process.exit(1);
}
