import {
  ErrorCode,
  NatsConnection,
  NatsError,
  tokenAuthenticator,
  wsconnect,
  // eslint-disable-next-line import/no-unresolved
} from '@nats-io/nats-core';
// eslint-disable-next-line import/no-unresolved
import { jetstream, JetStreamClient } from '@nats-io/jetstream';
import { isE2EESupported } from 'livekit-client';
import { Dispatch } from 'react';
import { toast } from 'react-toastify';
import {
  AnalyticsDataMsgSchema,
  AnalyticsEvents,
  AnalyticsEventType,
  ChatMessageSchema,
  DataChannelMessageSchema,
  DataMsgBodyType,
  MediaServerConnInfo,
  NatsInitialData,
  NatsInitialDataSchema,
  NatsKvUserInfoSchema,
  NatsMsgClientToServer,
  NatsMsgClientToServerEvents,
  NatsMsgClientToServerSchema,
  NatsMsgServerToClient,
  NatsMsgServerToClientEvents,
  NatsMsgServerToClientSchema,
  NatsSubjects,
} from 'plugnmeet-protocol-js';
import {
  create,
  fromBinary,
  fromJson,
  fromJsonString,
  toBinary,
  toJsonString,
} from '@bufbuild/protobuf';

import { IErrorPageProps } from '../../components/extra-pages/Error';
import { ConnectionStatus, IConnectLivekit } from '../livekit/types';
import { createLivekitConnection } from '../livekit/utils';
import { LivekitInfo } from '../livekit/hooks/useLivekitConnect';
import HandleRoomData from './HandleRoomData';
import HandleParticipants from './HandleParticipants';
import HandleDataMessage from './HandleDataMessage';
import HandleWhiteboard from './HandleWhiteboard';
import HandleChat from './HandleChat';
import { store } from '../../store';
import { participantsSelector } from '../../store/slices/participantSlice';
import HandleSystemData from './HandleSystemData';
import i18n from '../i18n';
import { addToken } from '../../store/slices/sessionSlice';
import {
  ICurrentRoom,
  ICurrentUser,
} from '../../store/slices/interfaces/session';

const RENEW_TOKEN_FREQUENT = 3 * 60 * 1000;
const PING_INTERVAL = 10 * 1000;
const STATUS_CHECKER_INTERVAL = 500;

export default class ConnectNats {
  private _nc: NatsConnection | undefined;
  private _js: JetStreamClient | undefined;
  private readonly _natsWSUrls: string[];
  private _token: string;

  private readonly _roomId: string;
  private readonly _userId: string;
  private _isAdmin: boolean = false;
  private readonly _subjects: NatsSubjects;

  private tokenRenewInterval: any;
  private pingInterval: any;
  private statusCheckerInterval: any;
  private isRoomReconnecting: boolean = false;

  private readonly _setErrorState: Dispatch<IErrorPageProps>;
  private readonly _setRoomConnectionStatusState: Dispatch<ConnectionStatus>;
  private readonly _setCurrentMediaServerConn: Dispatch<IConnectLivekit>;

  private _mediaServerConn: IConnectLivekit | undefined = undefined;
  private handleRoomData: HandleRoomData;
  private handleSystemData: HandleSystemData;
  private handleParticipants: HandleParticipants;
  private handleChat: HandleChat;
  private handleDataMsg: HandleDataMessage;
  private handleWhiteboard: HandleWhiteboard;

  constructor(
    natsWSUrls: string[],
    token: string,
    roomId: string,
    userId: string,
    subjects: NatsSubjects,
    setErrorState: Dispatch<IErrorPageProps>,
    setRoomConnectionStatusState: Dispatch<ConnectionStatus>,
    setCurrentMediaServerConn: Dispatch<IConnectLivekit>,
  ) {
    this._natsWSUrls = natsWSUrls;
    this._token = token;
    this._roomId = roomId;
    this._userId = userId;
    this._subjects = subjects;
    this._setErrorState = setErrorState;
    this._setRoomConnectionStatusState = setRoomConnectionStatusState;
    this._setCurrentMediaServerConn = setCurrentMediaServerConn;

    this.handleRoomData = new HandleRoomData();
    this.handleSystemData = new HandleSystemData();
    this.handleParticipants = new HandleParticipants(this);
    this.handleChat = new HandleChat(this);
    this.handleDataMsg = new HandleDataMessage(this);
    this.handleWhiteboard = new HandleWhiteboard();
  }

  get nc(): NatsConnection | undefined {
    return this._nc;
  }

  get isAdmin(): boolean {
    return this._isAdmin;
  }

  get mediaServerConn(): IConnectLivekit | undefined {
    return this._mediaServerConn;
  }

  get roomId(): string {
    return this._roomId;
  }

  get userId(): string {
    return this._userId;
  }

  get currentRoomInfo(): ICurrentRoom {
    return this.handleRoomData.roomInfo;
  }

  get localUserInfo(): ICurrentUser {
    return this.handleParticipants.localParticipant;
  }

  public openConn = async () => {
    try {
      this._nc = await wsconnect({
        servers: this._natsWSUrls,
        authenticator: tokenAuthenticator(() => this._token),
      });

      console.info(`connected ${this._nc.getServer()}`);
    } catch (e) {
      console.error(e);
      this.setErrorStatus(
        i18n.t('notifications.nats-error-auth-title'),
        i18n.t('nats-error-auth-body'),
      );
      return;
    }

    this._setRoomConnectionStatusState('receiving-data');
    this._js = jetstream(this._nc);

    this.monitorConnStatus();
    this.subscribeToSystemPrivate();
    this.subscribeToSystemPublic();
    this.subscribeToChat();
    this.subscribeToWhiteboard();
    this.subscribeToDataChannel();

    this.startTokenRenewInterval();
    await this.startPingToServer();

    // request for initial data
    await this.sendMessageToSystemWorker(
      create(NatsMsgClientToServerSchema, {
        event: NatsMsgClientToServerEvents.REQ_INITIAL_DATA,
      }),
    );
  };

  public endSession = async (msg: string) => {
    if (this.mediaServerConn) {
      await this.mediaServerConn.disconnectRoom();
    }

    clearInterval(this.tokenRenewInterval);
    clearInterval(this.pingInterval);
    this.handleParticipants.clearParticipantCounterInterval();

    if (this._nc && !this._nc.isClosed()) {
      await this._nc.drain();
      await this._nc.close();
    }

    this._setErrorState({
      title: i18n.t('notifications.room-disconnected-title'),
      text: i18n.t(msg),
    });
    this._setRoomConnectionStatusState('disconnected');
  };

  public sendMessageToSystemWorker = async (data: NatsMsgClientToServer) => {
    if (
      typeof this._js === 'undefined' ||
      this._nc?.isClosed() ||
      this.isRoomReconnecting
    ) {
      return;
    }
    try {
      const subject =
        this._subjects.systemJsWorker + '.' + this._roomId + '.' + this._userId;
      return await this._js.publish(
        subject,
        toBinary(NatsMsgClientToServerSchema, data),
      );
    } catch (e: any) {
      console.error(e.message);
      const msg = this.formatError(e);
      toast(msg, {
        toastId: 'nats-status',
        type: 'error',
      });
    }
  };

  public sendChatMsg = async (to: string, msg: string) => {
    if (
      typeof this._js === 'undefined' ||
      this._nc?.isClosed() ||
      this.isRoomReconnecting
    ) {
      return;
    }

    const isPrivate = to !== 'public';
    const data = create(ChatMessageSchema, {
      fromName: this.handleParticipants.localParticipant.name,
      fromUserId: this.handleParticipants.localParticipant.userId,
      sentAt: Date.now().toString(),
      toUserId: to !== 'public' ? to : undefined,
      isPrivate: isPrivate,
      message: msg,
    });

    const subject =
      this._roomId + ':' + this._subjects.chat + '.' + this._userId;
    try {
      await this._js.publish(subject, toBinary(ChatMessageSchema, data));
    } catch (e: any) {
      console.error(e.message);
      const msg = this.formatError(e);
      toast(msg, {
        toastId: 'nats-status',
        type: 'error',
      });
    }
  };

  public sendWhiteboardData = async (
    type: DataMsgBodyType,
    msg: string,
    to?: string,
  ) => {
    if (
      typeof this._js === 'undefined' ||
      this._nc?.isClosed() ||
      this.isRoomReconnecting
    ) {
      return;
    }

    const data = create(DataChannelMessageSchema, {
      type,
      fromUserId: this.handleParticipants.localParticipant.userId,
      toUserId: to,
      message: msg,
    });
    const subject =
      this._roomId + ':' + this._subjects.whiteboard + '.' + this._userId;
    try {
      await this._js.publish(subject, toBinary(DataChannelMessageSchema, data));
    } catch (e: any) {
      console.error(e.message);
      const msg = this.formatError(e);
      toast(msg, {
        toastId: 'nats-status',
        type: 'error',
      });
    }
  };

  public sendDataMessage = async (
    type: DataMsgBodyType,
    msg: string,
    to?: string,
  ) => {
    if (
      typeof this._js === 'undefined' ||
      this._nc?.isClosed() ||
      this.isRoomReconnecting
    ) {
      return;
    }

    const data = create(DataChannelMessageSchema, {
      type,
      fromUserId: this.handleParticipants.localParticipant.userId,
      toUserId: to,
      message: msg,
    });
    const subject =
      this._roomId + ':' + this._subjects.dataChannel + '.' + this._userId;
    try {
      await this._js.publish(subject, toBinary(DataChannelMessageSchema, data));
    } catch (e: any) {
      console.error(e.message);
      const msg = this.formatError(e);
      toast(msg, {
        toastId: 'nats-status',
        type: 'error',
      });
    }
  };

  public sendAnalyticsData = async (
    event_name: AnalyticsEvents,
    event_type: AnalyticsEventType = AnalyticsEventType.USER,
    hset_value?: string,
    event_value_string?: string,
    event_value_integer?: string,
  ) => {
    const analyticsMsg = create(AnalyticsDataMsgSchema, {
      eventType: event_type,
      eventName: event_name,
      roomId: this._roomId,
      userId: this._userId,
      hsetValue: hset_value,
      eventValueString: event_value_string,
      eventValueInteger: event_value_integer,
    });

    const data = create(NatsMsgClientToServerSchema, {
      event: NatsMsgClientToServerEvents.PUSH_ANALYTICS_DATA,
      msg: toJsonString(AnalyticsDataMsgSchema, analyticsMsg),
    });
    await this.sendMessageToSystemWorker(data);
  };

  private setErrorStatus(title: string, reason: string) {
    this._setRoomConnectionStatusState('error');
    this._setErrorState({
      title: title,
      text: reason,
    });
  }

  private async monitorConnStatus() {
    if (typeof this._nc === 'undefined') {
      return;
    }
    const startStatusChecker = () => {
      if (typeof this.statusCheckerInterval === 'undefined') {
        this.statusCheckerInterval = setInterval(() => {
          if (this._nc?.isClosed()) {
            this.endSession('notifications.room-disconnected-network-error');

            clearInterval(this.statusCheckerInterval);
            this.statusCheckerInterval = undefined;
            this.isRoomReconnecting = false;
          }
        }, STATUS_CHECKER_INTERVAL);
      }
    };

    for await (const s of this._nc.status()) {
      if (s.type === 'reconnecting' && !this.isRoomReconnecting) {
        this.isRoomReconnecting = true;
        startStatusChecker();
        this._setRoomConnectionStatusState('re-connecting');
      } else if (s.type === 'reconnect') {
        this._setRoomConnectionStatusState('connected');

        clearInterval(this.statusCheckerInterval);
        this.statusCheckerInterval = undefined;
        this.isRoomReconnecting = false;
      }
    }
  }

  private async subscribeToSystemPrivate() {
    if (typeof this._js === 'undefined') {
      return;
    }

    const consumerName = this._subjects.systemPrivate + ':' + this._userId;
    const consumer = await this._js.consumers.get(this._roomId, consumerName);
    const sub = await consumer.consume();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    for await (const m of sub) {
      try {
        const payload = fromBinary(NatsMsgServerToClientSchema, m.data);
        await this.handleSystemEvents(payload);
      } catch (e) {
        const err = e as NatsError;
        console.error(err.message);
      }
      m.ack();
    }
  }

  private subscribeToSystemPublic = async () => {
    if (typeof this._js === 'undefined') {
      return;
    }

    const consumerName = this._subjects.systemPublic + ':' + this._userId;
    const consumer = await this._js.consumers.get(this._roomId, consumerName);
    const sub = await consumer.consume();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    for await (const m of sub) {
      try {
        const payload = fromBinary(NatsMsgServerToClientSchema, m.data);
        await this.handleSystemEvents(payload);
      } catch (e) {
        const err = e as NatsError;
        console.error(err.message);
      }
      m.ack();
    }
  };

  private subscribeToChat = async () => {
    if (typeof this._js === 'undefined') {
      return;
    }

    const consumerName = this._subjects.chat + ':' + this._userId;
    const consumer = await this._js.consumers.get(this._roomId, consumerName);
    const sub = await consumer.consume();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    for await (const m of sub) {
      try {
        const payload = fromBinary(ChatMessageSchema, m.data);
        payload.id = `${m.info.timestampNanos}`;
        await this.handleChat.handleMsg(payload);
      } catch (e) {
        const err = e as NatsError;
        console.error(err.message);
      }
      m.ack();
    }
  };

  private subscribeToWhiteboard = async () => {
    if (typeof this._js === 'undefined') {
      return;
    }

    const consumerName = this._subjects.whiteboard + ':' + this._userId;
    const consumer = await this._js.consumers.get(this._roomId, consumerName);
    const sub = await consumer.consume();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    for await (const m of sub) {
      try {
        const payload = fromBinary(DataChannelMessageSchema, m.data);
        // whiteboard data should not process by the same sender
        if (payload.fromUserId !== this._userId) {
          if (
            typeof payload.toUserId !== 'undefined' &&
            payload.toUserId !== this._userId
          ) {
            // receiver specified & this user was not the receiver
            // we'll not process further
            m.ack();
            continue;
          }
          await this.handleWhiteboard.handleWhiteboardMsg(payload);
        }
      } catch (e) {
        const err = e as NatsError;
        console.error(err.message);
      }
      m.ack();
    }
  };

  private subscribeToDataChannel = async () => {
    if (typeof this._js === 'undefined') {
      return;
    }

    const consumerName = this._subjects.dataChannel + ':' + this._userId;
    const consumer = await this._js.consumers.get(this._roomId, consumerName);
    const sub = await consumer.consume();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    for await (const m of sub) {
      try {
        const payload = fromBinary(DataChannelMessageSchema, m.data);
        if (
          typeof payload.toUserId !== 'undefined' &&
          payload.toUserId !== this._userId
        ) {
          // receiver specified & this user was not the receiver
          // we'll not process further
          m.ack();
          continue;
        }
        // fromUserId check inside handleMessage method
        await this.handleDataMsg.handleMessage(payload);
      } catch (e) {
        const err = e as NatsError;
        console.error(err.message);
      }
      m.ack();
    }
  };

  private async handleSystemEvents(payload: NatsMsgServerToClient) {
    switch (payload.event) {
      case NatsMsgServerToClientEvents.RES_INITIAL_DATA:
        await this.handleInitialData(payload.msg);
        this._setRoomConnectionStatusState('ready');
        break;
      case NatsMsgServerToClientEvents.JOINED_USERS_LIST:
        await this.handleJoinedUsersList(payload.msg);
        break;
      case NatsMsgServerToClientEvents.ROOM_METADATA_UPDATE:
        await this.handleRoomData.updateRoomMetadata(payload.msg);
        break;
      case NatsMsgServerToClientEvents.RESP_RENEW_PNM_TOKEN:
        this._token = payload.msg.toString();
        store.dispatch(addToken(this._token));
        break;
      case NatsMsgServerToClientEvents.SYSTEM_NOTIFICATION:
        this.handleSystemData.handleNotification(payload.msg);
        break;
      case NatsMsgServerToClientEvents.USER_JOINED:
        await this.handleParticipants.addRemoteParticipant(payload.msg);
        break;
      case NatsMsgServerToClientEvents.USER_DISCONNECTED:
        this.handleParticipants.handleParticipantDisconnected(payload.msg);
        break;
      case NatsMsgServerToClientEvents.USER_OFFLINE:
        this.handleParticipants.handleParticipantOffline(payload.msg);
        break;
      case NatsMsgServerToClientEvents.USER_METADATA_UPDATE:
        await this.handleParticipants.handleParticipantMetadataUpdate(
          payload.msg,
        );
        break;
      case NatsMsgServerToClientEvents.AZURE_COGNITIVE_SERVICE_SPEECH_TOKEN:
        this.handleSystemData.handleAzureToken(payload.msg);
        break;
      case NatsMsgServerToClientEvents.SESSION_ENDED:
        await this.endSession(payload.msg);
        break;
      case NatsMsgServerToClientEvents.POLL_CREATED:
      case NatsMsgServerToClientEvents.POLL_CLOSED:
        this.handleSystemData.handlePoll(payload);
        break;
      case NatsMsgServerToClientEvents.JOIN_BREAKOUT_ROOM:
        this.handleSystemData.handleBreakoutRoomNotifications(payload.msg);
        break;
      case NatsMsgServerToClientEvents.SYSTEM_CHAT_MSG:
        this.handleSystemData.handleSysChatMsg(payload.msg);
        break;
    }
  }

  private startTokenRenewInterval() {
    this.tokenRenewInterval = setInterval(async () => {
      const msg = create(NatsMsgClientToServerSchema, {
        event: NatsMsgClientToServerEvents.REQ_RENEW_PNM_TOKEN,
        msg: this._token,
      });
      await this.sendMessageToSystemWorker(msg);
    }, RENEW_TOKEN_FREQUENT);
  }

  private async startPingToServer() {
    const ping = async () => {
      await this.sendMessageToSystemWorker(
        create(NatsMsgClientToServerSchema, {
          event: NatsMsgClientToServerEvents.PING,
        }),
      );
    };
    this.pingInterval = setInterval(async () => {
      await ping();
    }, PING_INTERVAL);
    // start instantly
    await ping();
  }

  private async handleInitialData(msg: string) {
    let data: NatsInitialData;
    try {
      data = fromJsonString(NatsInitialDataSchema, msg);
    } catch (e) {
      this.setErrorStatus(
        i18n.t('notifications.decode-error-title'),
        i18n.t('decode-error-body'),
      );
      return;
    }
    // add local user first
    if (data.localUser) {
      this._isAdmin = data.localUser.isAdmin;
      await this.handleParticipants.addLocalParticipantInfo(data.localUser);
    }
    // now room
    if (data.room) {
      await this.handleRoomData.setRoomInfo(data.room);
    }
    // media info
    if (data.mediaServerInfo) {
      await this.createMediaServerConn(data.mediaServerInfo);
    }
  }

  private async handleJoinedUsersList(msg: string) {
    try {
      const onlineUsers: string[] = JSON.parse(msg);
      for (let i = 0; i < onlineUsers.length; i++) {
        const user = fromJson(NatsKvUserInfoSchema, onlineUsers[i]);
        await this.handleParticipants.addRemoteParticipant(user);
      }
      await this.onAfterUserReady();
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * This method should call when the current user is ready
   * with an initial data & users list
   */
  private async onAfterUserReady() {
    const participants = participantsSelector
      .selectAll(store.getState())
      .filter((participant) => participant.userId !== this._userId);

    if (!participants.length) return;
    participants.sort((a, b) => {
      return a.joinedAt - b.joinedAt;
    });
    const donor = participants[0];

    await this.sendDataMessage(
      DataMsgBodyType.REQ_INIT_WHITEBOARD_DATA,
      '',
      donor.userId,
    );
  }

  private async createMediaServerConn(connInfo: MediaServerConnInfo) {
    if (typeof this._mediaServerConn !== 'undefined') {
      return;
    }
    const info: LivekitInfo = {
      livekit_host: connInfo.url,
      token: connInfo.token,
    };

    const e2eeFeatures =
      this.handleRoomData.roomInfo.metadata?.roomFeatures
        ?.endToEndEncryptionFeatures;
    if (e2eeFeatures && e2eeFeatures.isEnabled && e2eeFeatures.encryptionKey) {
      if (!isE2EESupported()) {
        this.setErrorStatus(
          i18n.t('notifications.e2ee-unsupported-browser-title'),
          i18n.t('notifications.e2ee-unsupported-browser-msg'),
        );
        return;
      } else {
        info.enabledE2EE = true;
        info.encryption_key = e2eeFeatures.encryptionKey;
      }
    }

    const conn = createLivekitConnection(
      info,
      this._setErrorState,
      this._setRoomConnectionStatusState,
    );

    this._setCurrentMediaServerConn(conn);
    this._mediaServerConn = conn;
  }

  private formatError(err: any) {
    let msg = i18n.t('notifications.nats-error-request-failed').toString();

    switch (err.code) {
      case ErrorCode.NoResponders:
        msg = i18n.t('notifications.nats-error-no-response', {
          error: `${err.name}: ${err.message}`,
        });
        break;
      case ErrorCode.Timeout:
        msg = i18n.t('notifications.nats-error-timeout', {
          error: `${err.name}: ${err.message}`,
        });
        break;
    }

    return msg;
  }
}
