import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createSelector } from '@reduxjs/toolkit';

import {
  RootState,
  store,
  useAppDispatch,
  useAppSelector,
} from '../../../store';
import { updateIsActiveWhiteboard } from '../../../store/slices/bottomIconsActivitySlice';
import sendAPIRequest from '../../../helpers/api/plugNmeetAPI';

const isActiveWhiteboardSelector = createSelector(
  (state: RootState) => state.bottomIconsActivity.isActiveWhiteboard,
  (isActiveWhiteboard) => isActiveWhiteboard,
);

const isWhiteboardVisibleSelector = createSelector(
  (state: RootState) =>
    state.session.currentRoom.metadata?.room_features.whiteboard_features
      .visible,
  (visible) => visible,
);

const Whiteboard = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const showTooltip = store.getState().session.userDeviceType === 'desktop';
  const [iconCSS, setIconCSS] = useState<string>('brand-color1');
  const isActiveWhiteboard = useAppSelector(isActiveWhiteboardSelector);
  const isVisible = useAppSelector(isWhiteboardVisibleSelector);
  const allowedWhiteboard =
    store.getState().session.currentRoom.metadata?.room_features
      .whiteboard_features.allowed_whiteboard;
  const isAdmin = store.getState().session.currenUser?.metadata?.is_admin;

  useEffect(() => {
    if (isActiveWhiteboard) {
      setIconCSS('brand-color2');
    } else {
      setIconCSS('brand-color1');
    }
  }, [dispatch, isActiveWhiteboard]);

  useEffect(() => {
    if (!allowedWhiteboard && isAdmin) {
      return;
    }

    if (isVisible) {
      dispatch(updateIsActiveWhiteboard(true));
    } else {
      dispatch(updateIsActiveWhiteboard(false));
    }
    //eslint-disable-next-line
  }, [isVisible]);

  useEffect(() => {
    const sendRequest = async (body) => {
      await sendAPIRequest('changeVisibility', body);
    };

    const currentRoom = store.getState().session.currentRoom;

    if (
      isActiveWhiteboard &&
      !currentRoom.metadata?.room_features.whiteboard_features.visible
    ) {
      const body: any = {
        room_id: currentRoom.room_id,
        visible_white_board: true,
        visible_notepad: false,
      };
      sendRequest(body);
    } else if (
      !isActiveWhiteboard &&
      currentRoom.metadata?.room_features.whiteboard_features.visible
    ) {
      const body: any = {
        room_id: currentRoom.room_id,
        visible_white_board: false,
      };
      sendRequest(body);
    }
  }, [isActiveWhiteboard]);

  const text = () => {
    if (isActiveWhiteboard) {
      return t('footer.icons.hide-whiteboard');
    } else {
      return t('footer.icons.show-whiteboard');
    }
  };

  const toggleWhiteboard = async () => {
    dispatch(updateIsActiveWhiteboard(!isActiveWhiteboard));
  };

  const render = () => {
    return (
      <div
        className={`whiteboard h-[35px] lg:h-[40px] w-[35px] lg:w-[40px] relative rounded-full bg-[#F2F2F2] hover:bg-[#ECF4FF] mr-3 lg:mr-6 flex items-center justify-center cursor-pointer ${
          showTooltip ? 'has-tooltip' : ''
        }`}
        onClick={() => toggleWhiteboard()}
      >
        <span className="tooltip rounded shadow-lg p-1 bg-gray-100 text-red-500 -mt-16 text-[10px] w-max">
          {text()}
        </span>
        <React.Fragment>
          <i
            className={`pnm-whiteboard ${iconCSS} text-[12px] lg:text-[16px]`}
          />
        </React.Fragment>
      </div>
    );
  };

  return <>{allowedWhiteboard ? render() : null}</>;
};

export default Whiteboard;
