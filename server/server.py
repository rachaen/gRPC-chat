import sys
import os
import time
import logging
from concurrent import futures
import grpc

sys.path.append(os.path.join(os.path.dirname(__file__), 'proto'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'services'))

import server_pb2
import server_pb2_grpc
from MessageService import MessageService
from UserService import UserService

def serve():
    logging.info('Starting server def...')
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    server_pb2_grpc.add_UserServiceServicer_to_server(UserService(), server)
    server_pb2_grpc.add_MessageServiceServicer_to_server(MessageService(), server)

    server.add_insecure_port('[::]:50051')
    server.start()
    logging.info('Server started on port 50051')
    server.wait_for_termination()

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    logging.info('Starting server')
    serve()
