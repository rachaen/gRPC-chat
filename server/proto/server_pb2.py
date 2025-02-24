# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: server.proto
# Protobuf Python Version: 5.26.1
"""Generated protocol buffer code."""
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import symbol_database as _symbol_database
from google.protobuf.internal import builder as _builder
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()




DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\x0cserver.proto\x12\x06server\"\x1c\n\x08UserInfo\x12\x10\n\x08username\x18\x01 \x01(\t\"\x1e\n\x0cUserResponse\x12\x0e\n\x06status\x18\x01 \x01(\t\")\n\x07Message\x12\x10\n\x08username\x18\x01 \x01(\t\x12\x0c\n\x04text\x18\x02 \x01(\t\"!\n\x0fMessageResponse\x12\x0e\n\x06status\x18\x01 \x01(\t\"\x1c\n\x08UserJoin\x12\x10\n\x08username\x18\x01 \x01(\t\"\x1d\n\tUserLeave\x12\x10\n\x08username\x18\x01 \x01(\t\"\x07\n\x05\x45mpty2\xa4\x01\n\x0bUserService\x12\x32\n\x08Register\x12\x10.server.UserInfo\x1a\x14.server.UserResponse\x12/\n\x05Login\x12\x10.server.UserInfo\x1a\x14.server.UserResponse\x12\x30\n\x06Logout\x12\x10.server.UserInfo\x1a\x14.server.UserResponse2\xe9\x01\n\x0eMessageService\x12\x37\n\x0bSendMessage\x12\x0f.server.Message\x1a\x17.server.MessageResponse\x12\x32\n\x0eStreamMessages\x12\r.server.Empty\x1a\x0f.server.Message0\x01\x12\x33\n\x0eNotifyUserJoin\x12\r.server.Empty\x1a\x10.server.UserJoin0\x01\x12\x35\n\x0fNotifyUserLeave\x12\r.server.Empty\x1a\x11.server.UserLeave0\x01\x62\x06proto3')

_globals = globals()
_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, _globals)
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'server_pb2', _globals)
if not _descriptor._USE_C_DESCRIPTORS:
  DESCRIPTOR._loaded_options = None
  _globals['_USERINFO']._serialized_start=24
  _globals['_USERINFO']._serialized_end=52
  _globals['_USERRESPONSE']._serialized_start=54
  _globals['_USERRESPONSE']._serialized_end=84
  _globals['_MESSAGE']._serialized_start=86
  _globals['_MESSAGE']._serialized_end=127
  _globals['_MESSAGERESPONSE']._serialized_start=129
  _globals['_MESSAGERESPONSE']._serialized_end=162
  _globals['_USERJOIN']._serialized_start=164
  _globals['_USERJOIN']._serialized_end=192
  _globals['_USERLEAVE']._serialized_start=194
  _globals['_USERLEAVE']._serialized_end=223
  _globals['_EMPTY']._serialized_start=225
  _globals['_EMPTY']._serialized_end=232
  _globals['_USERSERVICE']._serialized_start=235
  _globals['_USERSERVICE']._serialized_end=399
  _globals['_MESSAGESERVICE']._serialized_start=402
  _globals['_MESSAGESERVICE']._serialized_end=635
# @@protoc_insertion_point(module_scope)
