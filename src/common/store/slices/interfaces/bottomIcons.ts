import { BackgroundConfig } from '../../../../web/components/virtual-background/helpers/backgroundHelper';

export interface IBottomIconsSlice {
  isActiveMicrophone: boolean;
  isActiveWebcam: boolean;
  isActiveChatPanel: boolean;
  isActiveParticipantsPanel: boolean;
  isActiveRaisehand: boolean;
  isActiveRecording: boolean;
  isActiveScreenshare: boolean;
  isActiveSharedNotePad: boolean;
  isActiveWhiteboard: boolean;

  isMicMuted: boolean;
  screenWidth: number;
  screenHeight: number;

  // modal related
  showMicrophoneModal: boolean;
  showVideoShareModal: boolean;
  showLockSettingsModal: boolean;
  showRtmpModal: boolean;
  showExternalMediaPlayerModal: boolean;

  totalUnreadChatMsgs: number;
  virtualBackground: BackgroundConfig;
}
