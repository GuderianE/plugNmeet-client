import React from 'react';
import { useAppSelector } from '../../../../../common/store';
import { participantsSelector } from '../../../../../common/store/slices/participantSlice';

interface MicIconProps {
  userId: string;
}

const MicIcon = ({ userId }: MicIconProps) => {
  const participant = useAppSelector((state) =>
    participantsSelector.selectById(state, userId),
  );

  const render = () => {
    if (participant?.audioTracks) {
      if (participant.isMuted) {
        return (
          <div className="mic muted mr-2 cursor-pointer">
            <i className="pnm-mic-mute secondaryColor opacity-50 text-[8px]" />
          </div>
        );
      }
      return (
        <div className="mic mr-2 cursor-pointer">
          <i className="pnm-mic-unmute secondaryColor opacity-50 text-[8px]" />
        </div>
      );
    }

    return null;
  };

  return render();
};

export default MicIcon;
