# gRPC-Web 게이트웨이: Envoy 없이 가능한가? / 대안 / Envoy 사용법

## 한 줄 요약

- **지금처럼 브라우저에서 `grpc-web` 생성 클라이언트를 쓰는 구조**라면, 브라우저와 gRPC 서버 사이에 **“gRPC-Web → gRPC” 변환 계층**이 **반드시** 필요합니다.  
  Envoy는 그중 **가장 흔한 구현**일 뿐이고, **같은 역할을 하는 다른 프로그램**으로 바꿀 수는 있습니다.
- **Envoy(또는 동급 게이트웨이) 없이** 가려면, **브라우저가 gRPC-Web을 쓰지 않게** 설계를 바꿔야 합니다. 대표적으로 **서버(BFF)가 gRPC만 호출**하고, 브라우저는 **일반 HTTP(fetch)** 만 쓰는 방식입니다.

---

## 1. 왜 게이트웨이가 필요한가

| 구간 | 프로토콜 |
|------|-----------|
| 브라우저 ↔ 게이트웨이 | **gRPC-Web** (HTTP 기반, 브라우저가 처리 가능한 형태) |
| 게이트웨이 ↔ Node gRPC 서버 | **gRPC** (HTTP/2, `@grpc/grpc-js` 가 듣는 형태) |

브라우저는 보안·API 제약 때문에 **순수 gRPC(50051 같은 포트에 직접 붙기)** 를 앱에서 그대로 쓰기 어렵고, 생성된 **grpc-web** 코드는 **텍스트/바이너리 모드 gRPC-Web**을 쓰므로 **중간 변환기**가 필요합니다.

---

## 2. Envoy 없이 가는 방법 (우회·대안)

### A) 서버 사이드 BFF (구조 변경 — 게이트웨이 “바이너리”는 없음)

```mermaid
flowchart LR
  B[브라우저]
  Next[Next API Route 또는 Express]
  Grpc[gRPC 서버 :50051]
  B -->|fetch REST/JSON| Next
  Next -->|@grpc/grpc-js| Grpc
```

- **장점:** 로컬에서 `envoy` 프로세스를 안 띄워도 됨. CORS·게이트웨이 설정 부담이 줄어듦.
- **단점:** 프론트는 **REST(또는 SSE/WebSocket)** 로 새로 맞춰야 하고, **proto 계약을 HTTP API로 감싸는** 백엔드 코드를 추가로 작성해야 합니다. (학습 목적이 “순수 gRPC-Web”이면 설계가 달라짐.)

### B) 브라우저 UI 없이 백엔드만 검증

- **`grpcurl`** 같은 도구로 `localhost:50051` 에 직접 호출 → **Envoy 불필요**.
- 또는 **Node 스크립트**에서 `@grpc/grpc-js` 클라이언트만 사용 → **Envoy 불필요**.  
  (다만 **웹 페이지**에서 채팅하려면 결국 A 또는 게이트웨이가 필요합니다.)

### C) Envoy 대신 “다른” gRPC-Web 프록시

역할은 Envoy와 동일하게 **gRPC-Web ↔ gRPC** 변환입니다.

- 과거에 쓰이던 **grpcwebproxy** 계열(Go 등) — 프로젝트 상태·유지보수는 직접 확인 필요.
- **Traefik / nginx** 등에서 gRPC 관련 설정으로 비슷한 구성을 하는 경우도 있으나, **학습·로컬**에서는 Envoy가 문서·예제가 가장 많습니다.

**정리:** “`envoy` 명령만 피하고 싶다”면 **Docker로 Envoy 이미지**를 띄우는 것도 같은 계열이지만, **설치형 바이너리** 대신 **컨테이너**로 통일할 수는 있습니다.

---

## 3. Envoy 게이트웨이 사용법 (이 저장소 기준)

설정 파일: **`envoy/envoy.yaml`**

| 항목 | 값 |
|------|-----|
| gRPC-Web 리스너 | `0.0.0.0:8080` |
| 업스트림(gRPC 서버) | `127.0.0.1:50051` |
| (옵션) 관리 포트 | yaml 상단 `9901` |

### 3.1 사전 조건

1. **Node gRPC 서버가 먼저** `50051` 에서 떠 있어야 합니다. (`npm run grpc:dev`)
2. 그 다음 **Envoy**를 띄웁니다.

### 3.2 바이너리로 실행 (가장 단순)

저장소 **루트**에서:

```bash
envoy -c envoy/envoy.yaml
```

Windows에서 `envoy` 가 PATH에 없으면 [Envoy 릴리스](https://github.com/envoyproxy/envoy/releases) 등에서 OS에 맞는 빌드를 받아 PATH에 두거나, 실행 파일 전체 경로로 지정합니다.

설정 파일을 **절대 경로**로 주는 예:

```powershell
envoy -c "D:\경로\gRPC-chat\envoy\envoy.yaml"
```

### 3.3 Docker로 실행

호스트에서 gRPC 서버를 돌리는 경우, 컨테이너 안의 `127.0.0.1`은 **호스트가 아닙니다**.  
아래 중 하나를 택합니다.

- **권장(로컬 학습):** Envoy도 **호스트**에서 바이너리로 실행 (`127.0.0.1:50051` 유지).
- **Docker를 쓸 때:** `envoy.yaml` 의 클러스터 주소를 **`host.docker.internal`** (Windows/Mac) 또는 Linux의 `host-gateway` 등 **호스트를 가리키는 주소**로 바꾼 복사본을 사용합니다.

PowerShell 예 (설정이 호스트 gRPC에 맞게 수정된 yaml을 쓴다고 가정):

```powershell
cd D:\경로\gRPC-chat\gRPC-chat
docker run --rm -p 8080:8080 `
  -v "${PWD}/envoy/envoy.yaml:/etc/envoy/envoy.yaml:ro" `
  envoyproxy/envoy:v1.31-latest `
  envoy -c /etc/envoy/envoy.yaml
```

### 3.4 `envoy -c ...` 했는데 터미널에 아무것도 안 나올 때

**대부분 정상입니다.** Envoy는 기본적으로 **포그라운드에서 조용히 대기**하는 경우가 많아서, 성공해도 **한 줄 로그도 없이 커서만 멈춘 것처럼** 보일 수 있습니다. 이 상태는 **서버가 떠 있는 것**이고, 종료하려면 **Ctrl+C** 입니다.

**정말로 떠 있는지 확인 (Windows PowerShell 예시):**

```powershell
# 8080 리스너(이 저장소 yaml 기준 gRPC-Web 포트)
netstat -ano | findstr :8080

# (선택) 관리 포트 — envoy.yaml 상단에 9901 로 정의됨
netstat -ano | findstr :9901
```

`LISTENING` 이 보이면 Envoy가 포트를 잡은 것입니다.

**바로 꺼졌거나 에러만 한 줄 나온 경우:**

- **실행 위치**: `envoy -c envoy/envoy.yaml` 은 **저장소 루트**에서 실행해야 상대 경로가 맞습니다. 다른 폴더면 절대 경로로 지정하세요.
- **바이너리 확인**: `envoy --version` 이 되는지 확인합니다.
- **설정 검증**: 로그 레벨을 올려 원인을 봅니다.

  ```bash
  envoy -c envoy/envoy.yaml -l info
  ```

  또는 `debug` 까지 올리면 더 자세합니다.

### 3.4.1 로그가 어려울 때 — 한 줄만 보면 되는 것

- **`yaml-cpp: error at line X ... end of sequence not found`**  
  → 설정 파일 **YAML 문법(들여쓰기)이 깨진 것**입니다. `listeners` / `clusters` 가 `static_resources` **안**에 들어가야 하는데, 예전 예제처럼 맨 앞줄에 나란히 쓰면 파서가 망가집니다. 저장소의 `envoy/envoy.yaml` 최신본을 쓰세요.

- **`Didn't find ... grpc_web ... type URL: ''`**  
  → `http_filters` 항목마다 **`typed_config` + `@type`** 이 있어야 하는데, **파일이 예전 버전**이거나 **들여쓰기/CRLF** 로 `typed_config` 가 빠진 것처럼 파싱된 경우입니다. `git pull` 후 `grep ENVOY_CONFIG_VERIFY envoy/envoy.yaml` 로 최신인지 확인하고, `bash scripts/check-envoy-yaml.sh` 로 `@type` 이 세 줄 다 나오는지 봅니다 (Python3 + PyYAML).

- **`At least one of --config-path ... should be non-empty`**  
  → `-c` 뒤에 경로가 비었거나, `sudo` 등으로 경로가 빠졌을 때입니다. `envoy --config-path "$PWD/envoy/envoy.yaml"` 처럼 **절대 경로**를 권장합니다.

### 3.5 동작 확인 (간단)

- 브라우저/프론트의 **gRPC-Web base URL** 은 **`http://localhost:8080`** (Envoy) 이어야 합니다.  
  `http://localhost:50051` 은 브라우저+gRPC-Web 조합과 맞지 않는 경우가 많습니다.

### 3.6 자주 나는 문제

- **`EADDRINUSE` (50051)** → gRPC 서버가 이미 떠 있거나 다른 프로세스 점유. [03_LOCAL_RUN.md](./03_LOCAL_RUN.md) 트러블슈팅 참고.
- **Envoy는 떴는데 프론트만 오류** → gRPC 서버 미기동, 또는 yaml 업스트림 포트 불일치, 또는 프론트가 Envoy가 아닌 50051을 가리킴.

---

## 4. 문서 간 연결

- 전체 실행 순서: [03_LOCAL_RUN.md](./03_LOCAL_RUN.md)
- 설계 개요: [01_PROJECT_DESIGN.md](./01_PROJECT_DESIGN.md)
