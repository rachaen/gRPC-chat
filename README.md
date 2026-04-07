# gRPC 채팅 (TypeScript 백엔드 + Next.js)

## 구성

| 구성요소 | 경로 | 역할 |
|----------|------|------|
| 공통 proto | `proto/server.proto` | 서비스·메시지 정의 |
| gRPC 서버 | `packages/grpc-server` | Node.js + `@grpc/grpc-js` |
| 웹 | `apps/web` | Next.js + gRPC-Web 클라이언트 |
| Envoy | `envoy/envoy.yaml` | gRPC-Web → gRPC 변환 (리스너 **8080** → 업스트림 **50051**) |

백엔드는 **`proto/` · `packages/grpc-server`(TypeScript)** 만 사용합니다. (구 Python `server/` 디렉터리는 제거됨.)

## 로컬 실행 (요약)

흐름: **`웹 → Envoy(8080, gRPC-Web) → gRPC 서버(50051)`** — 세 프로세스를 동시에 띄웁니다.

```bash
npm install          # 최초 1회
npm run grpc:dev     # 터미널 1
# 터미널 2: envoy -c envoy/envoy.yaml
copy apps\web\.env.local.example apps\web\.env.local   # Next 최초 1회 (Windows)
npm run web:dev      # 터미널 3 → http://localhost:3001 (3000 점유 시 충돌 방지)
```

**상세·Windows 명령·Docker Envoy 주의·포트 충돌(`EADDRINUSE`)·CRA 실행** 은 **[docs/03_LOCAL_RUN.md](./docs/03_LOCAL_RUN.md)** 를 참고하세요.  
**Envoy 없이 할 수 있는지 / 대안 / Envoy 사용법** 은 **[docs/04_ENVOY_ALTERNATIVES.md](./docs/04_ENVOY_ALTERNATIVES.md)** 를 참고하세요.  
**Docker Desktop 없이(WSL2 전용·무료 Docker Engine·compose)** 는 **[docs/05_WSL2_DOCKER_FREE.md](./docs/05_WSL2_DOCKER_FREE.md)** 와 루트 **`docker-compose.yml`** 을 참고하세요.  
WSL에서 `envoy` 가 없으면 저장소 루트에서 **`bash scripts/install-envoy-wsl.sh`** 로 바이너리 설치.

## npm 스크립트 (루트)

- `npm run grpc:dev` — gRPC 서버 개발 모드 (`tsx watch`)
- `npm run web:dev` — Next.js 개발 서버
- `npm test` — gRPC 서버 `tsc` + 웹 `lint`·`build` (단위 테스트 프레임워크 없을 때 CI/로컬 검증용)

## 참고

- 로그인 성공 시 서버는 `UserResponse.status`로 `"success"`를 반환합니다 (`apps/web` 입장 플로우와 맞춤).
- 메시지·입장 스트림은 메모리 브로드캐스트로 동작합니다 (재시작 시 초기화).

- 실행: [docs/03_LOCAL_RUN.md](./docs/03_LOCAL_RUN.md)  
- Envoy·대안: [docs/04_ENVOY_ALTERNATIVES.md](./docs/04_ENVOY_ALTERNATIVES.md)  
- WSL2·무료 Docker: [docs/05_WSL2_DOCKER_FREE.md](./docs/05_WSL2_DOCKER_FREE.md)  
- 설계: [docs/01_PROJECT_DESIGN.md](./docs/01_PROJECT_DESIGN.md), [docs/02_MIGRATION_SCOPE.md](./docs/02_MIGRATION_SCOPE.md)
