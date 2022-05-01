import React from 'react';

import { useAppSelector } from '../../../../../common/store';
import { participantsSelector } from '../../../../../common/store/slices/participantSlice';

interface IPresenterIconProps {
  userId: string;
}

const PresenterIcon = ({ userId }: IPresenterIconProps) => {
  const participant = useAppSelector((state) =>
    participantsSelector.selectById(state, userId),
  );

  const render = () => {
    if (participant?.metadata.is_presenter) {
      return (
        <div className="presenter mr-2 cursor-pointer">
          <i className="pnm-presenter secondaryColor opacity-50 text-[8px]" />
        </div>
      );
    }

    return null;
  };

  return render();
};

export default PresenterIcon;
