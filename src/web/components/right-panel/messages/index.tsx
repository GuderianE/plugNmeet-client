import { createSelector } from '@reduxjs/toolkit';
import React, { useEffect, useRef } from 'react';

import { useAppSelector, RootState } from '../../../../common/store';
import { IChatMsg } from '../../../../common/store/slices/interfaces/dataMessages';
import Message from './message';
import { chatMessagesSelector } from '../../../../common/store/slices/chatMessagesSlice';

const currentUserSelector = createSelector(
  (state: RootState) => state.session.currentUser,
  (currentUser) => currentUser,
);

const Messages = () => {
  const messageRef = useRef<HTMLDivElement>(null);
  const chatMessages = useAppSelector(chatMessagesSelector.selectAll);
  const currentUser = useAppSelector(currentUserSelector);

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest',
      });
    }
  });

  const render = () => {
    return chatMessages.map((msg) => {
      const body = msg as IChatMsg;
      return (
        <Message key={body.message_id} body={body} currentUser={currentUser} />
      );
    });
  };

  return (
    <div className="pb-3" ref={messageRef}>
      {render()}
    </div>
  );
};

export default Messages;
