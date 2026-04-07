# WSL2 / Docker Desktop 없이 개발하기

> **권장 플로우(Envoy는 Docker 안 씀):** 저장소를 **WSL2 Ubuntu 파일 시스템**에 clone 한 뒤, 같은 WSL 안에서 `npm run grpc:dev` + **Envoy Linux 바이너리**로 `envoy -c envoy/envoy.yaml` 만 실행합니다.  
> 이렇게 하면 `127.0.0.1:50051` 그대로 쓰면 되고, Windows 쪽 Docker Desktop은 필요 없습니다.

기업 환경에서 **Docker Desktop 유료**로 막혀 있을 때, 이 프로젝트를 돌리는 **무료** 루트를 정리합니다.

---

## 저장소 폴더가 어디인지 / `cd` 가 헷갈릴 때

채팅에서 **`~/여기/gRPC-chat`** 같은 말은 **“예시”**였습니다. **그대로 타이핑하는 경로가 아닙니다.**

- **`~`** : WSL에서 **내 홈 폴더** (`/home/우분투사용자이름` 과 같음)
- **`cd`** : 터미널의 **현재 작업 폴더**를 바꿈. `npm`·`envoy` 는 **지금 터미널이 서 있는 폴더** 기준으로 파일을 찾습니다.
- **저장소 루트** : 그 안에 `package.json`, `envoy/`, `proto/` 가 **바로 보이는** 폴더입니다.

### 아직 WSL 안에 프로젝트가 없다면 (= `git clone` 이 맞음)

WSL Ubuntu 터미널에서:

```bash
cd ~
git clone https://github.com/jje005/gRPC-chat.git
cd gRPC-chat
pwd
ls
```

`ls` 했을 때 `package.json`, `envoy`, `packages` 가 보이면 **지금 위치가 저장소 루트**입니다.  
이후 안내의 **`cd ...`** 는 매번 **이 루트로 들어온 뒤** 실행하면 됩니다:

```bash
cd ~/gRPC-chat
```

(다른 이름으로 clone 했다면 `cd ~/clone할때만든폴더이름` 입니다.)

### 이미 Windows `D:\...` 에만 있고 WSL에는 없다면

- **방법 1 (권장):** 위처럼 WSL 홈에서 **`git clone` 을 한 번 더** 해서 Linux 쪽에 두기 (속도·권한 문제 적음).
- **방법 2:** WSL에서 Windows 디스크 접근: `cd /mnt/d/00.Project/TEST/gRPC-chat/gRPC-chat` 처럼 **실제 경로**로 이동 (PC마다 다름). `ls` 로 `package.json` 있는지 확인.

### 내가 지금 어디 있는지 확인

```bash
pwd
ls
```

---

## Git에 Docker 이미지를 넣지 않는 이유

Docker 이미지는 수백 MB 단위라 **Git에 커밋하지 않습니다.**  
대신 저장소에는 **`docker-compose.yml` + `envoy/envoy.docker-host.yaml`** 만 두고, 실행 시 레지스트리에서 이미지를 **pull** 합니다(공개 이미지, 별도 과금 없음).

---

## 방법 A (가장 단순, 추천): WSL2 안에서만 돌리기 — **Docker 없음**

Windows는 **터미널만** 쓰고, **Node + Envoy 바이너리**를 전부 **WSL2 Ubuntu**에 둡니다.

### 1) WSL2 + Ubuntu 설치 (미설치인 경우)

PowerShell(관리자):

```powershell
wsl --install
```

재부팅 후 Ubuntu 실행, 사용자 생성.

### 2) Node.js (WSL)

[nvm](https://github.com/nvm-sh/nvm) 또는 [NodeSource](https://github.com/nodesource/distributions) 등으로 LTS 설치.

### 3) 저장소를 WSL 파일 시스템에 두기 (권장)

`\\wsl$\Ubuntu\home\<user>\projects\...` 처럼 **Linux 쪽 경로**에 clone 하면 I/O가 더 안정적입니다.

### 4) 의존성 & gRPC 서버 (WSL 터미널)

```bash
cd ~/gRPC-chat            # 예: 홈에서 clone 했다면 (본인 폴더 이름에 맞게)
npm install
npm run grpc:dev
```

### 5) Envoy 바이너리 (WSL, Docker 없이)

WSL Ubuntu에는 **기본으로 `envoy` 명령이 없습니다.** 아래 중 하나로 **한 번만** 설치합니다.

#### (권장) 저장소 스크립트로 설치

`curl` 이 있어야 합니다 (`sudo apt install -y curl`).

```bash
cd ~/gRPC-chat             # 저장소 루트 (clone 위치에 맞게 수정)
bash scripts/install-envoy-wsl.sh
```

기본으로 **v1.31.2** 의 `envoy-1.31.2-linux-x86_64` (Intel/AMD 64비트) 또는 **aarch64** 용 바이너리를 받아 **`/usr/local/bin/envoy`** 에 둡니다.  
버전을 바꾸려면:

```bash
ENVOY_VERSION=1.31.2 bash scripts/install-envoy-wsl.sh
```

설치 확인:

```bash
which envoy
envoy --version
```

#### 수동 설치

1. [Envoy Releases](https://github.com/envoyproxy/envoy/releases) → 원하는 버전 →  
   PC가 **x86_64** 이면 `envoy-x.y.z-linux-x86_64`, **ARM(일부 노트북)** 이면 `envoy-x.y.z-linux-aarch_64` 다운로드  
2. `chmod +x` 후 `sudo mv ./다운받은파일이름 /usr/local/bin/envoy`

#### (대안) snap 이 되는 환경이면

```bash
sudo snap install envoy
```

조직 정책에 따라 snap 이 막혀 있을 수 있습니다.

---

#### `envoy: command not found` 일 때

- **`which envoy`** 가 아무것도 안 나오면 → 위 설치를 아직 안 한 것입니다.
- 설치했는데도 안 되면 → 터미널을 **새로 열고** 다시 시도하거나, `echo $PATH` 에 `/usr/local/bin` 이 있는지 확인합니다.

**다른 터미널**에서 저장소 루트로 이동 후:

```bash
envoy -c envoy/envoy.yaml
```

이때 gRPC도 **같은 WSL**에서 떠 있으므로 `envoy.yaml` 의 **`127.0.0.1:50051`** 그대로 사용하면 됩니다.

### 6) 웹 (WSL 또는 Windows)

- **WSL에서** `npm run web:dev` → 브라우저(Windows)에서 `http://localhost:3001` 접속. (기본 포트는 `apps/web/package.json` 의 `-p` 값)  
  최신 Windows는 WSL 포트를 **localhost로 포워딩** 해 줍니다.

### 7) 프론트 환경 변수

`apps/web/.env.local` 의 `NEXT_PUBLIC_GRPC_WEB_URL` 은 **`http://localhost:8080`** (Envoy).

---

## `npm install` 이 `EISDIR` / `symlink` / `errno -4068` 일 때

**원인:** **Windows 쪽 `npm`(또는 Node)** 가 `\\wsl.localhost\...` 같은 경로로 패키지를 설치하려 할 때, 워크스페이스용 **심볼릭 링크**를 만들다가 실패하는 경우가 많습니다. 로그에 `C:\Users\...\npm-cache` 와 `wsl.localhost` 가 섞여 있으면 거의 이 케이스입니다.

**해결 (WSL 안에서만 Node/npm 쓰기):**

1. **시작 메뉴에서 “Ubuntu” 앱**을 직접 연다 (Cursor/VS Code 통합 터미널이 Windows용이면 혼선이 날 수 있음).
2. 아래로 **Linux npm** 인지 확인한다.

   ```bash
   which npm
   which node
   ```

   - 좋은 예: `/usr/bin/npm`, `$HOME/.nvm/versions/node/.../npm`
   - 나쁜 예: `/mnt/c/Program Files/nodejs/npm` → Windows Node를 쓰는 것. **WSL 전용 Node 설치 필요.**

3. WSL에 Node가 없거나 Windows 것만 있으면 [nvm](https://github.com/nvm-sh/nvm) 등으로 **WSL 안에** LTS 설치:

   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
   source ~/.bashrc
   nvm install --lts
   ```

4. 프로젝트 루트에서 **깨진 설치물 제거 후 재설치**:

   ```bash
   cd ~/gRPC-chat
   rm -rf node_modules apps/web/node_modules packages/grpc-server/node_modules package-lock.json
   npm install
   ```

5. 그래도 안 되면 **프로젝트를 `/mnt/c/...` 가 아니라 `~/...` (WSL 리눅스 디스크)** 에 두는 것을 권장합니다.

---

## `scripts/install-envoy-wsl.sh: No such file or directory`

저장소에 스크립트가 포함돼 있어야 합니다. **최신을 받은 뒤** 다시 실행하세요.

```bash
cd ~/gRPC-chat
git pull origin main
ls scripts/install-envoy-wsl.sh
bash scripts/install-envoy-wsl.sh
```

**당장 `git pull` 을 못 하면** (스크립트 없이) 수동으로 동일 바이너리를 받을 수 있습니다 (x86_64 기준):

```bash
curl -fL -o /tmp/envoy.bin "https://github.com/envoyproxy/envoy/releases/download/v1.31.2/envoy-1.31.2-linux-x86_64"
chmod +x /tmp/envoy.bin
sudo mv /tmp/envoy.bin /usr/local/bin/envoy
envoy --version
```

(ARM CPU면 `envoy-1.31.2-linux-aarch_64` 로 바꿉니다.)

---

## 방법 B: Docker **Desktop 없이** — WSL2 안에 **Docker Engine**만 설치

Docker Desktop이 아니라, **Ubuntu(WSL) 패키지**로 Docker를 올리는 방식입니다. (조직 정책에 따라 IT 승인이 필요할 수 있음.)

공식 가이드: [Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/)  
WSL2 Ubuntu에서 `docker.io` 또는 Docker 공식 apt 저장소로 **docker ce + compose plugin** 설치.

설치 후 (저장소 루트, **WSL**):

```bash
# 터미널 1 — 호스트(WSL)에서 gRPC
npm run grpc:dev

# 터미널 2 — Envoy만 컨테이너
docker compose up envoy
```

`docker-compose.yml` 은 **`host.docker.internal` + `host-gateway`** 로 **호스트의 50051** 을 바라봅니다.  
gRPC를 **같은 WSL**에서 띄우면 연결됩니다.

**Podman** 을 쓰는 경우: `podman compose up envoy` (환경에 따라 `extra_hosts` 지원 확인).

---

## 방법 C: Windows에만 Node, WSL에만 Envoy

가능은 하지만 **업스트림 IP**를 `127.0.0.1` 로는 맞추기 어렵고, WSL↔Windows 주소를 수동으로 넣어야 해서 **비추천**입니다.  
가능하면 **방법 A** 처럼 **gRPC와 Envoy를 같은 OS(WSL)에서** 맞추세요.

---

## Docker Desktop 대신 쓸 수 있는 무료 GUI (참고)

- **Rancher Desktop** (개인/소규모 무료 정책은 제품 페이지 확인)  
- **Podman** (CLI 중심, Windows에선 Podman Machine)

조직마다 허용 목록이 다르므로, **IT 정책**을 먼저 확인하는 것이 좋습니다.

---

## 관련 파일

| 파일 | 용도 |
|------|------|
| `scripts/install-envoy-wsl.sh` | WSL/Linux 에 Envoy 바이너리 설치 (한 번 실행) |
| `envoy/envoy.yaml` | 호스트에서 `envoy -c` 직접 실행 시 (`127.0.0.1:50051`) |
| `envoy/envoy.docker-host.yaml` | `docker compose` 로 컨테이너 실행 시 (`host.docker.internal:50051`) |
| `docker-compose.yml` | Envoy 컨테이너만 정의 (이미지는 pull) |

다른 실행 흐름은 [03_LOCAL_RUN.md](./03_LOCAL_RUN.md), Envoy 개요는 [04_ENVOY_ALTERNATIVES.md](./04_ENVOY_ALTERNATIVES.md) 를 참고하세요.
