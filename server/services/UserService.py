import sys, os

import grpc
from concurrent import futures
import time

sys.path.append(os.path.join(os.path.dirname(__file__), 'proto'))
from proto import server_pb2, server_pb2_grpc


class UserService(server_pb2_grpc.UserServiceServicer):
    def Register(self, request, context):
        return server_pb2.UserResponse(status="User registered")

    def Login(self, request, context):
        return server_pb2.UserResponse(status="User logged in")

    def Logout(self, request, context):
        return server_pb2.UserResponse(status="User logged in")

