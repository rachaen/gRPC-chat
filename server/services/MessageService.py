import sys, os

import grpc
from concurrent import futures
import time

sys.path.append(os.path.join(os.path.dirname(__file__), 'proto'))
from proto import server_pb2, server_pb2_grpc


class MessageService(server_pb2_grpc.UserServiceServicer):
    def __init__(self):
        self.messages = []
        self.user_joins = []
        self.user_leaves = []

    def SendMessage(self, request, context):
        self.messages.append()

