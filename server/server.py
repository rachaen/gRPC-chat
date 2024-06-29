import sys, os
import logging
from concurrent import futures

import grpc
sys.path.append(os.path.join(os.path.dirname(__file__), 'proto'))

from proto import server_pb2, server_pb2_grpc


class ServerServicer(server_pb2_grpc.ServerServicer):
    def GetServerResponse(self, request, context):
        response_message = f"Received your message: {request.message}"
        return server_pb2.MessageResponse(message=response_message, received=True)

def serve():
    logging.info('Starting server...')
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    server_pb2_grpc.add_ServerServicer_to_server(ServerServicer(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    logging.info('Server started on port 50051')
    server.wait_for_termination()

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    serve()
