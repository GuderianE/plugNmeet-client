import React, { useMemo } from 'react';
import { useAppSelector } from '../../../../store';
import { participantsSelector } from '../../../../store/slices/participantSlice';
import { HandsIconSVG } from '../../../../assets/Icons/HandsIconSVG';

interface IRaiseHandIconProps {
  userId: string;
}
const RaiseHandIcon = ({ userId }: IRaiseHandIconProps) => {
  const raisedHand = useAppSelector(
    (state) =>
      participantsSelector.selectById(state, userId)?.metadata.raisedHand,
  );

  const render = useMemo(() => {
    if (raisedHand) {
      return (
        <div className="hand cursor-pointer w-8 h-8 flex items-center justify-center">
          {/* <i className="pnm-raise-hand text-[#ffbd40] text-[10px]" /> */}
          <HandsIconSVG classes={'h-4 w-auto'} />
        </div>
      );
    } else {
      return null;
    }
  }, [raisedHand]);

  return <>{render}</>;
};

export default RaiseHandIcon;
