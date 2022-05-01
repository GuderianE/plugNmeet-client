import React from 'react';
import { Switch } from '@headlessui/react';
import { createSelector } from '@reduxjs/toolkit';
import { useTranslation } from 'react-i18next';

import {
  RootState,
  useAppDispatch,
  useAppSelector,
} from '../../../../common/store';
import {
  updateActivateWebcamsView,
  updateActiveScreenSharingView,
} from '../../../../common/store/slices/roomSettingsSlice';

const activateWebcamsViewSelector = createSelector(
  (state: RootState) => state.roomSettings.activateWebcamsView,
  (activateWebcamsView) => activateWebcamsView,
);

const activeScreenSharingViewSelector = createSelector(
  (state: RootState) => state.roomSettings.activeScreenSharingView,
  (activeScreenSharingView) => activeScreenSharingView,
);

const DataSavings = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const activateWebcamsView = useAppSelector(activateWebcamsViewSelector);
  const activeScreenSharingView = useAppSelector(
    activeScreenSharingViewSelector,
  );

  const toggleWebcamView = () => {
    dispatch(updateActivateWebcamsView(!activateWebcamsView));
  };

  const toggleScreenShareView = () => {
    dispatch(updateActiveScreenSharingView(!activeScreenSharingView));
  };

  const render = () => {
    return (
      <Switch.Group>
        <div className="flex items-center justify-between mb-2">
          <Switch.Label className="pr-4 w-full">
            {t('header.room-settings.show-webcams')}
          </Switch.Label>
          <Switch
            checked={activateWebcamsView}
            onChange={toggleWebcamView}
            className={`${
              activateWebcamsView ? 'bg-primaryColor' : 'bg-gray-200'
            } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            <span
              className={`${
                activateWebcamsView ? 'translate-x-6' : 'translate-x-1'
              } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
            />
          </Switch>
        </div>
        <div className="flex items-center justify-between">
          <Switch.Label className="pr-4 w-full">
            {t('header.room-settings.show-screen-share')}
          </Switch.Label>
          <Switch
            checked={activeScreenSharingView}
            onChange={toggleScreenShareView}
            className={`${
              activeScreenSharingView ? 'bg-primaryColor' : 'bg-gray-200'
            } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            <span
              className={`${
                activeScreenSharingView ? 'translate-x-6' : 'translate-x-1'
              } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
            />
          </Switch>
        </div>
      </Switch.Group>
    );
  };

  return <div className="mt-2">{render()}</div>;
};

export default DataSavings;
