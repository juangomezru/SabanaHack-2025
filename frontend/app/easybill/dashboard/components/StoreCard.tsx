
import React from 'react';
import OfferCard from './OfferCard';
import type { Store } from '../types';

interface StoreCardProps {
  store: Store;
  userPoints: number;
  onClaimOffer: (offerId: number, pointsRequired: number) => void;
  claimedOffers: Set<number>;
}

const StoreCard: React.FC<StoreCardProps> = ({ store, userPoints, onClaimOffer, claimedOffers }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-2xl">
      <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center space-x-4">
        <img 
          src={store.logoUrl} 
          alt={`${store.name} logo`} 
          className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
        />
        <h2 className="text-3xl font-bold text-slate-800">{store.name}</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {store.offers.map(offer => (
            <OfferCard 
              key={offer.id} 
              offer={offer}
              userPoints={userPoints}
              onClaim={() => onClaimOffer(offer.id, offer.pointsRequired)}
              isClaimed={claimedOffers.has(offer.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoreCard;
