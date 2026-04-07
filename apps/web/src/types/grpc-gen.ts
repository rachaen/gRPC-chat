export {};

declare module '@/gen/server_pb' {
  export class Empty {}

  export class UserInfo {
    setUsername(value: string): UserInfo;
  }

  export class Message {
    getUsername(): string;
    getText(): string;
    setUsername(value: string): Message;
    setText(value: string): Message;
  }
}

declare module '@/gen/server_grpc_web_pb' {
  export class UserServiceClient {
    constructor(hostname: string, credentials: null, options: null);
    login(
      request: import('@/gen/server_pb').UserInfo,
      metadata: object | null,
      callback: (err: { message: string } | null, response: { getStatus: () => string } | null) => void,
    ): void;
  }

  export class MessageServiceClient {
    constructor(hostname: string, credentials: null, options: null);
    sendMessage(
      request: import('@/gen/server_pb').Message,
      metadata: object | null,
      callback: (err: unknown, response: { getStatus: () => string } | null) => void,
    ): void;
    streamMessages(
      request: import('@/gen/server_pb').Empty,
      metadata?: object | null,
    ): {
      on(event: 'data', cb: (r: { getUsername: () => string; getText: () => string }) => void): void;
      on(event: 'error', cb: (err: unknown) => void): void;
      cancel(): void;
    };
    notifyUserJoin(
      request: import('@/gen/server_pb').Empty,
      metadata?: object | null,
    ): {
      on(event: 'data', cb: (r: { getUsername: () => string }) => void): void;
      cancel(): void;
    };
    notifyUserLeave(
      request: import('@/gen/server_pb').Empty,
      metadata?: object | null,
    ): {
      on(event: 'data', cb: (r: { getUsername: () => string }) => void): void;
      cancel(): void;
    };
  }
}
