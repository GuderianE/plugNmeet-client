import React from 'react';
import { useTranslation } from 'react-i18next';

import { store, useAppSelector } from '../../../common/store';
import { participantsSelector } from '../../../common/store/slices/participantSlice';
import ParticipantComponent from './participant';

const LeftPanel = () => {
  const participants = useAppSelector(participantsSelector.selectAll);
  const { t } = useTranslation();

  const renderParticipants = () => {
    const session = store.getState().session;
    const currentUserUserId = session.currentUser?.userId;
    const allow_view_other_users_list =
      session.currentRoom.metadata?.room_features
        ?.allow_view_other_users_list ?? false;
    const currentIsAdmin = session.currentUser?.metadata?.is_admin ?? false;

    return participants.map((participant) => {
      if (!currentIsAdmin && !allow_view_other_users_list) {
        if (
          !participant.metadata.is_admin &&
          currentUserUserId !== participant.userId
        ) {
          return;
        }
      }
      return (
        <ParticipantComponent key={participant.sid} participant={participant} />
      );
    });
  };

  return (
    <div
      id="main-left-panel"
      className="participants-wrapper scrollBar relative z-10 left-0 top-0 h-full w-[200px] xl:w-[270px] px-2 xl:px-4 pt-2 xl:pt-5 overflow-auto multi-gradient"
    >
      <div className="inner-wrapper relative z-20">
        <div className="top flex items-center justify-between font-medium mb-3 xl:mb-5">
          <p className="text-sm text-black">
            {t('left-panel.participants', {
              total: participants.length,
            })}
          </p>
        </div>

        <div className="all-participants-wrap">{renderParticipants()}</div>
      </div>
    </div>
  );
};

export default React.memo(LeftPanel);
