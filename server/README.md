gRPC 통신 서버
=============



필수 설치 목록
--

- 파이썬 버전 3.12
- grpcio v1.64.1
- grpcio-tools v 1.64.1



python사용한 pb 생성 방법

<pre><code>python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. server.proto</code></pre>



---
