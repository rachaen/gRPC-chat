import os
import sys
import logging

sys.path.append(os.path.join(os.path.dirname(__file__), '..', "proto"))

import server_pb2
import server_pb2_grpc


class UserService(server_pb2_grpc.UserServiceServicer):
    def Register(self, request, context):
        logging.info(f'Register request received: {request}')

        return server_pb2.UserResponse(status="User registered")

    def Login(self, request, context):
        logging.info(f'Login request received: {request}')

        return server_pb2.UserResponse(status="User logged in")

    def Logout(self, request, context):
        logging.info(f'Logout request received: {request}')

        return server_pb2.UserResponse(status="User logged out")

# class UserService(server_pb2_grpc.UserServiceServicer):
#     def Register(self, request, context):
#         try:
#             return server_pb2.UserResponse(status="User registered")
#         except Exception as e:
#             context.set_details(str(e))
#             context.set_code(grpc.StatusCode.INTERNAL)
#             return server_pb2.UserResponse(status="Error registering user")
#
#     def Login(self, request, context):
#         try:
#             return server_pb2.UserResponse(status="User logged in")
#         except Exception as e:
#             context.set_details(str(e))
#             context.set_code(grpc.StatusCode.INTERNAL)
#             return server_pb2.UserResponse(status="Error logging in user")
#
#     def Logout(self, request, context):
#         try:
#             return server_pb2.UserResponse(status="User logged out")
#         except Exception as e:
#             context.set_details(str(e))
#             context.set_code(grpc.StatusCode.INTERNAL)
#             return server_pb2.UserResponse(status="Error logging out user")
