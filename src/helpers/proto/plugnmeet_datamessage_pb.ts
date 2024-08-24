// @generated by protoc-gen-es v1.10.0 with parameter "target=ts,import_extension=.ts"
// @generated from file plugnmeet_datamessage.proto (package plugnmeet, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type {
  BinaryReadOptions,
  FieldList,
  JsonReadOptions,
  JsonValue,
  PartialMessage,
  PlainMessage,
} from '@bufbuild/protobuf';
import { Message, proto3 } from '@bufbuild/protobuf';

/**
 * @generated from enum plugnmeet.DataMsgType
 */
export enum DataMsgType {
  /**
   * @generated from enum value: USER = 0;
   */
  USER = 0,

  /**
   * @generated from enum value: SYSTEM = 1;
   */
  SYSTEM = 1,

  /**
   * @generated from enum value: WHITEBOARD = 2;
   */
  WHITEBOARD = 2,
}
// Retrieve enum metadata with: proto3.getEnumType(DataMsgType)
proto3.util.setEnumType(DataMsgType, 'plugnmeet.DataMsgType', [
  { no: 0, name: 'USER' },
  { no: 1, name: 'SYSTEM' },
  { no: 2, name: 'WHITEBOARD' },
]);

/**
 * @generated from enum plugnmeet.DataMsgBodyType
 */
export enum DataMsgBodyType {
  /**
   * SYSTEM type
   *
   * @generated from enum value: UNKNOWN = 0;
   */
  UNKNOWN = 0,

  /**
   * @generated from enum value: FILE_UPLOAD = 3;
   */
  FILE_UPLOAD = 3,

  /**
   * @generated from enum value: INFO = 4;
   */
  INFO = 4,

  /**
   * @generated from enum value: ALERT = 5;
   */
  ALERT = 5,

  /**
   * @generated from enum value: SEND_CHAT_MSGS = 6;
   */
  SEND_CHAT_MSGS = 6,

  /**
   * @generated from enum value: RENEW_TOKEN = 7;
   */
  RENEW_TOKEN = 7,

  /**
   * @generated from enum value: UPDATE_LOCK_SETTINGS = 8;
   */
  UPDATE_LOCK_SETTINGS = 8,

  /**
   * @generated from enum value: INIT_WHITEBOARD = 9;
   */
  INIT_WHITEBOARD = 9,

  /**
   * @generated from enum value: USER_VISIBILITY_CHANGE = 10;
   */
  USER_VISIBILITY_CHANGE = 10,

  /**
   * @generated from enum value: EXTERNAL_MEDIA_PLAYER_EVENTS = 11;
   */
  EXTERNAL_MEDIA_PLAYER_EVENTS = 11,

  /**
   * @generated from enum value: NEW_POLL_RESPONSE = 13;
   */
  NEW_POLL_RESPONSE = 13,

  /**
   * @generated from enum value: SPEECH_SUBTITLE_TEXT = 23;
   */
  SPEECH_SUBTITLE_TEXT = 23,

  /**
   * @generated from enum value: UPDATE_ROOM_METADATA = 25;
   */
  UPDATE_ROOM_METADATA = 25,

  /**
   * USER type
   *
   * @generated from enum value: CHAT = 16;
   */
  CHAT = 16,

  /**
   * WHITEBOARD type
   *
   * @generated from enum value: SCENE_UPDATE = 17;
   */
  SCENE_UPDATE = 17,

  /**
   * @generated from enum value: POINTER_UPDATE = 18;
   */
  POINTER_UPDATE = 18,

  /**
   * @generated from enum value: ADD_WHITEBOARD_FILE = 19;
   */
  ADD_WHITEBOARD_FILE = 19,

  /**
   * @generated from enum value: ADD_WHITEBOARD_OFFICE_FILE = 20;
   */
  ADD_WHITEBOARD_OFFICE_FILE = 20,

  /**
   * @generated from enum value: PAGE_CHANGE = 21;
   */
  PAGE_CHANGE = 21,

  /**
   * @generated from enum value: WHITEBOARD_APP_STATE_CHANGE = 22;
   */
  WHITEBOARD_APP_STATE_CHANGE = 22,

  /**
   * analytics
   *
   * @generated from enum value: ANALYTICS_DATA = 27;
   */
  ANALYTICS_DATA = 27,
}
// Retrieve enum metadata with: proto3.getEnumType(DataMsgBodyType)
proto3.util.setEnumType(DataMsgBodyType, 'plugnmeet.DataMsgBodyType', [
  { no: 0, name: 'UNKNOWN' },
  { no: 3, name: 'FILE_UPLOAD' },
  { no: 4, name: 'INFO' },
  { no: 5, name: 'ALERT' },
  { no: 6, name: 'SEND_CHAT_MSGS' },
  { no: 7, name: 'RENEW_TOKEN' },
  { no: 8, name: 'UPDATE_LOCK_SETTINGS' },
  { no: 9, name: 'INIT_WHITEBOARD' },
  { no: 10, name: 'USER_VISIBILITY_CHANGE' },
  { no: 11, name: 'EXTERNAL_MEDIA_PLAYER_EVENTS' },
  { no: 13, name: 'NEW_POLL_RESPONSE' },
  { no: 23, name: 'SPEECH_SUBTITLE_TEXT' },
  { no: 25, name: 'UPDATE_ROOM_METADATA' },
  { no: 16, name: 'CHAT' },
  { no: 17, name: 'SCENE_UPDATE' },
  { no: 18, name: 'POINTER_UPDATE' },
  { no: 19, name: 'ADD_WHITEBOARD_FILE' },
  { no: 20, name: 'ADD_WHITEBOARD_OFFICE_FILE' },
  { no: 21, name: 'PAGE_CHANGE' },
  { no: 22, name: 'WHITEBOARD_APP_STATE_CHANGE' },
  { no: 27, name: 'ANALYTICS_DATA' },
]);

/**
 * @generated from message plugnmeet.DataMessage
 */
export class DataMessage extends Message<DataMessage> {
  /**
   * @generated from field: plugnmeet.DataMsgType type = 1;
   */
  type = DataMsgType.USER;

  /**
   * @generated from field: optional string message_id = 2;
   */
  messageId?: string;

  /**
   * @generated from field: string room_sid = 3;
   */
  roomSid = '';

  /**
   * @generated from field: string room_id = 4;
   */
  roomId = '';

  /**
   * @generated from field: optional string to = 5;
   */
  to?: string;

  /**
   * @generated from field: plugnmeet.DataMsgBody body = 6;
   */
  body?: DataMsgBody;

  constructor(data?: PartialMessage<DataMessage>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'plugnmeet.DataMessage';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: 'type', kind: 'enum', T: proto3.getEnumType(DataMsgType) },
    {
      no: 2,
      name: 'message_id',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      opt: true,
    },
    { no: 3, name: 'room_sid', kind: 'scalar', T: 9 /* ScalarType.STRING */ },
    { no: 4, name: 'room_id', kind: 'scalar', T: 9 /* ScalarType.STRING */ },
    {
      no: 5,
      name: 'to',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      opt: true,
    },
    { no: 6, name: 'body', kind: 'message', T: DataMsgBody },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>,
  ): DataMessage {
    return new DataMessage().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>,
  ): DataMessage {
    return new DataMessage().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>,
  ): DataMessage {
    return new DataMessage().fromJsonString(jsonString, options);
  }

  static equals(
    a: DataMessage | PlainMessage<DataMessage> | undefined,
    b: DataMessage | PlainMessage<DataMessage> | undefined,
  ): boolean {
    return proto3.util.equals(DataMessage, a, b);
  }
}

/**
 * @generated from message plugnmeet.DataMsgBody
 */
export class DataMsgBody extends Message<DataMsgBody> {
  /**
   * @generated from field: plugnmeet.DataMsgBodyType type = 1;
   */
  type = DataMsgBodyType.UNKNOWN;

  /**
   * @generated from field: optional string message_id = 2;
   */
  messageId?: string;

  /**
   * @generated from field: optional string time = 3;
   */
  time?: string;

  /**
   * @generated from field: plugnmeet.DataMsgReqFrom from = 4;
   */
  from?: DataMsgReqFrom;

  /**
   * @generated from field: string msg = 5;
   */
  msg = '';

  /**
   * @generated from field: optional uint32 is_private = 6;
   */
  isPrivate?: number;

  constructor(data?: PartialMessage<DataMsgBody>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'plugnmeet.DataMsgBody';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    {
      no: 1,
      name: 'type',
      kind: 'enum',
      T: proto3.getEnumType(DataMsgBodyType),
    },
    {
      no: 2,
      name: 'message_id',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      opt: true,
    },
    {
      no: 3,
      name: 'time',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      opt: true,
    },
    { no: 4, name: 'from', kind: 'message', T: DataMsgReqFrom },
    { no: 5, name: 'msg', kind: 'scalar', T: 9 /* ScalarType.STRING */ },
    {
      no: 6,
      name: 'is_private',
      kind: 'scalar',
      T: 13 /* ScalarType.UINT32 */,
      opt: true,
    },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>,
  ): DataMsgBody {
    return new DataMsgBody().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>,
  ): DataMsgBody {
    return new DataMsgBody().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>,
  ): DataMsgBody {
    return new DataMsgBody().fromJsonString(jsonString, options);
  }

  static equals(
    a: DataMsgBody | PlainMessage<DataMsgBody> | undefined,
    b: DataMsgBody | PlainMessage<DataMsgBody> | undefined,
  ): boolean {
    return proto3.util.equals(DataMsgBody, a, b);
  }
}

/**
 * @generated from message plugnmeet.DataMsgReqFrom
 */
export class DataMsgReqFrom extends Message<DataMsgReqFrom> {
  /**
   * @generated from field: string sid = 1;
   */
  sid = '';

  /**
   * @generated from field: string user_id = 2;
   */
  userId = '';

  /**
   * @generated from field: optional string name = 3;
   */
  name?: string;

  constructor(data?: PartialMessage<DataMsgReqFrom>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = 'plugnmeet.DataMsgReqFrom';
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: 'sid', kind: 'scalar', T: 9 /* ScalarType.STRING */ },
    { no: 2, name: 'user_id', kind: 'scalar', T: 9 /* ScalarType.STRING */ },
    {
      no: 3,
      name: 'name',
      kind: 'scalar',
      T: 9 /* ScalarType.STRING */,
      opt: true,
    },
  ]);

  static fromBinary(
    bytes: Uint8Array,
    options?: Partial<BinaryReadOptions>,
  ): DataMsgReqFrom {
    return new DataMsgReqFrom().fromBinary(bytes, options);
  }

  static fromJson(
    jsonValue: JsonValue,
    options?: Partial<JsonReadOptions>,
  ): DataMsgReqFrom {
    return new DataMsgReqFrom().fromJson(jsonValue, options);
  }

  static fromJsonString(
    jsonString: string,
    options?: Partial<JsonReadOptions>,
  ): DataMsgReqFrom {
    return new DataMsgReqFrom().fromJsonString(jsonString, options);
  }

  static equals(
    a: DataMsgReqFrom | PlainMessage<DataMsgReqFrom> | undefined,
    b: DataMsgReqFrom | PlainMessage<DataMsgReqFrom> | undefined,
  ): boolean {
    return proto3.util.equals(DataMsgReqFrom, a, b);
  }
}
