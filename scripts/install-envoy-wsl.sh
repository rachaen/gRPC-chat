#!/usr/bin/env bash
# WSL / Linux: Envoy 공식 릴리스 바이너리를 받아 /usr/local/bin/envoy 에 설치합니다.
# 사용: bash scripts/install-envoy-wsl.sh
#       ENVOY_VERSION=1.31.2 bash scripts/install-envoy-wsl.sh  (기본 1.31.2)

set -euo pipefail

VERSION="${ENVOY_VERSION:-1.31.2}"
ARCH="$(uname -m)"
case "${ARCH}" in
  x86_64)  FILE="envoy-${VERSION}-linux-x86_64" ;;
  aarch64) FILE="envoy-${VERSION}-linux-aarch_64" ;; # 릴리스 에셋 이름 (aarch_64)
  *)
    echo "지원하지 않는 아키텍처: ${ARCH} (x86_64 / aarch64 만 시도함)"
    exit 1
    ;;
esac

URL="https://github.com/envoyproxy/envoy/releases/download/v${VERSION}/${FILE}"
DEST="${1:-/usr/local/bin/envoy}"
TMP="$(mktemp)"

echo "다운로드: ${URL}"
curl -fL --progress-bar -o "${TMP}" "${URL}"
chmod +x "${TMP}"

if [[ "${DEST}" == "/usr/local/bin/envoy" ]] && [[ ! -w "$(dirname "${DEST}")" ]]; then
  echo "sudo 로 ${DEST} 에 설치합니다."
  sudo mv "${TMP}" "${DEST}"
else
  mv "${TMP}" "${DEST}"
fi

echo "설치 완료:"
"${DEST}" --version
