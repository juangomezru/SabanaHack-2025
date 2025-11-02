"use client";

import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import StoreCard from './components/StoreCard';
import { STORES_DATA } from './constants';
import type { Store } from './types';

const App: React.FC = () => {
  const [points, setPoints] = useState<number>(5000);
  const [claimedOffers, setClaimedOffers] = useState<Set<number>>(new Set());
  const stores: Store[] = STORES_DATA;

  const handleClaimOffer = useCallback((offerId: number, pointsRequired: number) => {
    if (points >= pointsRequired && !claimedOffers.has(offerId)) {
      setPoints(prevPoints => prevPoints - pointsRequired);
      setClaimedOffers(prevClaimed => new Set(prevClaimed).add(offerId));
    }
  }, [points, claimedOffers]);

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <Header points={points} />
      <main className="pt-28 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-extrabold text-slate-800 mb-2 text-center">Tus Recompensas</h1>
          <p className="text-lg text-slate-600 mb-10 text-center max-w-2xl mx-auto">
            Explora ofertas exclusivas, descuentos y bonos de tus tiendas favoritas. ¡Usa tus puntos para obtener increíbles beneficios!
          </p>

          <div className="space-y-12">
            {stores.map(store => (
              <StoreCard 
                key={store.id} 
                store={store} 
                userPoints={points}
                onClaimOffer={handleClaimOffer}
                claimedOffers={claimedOffers}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
