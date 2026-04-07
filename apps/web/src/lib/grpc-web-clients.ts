'use client';

import { MessageServiceClient, UserServiceClient } from '@/gen/server_grpc_web_pb';

/** 루프백 Envoy 직접 URL — 브라우저에서 쓰면 CORS 나므로 같은 출처 /grpc-web 으로 돌림 */
const LOOPBACK_ENVOY = /^https?:\/\/(localhost|127\.0\.0\.1):8080\/?$/i;

/**
 * 브라우저: 기본은 `/grpc-web`(Next → Envoy 프록시, CORS 없음).
 * `NEXT_PUBLIC_GRPC_WEB_URL` 이 루프백 8080 이거나 비어 있으면 위와 동일.
 * 그 외(다른 호스트/도메인 Envoy)만 직접 URL 사용.
 */
export function getGrpcWebBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_GRPC_WEB_URL?.trim();
  if (typeof window !== 'undefined') {
    if (!fromEnv || LOOPBACK_ENVOY.test(fromEnv)) {
      return `${window.location.origin}/grpc-web`;
    }
    return fromEnv;
  }
  if (fromEnv?.length) return fromEnv;
  return 'http://127.0.0.1:8080';
}

type UserClient = InstanceType<typeof UserServiceClient>;
type MsgClient = InstanceType<typeof MessageServiceClient>;

let userClient: UserClient | null = null;
let messageClient: MsgClient | null = null;

export function getUserServiceClient(): UserClient {
  if (!userClient) {
    // grpc-gen ambient 클래스와 codegen 인스턴스 타입이 어긋남
    userClient = new UserServiceClient(getGrpcWebBaseUrl(), null, null) as UserClient;
  }
  return userClient;
}

export function getMessageServiceClient(): MsgClient {
  if (!messageClient) {
    messageClient = new MessageServiceClient(getGrpcWebBaseUrl(), null, null) as MsgClient;
  }
  return messageClient;
}
