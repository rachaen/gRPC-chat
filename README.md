전체 실행 방법
======

1. 서버 실행
   - `python server.py`
2. Envoy 실행 
   - `docker run -d --name envoy -p 8080:8080 -v $(pwd)/envoy.yaml:/etc/envoy/envoy.yaml envoyproxy/envoy:v1.21.0`
   -  (Docker 컨테이너 실행 확인) : `docker ps`
2. React 실행 
   - `yarn start`