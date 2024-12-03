import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ApproveWaitingUsersReqSchema,
  CommonResponseSchema,
  RemoveParticipantReqSchema,
} from 'plugnmeet-protocol-js';
import { create, fromBinary, toBinary } from '@bufbuild/protobuf';

import { IParticipant } from '../../store/slices/interfaces/participant';
import sendAPIRequest from '../../helpers/api/plugNmeetAPI';
import { toast } from 'react-toastify';
import { store } from '../../store';

interface IParticipantsListProps {
  waitingParticipants: IParticipant[];
}

const ParticipantsList = ({ waitingParticipants }: IParticipantsListProps) => {
  const { t } = useTranslation();

  const acceptUser = async (userId: string) => {
    const body = create(ApproveWaitingUsersReqSchema, {
      userId: userId,
    });

    const r = await sendAPIRequest(
      'waitingRoom/approveUsers',
      toBinary(ApproveWaitingUsersReqSchema, body),
      false,
      'application/protobuf',
      'arraybuffer',
    );
    const res = fromBinary(CommonResponseSchema, new Uint8Array(r));

    if (res.status) {
      toast(t('left-panel.menus.notice.user-approved', { name: name }), {
        type: 'info',
      });
    } else {
      toast(t(res.msg), {
        type: 'error',
      });
    }
  };

  const rejectUser = async (userId: string, block: boolean) => {
    const session = store.getState().session;
    const body = create(RemoveParticipantReqSchema, {
      sid: session.currentRoom.sid,
      roomId: session.currentRoom.roomId,
      userId: userId,
      msg: t('notifications.you-have-reject').toString(),
      blockUser: block,
    });

    const r = await sendAPIRequest(
      'removeParticipant',
      toBinary(RemoveParticipantReqSchema, body),
      false,
      'application/protobuf',
      'arraybuffer',
    );
    const res = fromBinary(CommonResponseSchema, new Uint8Array(r));

    if (res.status) {
      toast(t('left-panel.menus.notice.participant-removed'), {
        toastId: 'user-remove-status',
        type: 'info',
      });
    } else {
      toast(t(res.msg), {
        type: 'error',
      });
    }
  };

  const renderWaitingParticipants = () => {
    return waitingParticipants.map((p) => {
      return (
        <div
          className="waiting-list-item mb-2 last:mb-0 pb-2 last:pb-0 border-b last:border-b-0 border-solid border-Blue w-full"
          key={p.userId}
        >
          <p className="text-base text-Gray-950 mb-2 capitalize font-medium">
            {p.name}
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => acceptUser(p.userId)}
              className="py-1 w-full flex items-center justify-center rounded-xl text-xs font-semibold text-Gray-950 bg-Gray-25 border border-Gray-300 transition-all duration-300 hover:bg-Gray-50 shadow-buttonShadow"
            >
              {t('left-panel.approve')}
            </button>
            <button
              onClick={() => rejectUser(p.userId, false)}
              className="py-1 w-full flex items-center justify-center rounded-xl text-xs font-semibold text-white bg-Red-400 border border-Red-600 transition-all duration-300 hover:bg-Red-600 shadow-buttonShadow"
            >
              {t('left-panel.reject')}
            </button>
            <button
              onClick={() => rejectUser(p.userId, true)}
              className="py-1 w-full flex items-center justify-center rounded-xl text-xs font-semibold text-white bg-Red-400 border border-Red-600 transition-all duration-300 hover:bg-Red-600 shadow-buttonShadow"
            >
              {t('waiting-room.reject-and-block-user')}
            </button>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="waiting-list-wrap">
      <p className="text-lg my-4 text-Gray-950 font-medium ltr:text-left rtl:text-right">
        {t('waiting-room.list-waiting-participants', {
          count: waitingParticipants.length,
        })}
      </p>
      <div className="waiting-list scrollBar h-[133px] overflow-auto">
        <div className="waiting-list-inner">{renderWaitingParticipants()}</div>
      </div>
    </div>
  );
};

export default ParticipantsList;
