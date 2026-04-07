#실행 환경 
-----
- Ubuntu 22.2.4
- docker 24.0.7
- docker-compose 1.29.2
- envoy 1.18.2
-----

Envoy 프록시 실행 방법 

출처 : https://velog.io/@larshavin/Envoy-%ED%94%84%EB%A1%9D%EC%8B%9C%EB%A5%BC-%EA%B5%AC%EC%84%B1%ED%95%B4%EB%B3%B4%EC%9E%90-1)  ---     : https://www.envoyproxy.io/docs/envoy/latest/start/quick-start/run-envoy

1. Install

    공식홈페이지  : https://www.envoyproxy.io/docs/envoy/latest/start/install#install-envoy-on-debian-gnu-linux

    ``` bash
        $sudo apt update
        $sudo apt install apt-transport-https gnupg2 curl lsb-release
        $curl -sL 'https://deb.dl.getenvoy.io/public/gpg.8115BA8E629CC074.key' | sudo gpg --dearmor -o /usr/share/keyrings/getenvoy-keyring.gpg
        $echo a077cb587a1b622e03aa4bf2f3689de14658a9497a9af2c427bba5f4cc3c4723 /usr/share/keyrings/getenvoy-keyring.gpg | sha256sum --check
        $echo "deb [arch=amd64 signed-by=/usr/share/keyrings/getenvoy-keyring.gpg] https://deb.dl.getenvoy.io/public/deb/ubuntu $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/getenvoy.list
        $sudo apt update
        $sudo apt install -y getenvoy-envoy~
    ```    
2. Run

    ``` bash
    # 버전 확인
    $ envoy --version
     -> envoy  version: d362e791eb9e4efa8d87f6d878740e72dc8330ac/1.18.2/clean-getenvoy-76c310e-envoy/RELEASE/BoringSSL

     # 명령어 확인
    $ envoy --help

    # 데모 컨피그 다운로드
    $ wget https://www.envoyproxy.io/docs/envoy/latest/_downloads/92dcb9714fb6bc288d042029b34c0de4/envoy-demo.yaml
    ```    


    ```envoy-demo.yaml``` ⇒ 튜토리얼에서 다운 받은 그대로 사용하면 에러가 나옵니다. 

    ```connect_timeout``` 를 추가 해주세요.

    ---
    ``` yaml
    static_resources:

    listeners:
    - name: listener_0
        address:
        socket_address:
            address: 0.0.0.0
            port_value: 10000
        filter_chains:
        - filters:
        - name: envoy.filters.network.http_connection_manager
            typed_config:
            "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
            stat_prefix: ingress_http
            access_log:
            - name: envoy.access_loggers.stdout
                typed_config:
                "@type": type.googleapis.com/envoy.extensions.access_loggers.stream.v3.StdoutAccessLog
            http_filters:
            - name: envoy.filters.http.router
                typed_config:
                "@type": type.googleapis.com/envoy.extensions.filters.http.router.v3.Router
            route_config:
                name: local_route
                virtual_hosts:
                - name: local_service
                domains: ["*"]
                routes:
                - match:
                    prefix: "/"
                    route:
                    host_rewrite_literal: www.envoyproxy.io
                    cluster: service_envoyproxy_io

    clusters:
    - name: service_envoyproxy_io
        type: LOGICAL_DNS
            connect_timeout: 5s # 이 부분 추가 바람.
        # Comment out the following line to test on v6 networks
        dns_lookup_family: V4_ONLY
        load_assignment:
        cluster_name: service_envoyproxy_io
        endpoints:
        - lb_endpoints:
            - endpoint:
                address:
                socket_address:
                    address: www.envoyproxy.io
                    port_value: 443
        transport_socket:
        name: envoy.transport_sockets.tls
        typed_config:
            "@type": type.googleapis.com/envoy.extensions.transport_sockets.tls.v3.UpstreamTlsContext
            sni: www.envoyproxy.io
    ```