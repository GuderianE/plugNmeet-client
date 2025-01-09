import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DeviceOrientation, IBottomIconsSlice } from './interfaces/bottomIcons';
import {
  BackgroundConfig,
  defaultBackgroundConfig,
} from '../../components/virtual-background/helpers/backgroundHelper';

const initialState: IBottomIconsSlice = {
  isActiveMicrophone: false,
  isActiveWebcam: false,
  isActiveChatPanel: false,
  isActiveParticipantsPanel: true,
  isActiveRaisehand: false,
  isActiveRecording: false,
  isActiveScreenshare: false,
  isActiveSharedNotePad: false,
  isActiveWhiteboard: false,

  isMicMuted: false,
  screenWidth: 1024,
  screenHeight: 500,
  deviceOrientation: 'portrait',

  showMicrophoneModal: false,
  showVideoShareModal: false,
  showLockSettingsModal: false,
  showRtmpModal: false,
  showExternalMediaPlayerModal: false,
  showManageWaitingRoomModal: false,
  showManageBreakoutRoomModal: false,
  showDisplayExternalLinkModal: false,
  showSpeechSettingsModal: false,

  totalUnreadChatMsgs: 0,
  virtualBackground: defaultBackgroundConfig,
  isEnabledExtendedVerticalCamView: false,
};

const bottomIconsSlice = createSlice({
  name: 'bottomIconsActivity',
  initialState,
  reducers: {
    updateIsActiveMicrophone: (state, action: PayloadAction<boolean>) => {
      state.isActiveMicrophone = action.payload;
    },
    updateIsMicMuted: (state, action: PayloadAction<boolean>) => {
      state.isMicMuted = action.payload;
    },
    updateIsActiveWebcam: (state, action: PayloadAction<boolean>) => {
      state.isActiveWebcam = action.payload;
    },
    updateIsActiveChatPanel: (state, action: PayloadAction<boolean>) => {
      // we'll close ParticipantsPanel if screen size is small
      if (state.isActiveParticipantsPanel && action.payload) {
        state.isActiveParticipantsPanel = false;
      }
      state.isActiveChatPanel = action.payload;

      if (state.isActiveChatPanel) {
        // if open then we'll make it 0
        state.totalUnreadChatMsgs = 0;
        if (state.isEnabledExtendedVerticalCamView) {
          state.isEnabledExtendedVerticalCamView = false;
        }
      }
    },
    updateIsActiveParticipantsPanel: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      if (state.isActiveChatPanel && action.payload) {
        state.isActiveChatPanel = false;
      }
      state.isActiveParticipantsPanel = action.payload;
      if (
        state.isActiveParticipantsPanel &&
        state.isEnabledExtendedVerticalCamView
      ) {
        state.isEnabledExtendedVerticalCamView = false;
      }
    },
    updateIsActiveRaisehand: (state, action: PayloadAction<boolean>) => {
      state.isActiveRaisehand = action.payload;
    },
    updateIsActiveRecording: (state, action: PayloadAction<boolean>) => {
      state.isActiveRecording = action.payload;
    },
    updateIsActiveScreenshare: (state, action: PayloadAction<boolean>) => {
      state.isActiveScreenshare = action.payload;

      if (state.isActiveScreenshare) {
        // in this case disable both
        state.isActiveWhiteboard = false;
        state.isActiveParticipantsPanel = false;
      }
    },
    updateIsActiveSharedNotePad: (state, action: PayloadAction<boolean>) => {
      state.isActiveSharedNotePad = action.payload;
    },
    updateIsActiveWhiteboard: (state, action: PayloadAction<boolean>) => {
      state.isActiveWhiteboard = action.payload;
    },
    updateScreenWidth: (state, action: PayloadAction<number>) => {
      state.screenWidth = action.payload;
    },
    updateScreenHeight: (state, action: PayloadAction<number>) => {
      state.screenHeight = action.payload;
    },
    updateDeviceOrientation: (
      state,
      action: PayloadAction<DeviceOrientation>,
    ) => {
      state.deviceOrientation = action.payload;
    },

    // modal related
    updateShowMicrophoneModal: (state, action: PayloadAction<boolean>) => {
      state.showMicrophoneModal = action.payload;
    },
    updateShowVideoShareModal: (state, action: PayloadAction<boolean>) => {
      state.showVideoShareModal = action.payload;
    },
    updateShowLockSettingsModal: (state, action: PayloadAction<boolean>) => {
      state.showLockSettingsModal = action.payload;
    },
    updateShowRtmpModal: (state, action: PayloadAction<boolean>) => {
      state.showRtmpModal = action.payload;
    },
    updateShowExternalMediaPlayerModal: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.showExternalMediaPlayerModal = action.payload;
    },
    updateShowManageWaitingRoomModal: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.showManageWaitingRoomModal = action.payload;
    },
    updateShowManageBreakoutRoomModal: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.showManageBreakoutRoomModal = action.payload;
    },
    updateDisplayExternalLinkRoomModal: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.showDisplayExternalLinkModal = action.payload;
    },
    updateDisplaySpeechSettingsModal: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.showSpeechSettingsModal = action.payload;
    },
    updateTotalUnreadChatMsgs: (state) => {
      if (!state.isActiveChatPanel) {
        state.totalUnreadChatMsgs += 1;
      }
    },
    updateVirtualBackground: (
      state,
      action: PayloadAction<BackgroundConfig>,
    ) => {
      state.virtualBackground = action.payload;
    },
    updateIsEnabledExtendedVerticalCamView: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.isEnabledExtendedVerticalCamView = action.payload;
    },
  },
});

export const {
  updateIsActiveMicrophone,
  updateIsMicMuted,
  updateIsActiveWebcam,
  updateIsActiveChatPanel,
  updateIsActiveParticipantsPanel,
  updateIsActiveRaisehand,
  updateIsActiveRecording,
  updateIsActiveScreenshare,
  updateIsActiveSharedNotePad,
  updateIsActiveWhiteboard,
  updateShowMicrophoneModal,
  updateShowVideoShareModal,
  updateShowLockSettingsModal,
  updateShowManageWaitingRoomModal,
  updateShowRtmpModal,
  updateShowExternalMediaPlayerModal,
  updateShowManageBreakoutRoomModal,
  updateDisplayExternalLinkRoomModal,
  updateScreenWidth,
  updateScreenHeight,
  updateDeviceOrientation,
  updateTotalUnreadChatMsgs,
  updateVirtualBackground,
  updateDisplaySpeechSettingsModal,
  updateIsEnabledExtendedVerticalCamView,
} = bottomIconsSlice.actions;

export default bottomIconsSlice.reducer;
