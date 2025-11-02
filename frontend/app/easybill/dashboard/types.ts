
export enum OfferType {
  DISCOUNT = 'DISCOUNT',
  BONUS = 'BONUS',
  FREEBIE = 'FREEBIE',
}

export interface Offer {
  id: number;
  type: OfferType;
  title: string;
  description: string;
  pointsRequired: number;
}

export interface Store {
  id: number;
  name: string;
  logoUrl: string;
  offers: Offer[];
}
