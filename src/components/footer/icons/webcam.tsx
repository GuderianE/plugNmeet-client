import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createLocalVideoTrack, Track } from 'livekit-client';

import { store, useAppDispatch, useAppSelector } from '../../../store';
import {
  updateIsActiveWebcam,
  updateShowVideoShareModal,
  updateVirtualBackground,
} from '../../../store/slices/bottomIconsActivitySlice';
import ShareWebcamModal from '../modals/webcam/shareWebcam';
import WebcamMenu from './webcam-menu';
import { participantsSelector } from '../../../store/slices/participantSlice';
import { updateSelectedVideoDevice } from '../../../store/slices/roomSettingsSlice';
import VirtualBackground from '../../virtual-background/virtualBackground';
import { SourcePlayback } from '../../virtual-background/helpers/sourceHelper';
import { getWebcamResolution } from '../../../helpers/utils';
import { getMediaServerConnRoom } from '../../../helpers/livekit/utils';
import { Camera } from '../../../assets/Icons/Camera';
import { CameraOff } from '../../../assets/Icons/CameraOff';
import { PlusIcon } from '../../../assets/Icons/PlusIcon';
import { BlockedIcon } from '../../../assets/Icons/BlockedIcon';

const WebcamIcon = () => {
  const dispatch = useAppDispatch();
  const currentRoom = getMediaServerConnRoom();

  // we don't need this for small devices
  const showTooltip = store.getState().session.userDeviceType === 'desktop';

  const showVideoShareModal = useAppSelector(
    (state) => state.bottomIconsActivity.showVideoShareModal,
  );
  const isActiveWebcam = useAppSelector(
    (state) => state.bottomIconsActivity.isActiveWebcam,
  );
  const isWebcamLock = useAppSelector(
    (state) => state.session.currentUser?.metadata?.lockSettings?.lockWebcam,
  );
  const virtualBackground = useAppSelector(
    (state) => state.bottomIconsActivity.virtualBackground,
  );
  const selectedVideoDevice = useAppSelector(
    (state) => state.roomSettings.selectedVideoDevice,
  );
  const { t } = useTranslation();

  const [lockWebcam, setLockWebcam] = useState<boolean>(false);
  const [deviceId, setDeviceId] = useState<string>();
  const [sourcePlayback, setSourcePlayback] = useState<SourcePlayback>();
  const [virtualBgLocalTrack, setVirtualBgLocalTrack] = useState<MediaStream>();
  const virtualBgVideoPlayer = useRef<HTMLVideoElement>(null);

  // for change in webcam lock setting
  useEffect(() => {
    const closeMicOnLock = async () => {
      for (const [
        ,
        publication,
        // eslint-disable-next-line no-unsafe-optional-chaining
      ] of currentRoom?.localParticipant.videoTrackPublications.entries()) {
        if (publication.track && publication.source === Track.Source.Camera) {
          await currentRoom.localParticipant.unpublishTrack(
            publication.track,
            true,
          );
        }
      }
      dispatch(updateIsActiveWebcam(false));
    };

    if (isWebcamLock) {
      setLockWebcam(true);
      const currentUser = participantsSelector.selectById(
        store.getState(),
        currentRoom.localParticipant.identity,
      );
      if (currentUser?.videoTracks) {
        closeMicOnLock().then();
      }
    } else {
      setLockWebcam(false);
    }
  }, [isWebcamLock, currentRoom, dispatch]);

  // default room lock settings
  useEffect(() => {
    const isLock =
      store.getState().session.currentRoom.metadata?.defaultLockSettings
        ?.lockWebcam;
    const isAdmin = store.getState().session.currentUser?.metadata?.isAdmin;

    if (isLock && !isAdmin) {
      if (isWebcamLock !== false) {
        setLockWebcam(true);
      }
    }
    // eslint-disable-next-line
  }, []);

  // we should check & close track
  useEffect(() => {
    if (!isActiveWebcam && virtualBgLocalTrack && !selectedVideoDevice) {
      virtualBgLocalTrack.getTracks().forEach((t) => t.stop());
    }
    if (!isActiveWebcam && !selectedVideoDevice && deviceId) {
      setDeviceId(undefined);
    }
    //eslint-disable-next-line
  }, [selectedVideoDevice]);

  // this is required during changing webcam device
  useEffect(() => {
    if (!selectedVideoDevice || !deviceId) {
      return;
    }
    if (selectedVideoDevice === deviceId) {
      return;
    }

    const changeDevice = async (deviceId: string) => {
      await currentRoom.switchActiveDevice('videoinput', deviceId);
    };
    // for virtual background we'll require creating new stream
    const changeDeviceWithVB = async (deviceId: string) => {
      await createDeviceStream(deviceId);
    };

    if (virtualBackground.type === 'none') {
      changeDevice(selectedVideoDevice).then();
    } else {
      changeDeviceWithVB(selectedVideoDevice).then();
    }

    setDeviceId(selectedVideoDevice);
    // eslint-disable-next-line
  }, [selectedVideoDevice]);

  // virtualBgLocalTrack only update when using virtual background
  // need to stop previous track before starting new one
  useEffect(() => {
    if (virtualBgLocalTrack && virtualBgVideoPlayer) {
      const el = virtualBgVideoPlayer.current;
      if (el) {
        el.srcObject = virtualBgLocalTrack;
      }
    }
    return () => {
      if (virtualBgLocalTrack) {
        virtualBgLocalTrack.getTracks().forEach((t) => t.stop());
      }
    };
  }, [virtualBgLocalTrack]);

  // for virtual background
  const handleVirtualBgVideoOnLoad = () => {
    const el = virtualBgVideoPlayer.current;
    if (el) {
      setSourcePlayback({
        htmlElement: el,
        width: el.videoWidth ?? 320,
        height: el.videoHeight ?? 180,
      });
    }
  };

  const toggleWebcam = async () => {
    if (lockWebcam) {
      return;
    }

    if (!isActiveWebcam) {
      dispatch(updateShowVideoShareModal(!isActiveWebcam));
    } else if (isActiveWebcam) {
      // leave webcam
      for (const [
        ,
        publication,
      ] of currentRoom.localParticipant.videoTrackPublications.entries()) {
        if (
          publication.track &&
          publication.track.source === Track.Source.Camera
        ) {
          await currentRoom.localParticipant.unpublishTrack(
            publication.track,
            true,
          );
        }
      }
      dispatch(updateIsActiveWebcam(false));
      dispatch(updateSelectedVideoDevice(''));
      dispatch(
        updateVirtualBackground({
          type: 'none',
        }),
      );
    }
  };

  const createDeviceStream = async (deviceId: string) => {
    if (virtualBackground.type === 'none') {
      const resolution = getWebcamResolution();
      const track = await createLocalVideoTrack({
        deviceId: {
          exact: deviceId,
          ideal: deviceId,
        },
        resolution,
      });

      await currentRoom.localParticipant.publishTrack(track);
      dispatch(updateIsActiveWebcam(true));
    } else {
      const constraints: MediaStreamConstraints = {
        video: {
          // width: { min: 160, ideal: 320 },
          // height: { min: 90, ideal: 180 },
          deviceId: {
            exact: deviceId,
            ideal: deviceId,
          },
        },
      };
      const mediaStream =
        await navigator.mediaDevices.getUserMedia(constraints);
      setVirtualBgLocalTrack(mediaStream);
    }

    return;
  };

  const onSelectedDevice = async (deviceId: string) => {
    setDeviceId(deviceId);
    await createDeviceStream(deviceId);
    dispatch(updateSelectedVideoDevice(deviceId));
  };

  // handle virtual background canvas
  const onCanvasRef = (
    canvasRef: React.MutableRefObject<HTMLCanvasElement>,
  ) => {
    const stream = canvasRef.current.captureStream(25);
    stream.getTracks().forEach(async (track) => {
      if (track.kind === Track.Kind.Video) {
        await currentRoom.localParticipant.publishTrack(track, {
          source: Track.Source.Camera,
          name: 'canvas',
        });
        dispatch(updateIsActiveWebcam(true));
      }
    });
  };

  const shouldShow = () => {
    const session = store.getState().session;
    const room_features = session.currentRoom.metadata?.roomFeatures;
    const currentUser = session.currentUser;

    if (!room_features?.allowWebcams) {
      return false;
    } else if (
      room_features?.adminOnlyWebcams &&
      !currentUser?.metadata?.isAdmin
    ) {
      return false;
    }

    return true;
  };

  const getTooltipText = () => {
    if (!isActiveWebcam && !isWebcamLock) {
      return t('footer.icons.start-webcam');
    } else if (!isActiveWebcam && isWebcamLock) {
      return t('footer.icons.webcam-locked');
    } else if (isActiveWebcam) {
      return t('footer.icons.leave-webcam');
    }
  };

  const showButtons = () => {
    return (
      <>
        <div className="relative z-10">
          <div
            className={`cam-wrap relative cursor-pointer shadow-IconBox border border-Gray-300 rounded-2xl h-11 min-w-11 flex items-center justify-center transition-all duration-300 hover:bg-gray-200 text-Gray-950  ${
              showTooltip ? 'has-tooltip' : ''
            }`}
          >
            <span className="tooltip !-left-3 tooltip-left">
              {getTooltipText()}
            </span>
            <div
              className="w-11 h-11 relative flex items-center justify-center"
              onClick={() => toggleWebcam()}
            >
              {isActiveWebcam ? <Camera /> : null}
              {!isActiveWebcam ? (
                <>
                  <Camera />
                  <span className="add absolute -top-2 -right-2 z-10">
                    <PlusIcon />
                  </span>
                </>
              ) : null}
              {lockWebcam ? (
                <>
                  <CameraOff />
                  <span className="blocked absolute -top-2 -right-2 z-10">
                    <BlockedIcon />
                  </span>
                </>
              ) : null}
            </div>
            {isActiveWebcam ? <WebcamMenu currentRoom={currentRoom} /> : null}
          </div>
          {/* <div
            className={`camera footer-icon relative h-[35px] lg:h-[40px] w-[35px] lg:w-[40px] rounded-full bg-[#F2F2F2] dark:bg-darkSecondary2 hover:bg-[#ECF4FF] ltr:mr-3 lg:ltr:mr-6 rtl:ml-3 lg:rtl:ml-6 flex items-center justify-center cursor-pointer ${
              showTooltip ? 'has-tooltip' : ''
            }`}
          >
            <span className="tooltip !-left-3 tooltip-left">
              {getTooltipText()}
            </span>

            {!isActiveWebcam ? (
              <i className="pnm-webcam primaryColor dark:text-darkText text-[12px] lg:text-[14px]" />
            ) : null}
            {lockWebcam ? (
              <div className="arrow-down absolute -bottom-1 -right-1 w-[16px] h-[16px] rounded-full bg-white dark:bg-darkSecondary3 flex items-center justify-center">
                <i className="pnm-lock primaryColor" />
              </div>
            ) : null}

            {isActiveWebcam ? (
              <i className="pnm-webcam secondaryColor text-[12px] lg:text-[14px]" />
            ) : null}
          </div> */}
        </div>
      </>
    );
  };

  const render = () => {
    return (
      <>
        {showButtons()}

        {showVideoShareModal ? (
          <ShareWebcamModal onSelectedDevice={onSelectedDevice} />
        ) : null}

        {/*For virtual background*/}
        {sourcePlayback && deviceId && virtualBackground.type !== 'none' ? (
          <div style={{ display: 'none' }}>
            <VirtualBackground
              sourcePlayback={sourcePlayback}
              id={deviceId}
              backgroundConfig={virtualBackground}
              onCanvasRef={onCanvasRef}
            />
          </div>
        ) : null}
        {virtualBgLocalTrack ? (
          <div style={{ display: 'none' }}>
            <video
              ref={virtualBgVideoPlayer}
              autoPlay
              onLoadedData={handleVirtualBgVideoOnLoad}
            />
          </div>
        ) : null}
      </>
    );
  };

  return <>{shouldShow() ? render() : null}</>;
};

export default WebcamIcon;
