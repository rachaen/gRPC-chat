#!/usr/bin/env bash
# http_filters 각 항목에 typed_config.@type 이 있는지 빠르게 확인 (Python3 필요)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FILE="${1:-$ROOT/envoy/envoy.yaml}"
python3 << 'PY' "$FILE"
import sys, yaml
path = sys.argv[1]
with open(path) as f:
    d = yaml.safe_load(f)
hcm = d["static_resources"]["listeners"][0]["filter_chains"][0]["filters"][0]["typed_config"]
for i, hf in enumerate(hcm.get("http_filters", [])):
    name = hf.get("name")
    tc = hf.get("typed_config") or {}
    t = tc.get("@type", "")
    ok = "OK" if t else "MISSING @type"
    print(f"{i} {name}: {t or '(empty)'} [{ok}]")
    if not t:
        sys.exit(1)
print("All http_filters have @type.")
PY
