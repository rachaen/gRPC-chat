/**
 * 서버 전역에서 쓰는 아주 작은 로거입니다.
 * 나중에 winston/pino 등으로 바꿔도, 여기만 수정하면 됩니다.
 */

function ts(): string {
  return new Date().toISOString();
}

/** 일반 정보(기동 완료, RPC 성공 흐름 등) */
export function logInfo(scope: string, message: string, meta?: Record<string, unknown>): void {
  if (meta && Object.keys(meta).length > 0) {
    console.info(`[${ts()}] [INFO] [${scope}] ${message}`, meta);
  } else {
    console.info(`[${ts()}] [INFO] [${scope}] ${message}`);
  }
}

/** 경고(복구 가능한 비정상, 빈 입력 등) */
export function logWarn(scope: string, message: string, meta?: Record<string, unknown>): void {
  if (meta && Object.keys(meta).length > 0) {
    console.warn(`[${ts()}] [WARN] [${scope}] ${message}`, meta);
  } else {
    console.warn(`[${ts()}] [WARN] [${scope}] ${message}`);
  }
}

/** 오류(스택까지 남기고 싶을 때 err 전달) */
export function logError(scope: string, message: string, err?: unknown, meta?: Record<string, unknown>): void {
  const base = `[${ts()}] [ERROR] [${scope}] ${message}`;
  if (meta && Object.keys(meta).length > 0) {
    console.error(base, meta, err ?? '');
  } else {
    console.error(base, err ?? '');
  }
  if (err instanceof Error && err.stack) {
    console.error(err.stack);
  }
}
