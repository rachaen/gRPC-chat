import logging
import os
import sys

import grpc
from setuptools import logging

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'proto'))

import server_pb2
import server_pb2_grpc


class MessageService(server_pb2_grpc.MessageServiceServicer):
    def __init__(self):
        self.messages = []
        self.user_joins = []
        self.user_leaves = []

    def SendMessage(self, request, context):
        logging.info(f'SendMessage request received: {request}')

        try:
            self.messages.append(request)
            return server_pb2.MessageResponse(status="Message received")
        except Exception as e:
            context.set_details(str(e))
            context.set_code(grpc.StatusCode.INTERNAL)
            return server_pb2.MessageResponse(status="Error receive message!!!!")

    def StreamMessages(self, request, context):
        logging.info('StreamMessages request received')

        for message in self.messages:
            yield message

    def NotifyUserJoin(self, request, context):
        logging.info('NotifyUserJoin request received')

        for user in self.user_joins:
            yield user

    def NotifyUserLeave(self, request, context):
        logging.info('NotifyUserLeave request received')

        for user in self.user_leaves:
            yield user