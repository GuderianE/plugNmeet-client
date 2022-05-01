import React, { Fragment, useState } from 'react';
import { Transition, Dialog } from '@headlessui/react';
import { createSelector } from '@reduxjs/toolkit';
import { useTranslation } from 'react-i18next';
import { isEmpty } from 'lodash';

import {
  RootState,
  useAppDispatch,
  useAppSelector,
} from '../../../../common/store';
import { updateShowExternalMediaPlayerModal } from '../../../../common/store/slices/bottomIconsActivitySlice';
import sendAPIRequest from '../../../../common/helpers/api/plugNmeetAPI';
import { toast } from 'react-toastify';
import ReactPlayer from 'react-player/lazy';

const externalMediaPlayerIsActiveSelector = createSelector(
  (state: RootState) =>
    state.session.currentRoom.metadata?.room_features
      .external_media_player_features.is_active,
  (is_active) => is_active,
);

const ExternalMediaPlayerModal = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const externalMediaPlayerIsActive = useAppSelector(
    externalMediaPlayerIsActiveSelector,
  );
  const [playBackUrl, setPlayBackUrl] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>();

  const onChangeUrl = (e) => {
    if (errorMsg) {
      setErrorMsg(undefined);
    }
    setPlayBackUrl(e.currentTarget.value);
  };

  const closeStartModal = () => {
    dispatch(updateShowExternalMediaPlayerModal(false));
  };

  const startPlayer = async (e) => {
    e.preventDefault();

    if (isEmpty(playBackUrl)) {
      setErrorMsg(t('footer.notice.external-media-player-url-required'));
      return;
    }

    if (!ReactPlayer.canPlay(playBackUrl)) {
      setErrorMsg(t('footer.notice.external-media-player-url-invalid'));
      return;
    }

    setErrorMsg(undefined);
    closeStartModal();

    const id = toast.loading(
      t('footer.notice.external-media-player-starting'),
      {
        type: 'info',
      },
    );

    const body = {
      task: 'start-playback',
      url: playBackUrl,
    };
    const res = await sendAPIRequest('externalMediaPlayer', body);

    if (!res.status) {
      toast.update(id, {
        render: t(res.msg),
        type: 'error',
        isLoading: false,
        autoClose: 1000,
      });
    }

    toast.dismiss(id);
    dispatch(updateShowExternalMediaPlayerModal(false));
  };

  const onCloseAlertModal = async (status = false) => {
    closeStartModal();

    if (!status) {
      return;
    }

    const id = toast.loading(
      t('footer.notice.external-media-player-stopping'),
      {
        type: 'info',
      },
    );

    const body = {
      task: 'end-playback',
    };
    const res = await sendAPIRequest('externalMediaPlayer', body);

    if (!res.status) {
      toast.update(id, {
        render: t('res.msg'),
        type: 'error',
        isLoading: false,
        autoClose: 1000,
      });
    }

    toast.dismiss(id);
    dispatch(updateShowExternalMediaPlayerModal(false));
  };

  const renderStartPlaybackModal = () => {
    return (
      <>
        <Transition appear show={!externalMediaPlayerIsActive} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-[9999] overflow-y-auto"
            onClose={closeStartModal}
          >
            <div className="min-h-screen px-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
              </Transition.Child>

              <span
                className="inline-block h-screen align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                  <button
                    className="close-btn absolute top-8 right-6 w-[25px] h-[25px] outline-none"
                    type="button"
                    onClick={() => closeStartModal()}
                  >
                    <span className="inline-block h-[1px] w-[20px] bg-primaryColor absolute top-0 left-0 rotate-45" />
                    <span className="inline-block h-[1px] w-[20px] bg-primaryColor absolute top-0 left-0 -rotate-45" />
                  </button>

                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 text-left mb-2"
                  >
                    {t('footer.modal.external-media-player-title')}
                  </Dialog.Title>
                  <hr />
                  <div className="mt-6">
                    <form
                      action="src/web/components/footer/modals/externalMediaPlayer#"
                      method="POST"
                      onSubmit={(e) => startPlayer(e)}
                    >
                      <div className="s">
                        <div className="">
                          <div className="">
                            <label
                              htmlFor="stream-key"
                              className="block text-sm font-medium text-gray-700"
                            >
                              {t('footer.modal.external-media-player-url')}
                            </label>
                            <input
                              type="text"
                              name="stream-key"
                              id="stream-key"
                              value={playBackUrl}
                              onChange={onChangeUrl}
                              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md h-10 border border-solid border-black/50"
                            />
                            {errorMsg ? (
                              <div className="error-msg absolute text-xs text-red-600 py-2">
                                {errorMsg}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <div className="pb-3 pt-4 bg-gray-50 text-right mt-4">
                        <button
                          type="submit"
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primaryColor hover:bg-secondaryColor focus:outline-none focus:ring-2 focus:ring-offset-2 focus:bg-secondaryColor"
                        >
                          {t('footer.modal.external-media-player-play')}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      </>
    );
  };

  const alertModal = () => {
    return (
      <>
        <Transition appear show={externalMediaPlayerIsActive} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-[9999] overflow-y-auto"
            onClose={onCloseAlertModal}
          >
            <div className="min-h-screen px-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
              </Transition.Child>

              <span
                className="inline-block h-screen align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                  <button
                    className="close-btn absolute top-8 right-6 w-[25px] h-[25px] outline-none"
                    type="button"
                    onClick={() => onCloseAlertModal()}
                  >
                    <span className="inline-block h-[1px] w-[20px] bg-primaryColor absolute top-0 left-0 rotate-45" />
                    <span className="inline-block h-[1px] w-[20px] bg-primaryColor absolute top-0 left-0 -rotate-45" />
                  </button>

                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {t('footer.modal.external-media-player-close-confirm')}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {t('footer.modal.external-media-player-close-msg')}
                    </p>
                  </div>

                  <div className="mt-4">
                    <button
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 mr-4 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                      onClick={() => onCloseAlertModal(true)}
                    >
                      {t('ok')}
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                      onClick={() => onCloseAlertModal(false)}
                    >
                      {t('close')}
                    </button>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      </>
    );
  };

  return (
    <>
      {!externalMediaPlayerIsActive ? renderStartPlaybackModal() : alertModal()}
    </>
  );
};

export default ExternalMediaPlayerModal;
