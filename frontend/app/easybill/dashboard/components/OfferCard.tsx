
import React from 'react';
import { OfferType } from '../types';
import type { Offer } from '../types';
import { DiscountIcon, BonusIcon, FreebieIcon, StarIcon, CheckCircleIcon } from './Icons';

interface OfferCardProps {
  offer: Offer;
  userPoints: number;
  onClaim: () => void;
  isClaimed: boolean;
}

const OfferIcon: React.FC<{ type: OfferType }> = ({ type }) => {
  const iconClasses = "w-8 h-8";
  switch (type) {
    case OfferType.DISCOUNT:
      return <DiscountIcon className={`${iconClasses} text-green-500`} />;
    case OfferType.BONUS:
      return <BonusIcon className={`${iconClasses} text-blue-500`} />;
    case OfferType.FREEBIE:
      return <FreebieIcon className={`${iconClasses} text-purple-500`} />;
    default:
      return null;
  }
};

const OfferCard: React.FC<OfferCardProps> = ({ offer, userPoints, onClaim, isClaimed }) => {
  const canClaim = userPoints >= offer.pointsRequired;

  const getButtonState = () => {
    if (isClaimed) {
      return {
        text: 'Canjeado',
        icon: <CheckCircleIcon className="w-5 h-5 mr-2" />,
        disabled: true,
        className: 'bg-green-600 text-white cursor-not-allowed',
      };
    }
    if (canClaim) {
      return {
        text: 'Canjear Ahora',
        icon: null,
        disabled: false,
        className: 'bg-indigo-600 hover:bg-indigo-700 text-white transition-colors',
      };
    }
    return {
      text: 'Puntos insuficientes',
      icon: null,
      disabled: true,
      className: 'bg-slate-300 text-slate-500 cursor-not-allowed',
    };
  };

  const buttonState = getButtonState();

  return (
    <div className="border border-slate-200 rounded-lg p-5 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-shrink-0 bg-slate-100 rounded-full p-3">
          <OfferIcon type={offer.type} />
        </div>
        <div className="flex items-center font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          <StarIcon className="w-5 h-5 mr-1.5 text-yellow-400" />
          <span>{new Intl.NumberFormat().format(offer.pointsRequired)}</span>
        </div>
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">{offer.title}</h3>
      <p className="text-slate-600 text-sm mb-4 flex-grow">{offer.description}</p>
      <button
        onClick={onClaim}
        disabled={buttonState.disabled}
        className={`w-full font-bold py-2.5 px-4 rounded-lg flex items-center justify-center ${buttonState.className}`}
      >
        {buttonState.icon}
        {buttonState.text}
      </button>
    </div>
  );
};

export default OfferCard;
