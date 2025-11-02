import { OfferType } from './types';
import type { Store } from './types';

export const STORES_DATA: Store[] = [
  {
    id: 1,
    name: "Éxito",
    logoUrl: "https://www.america-retail.com/static//2022/11/exito.png",
    offers: [
      {
        id: 101,
        type: OfferType.DISCOUNT,
        title: "25% en Frutas y Verduras",
        description: "Obtén un 25% de descuento en toda la sección de frutas y verduras frescas.",
        pointsRequired: 1800,
      },
      {
        id: 102,
        type: OfferType.BONUS,
        title: "Bono de $20.000 COP",
        description: "Recibe un bono de $20.000 para tu próxima compra superior a $100.000.",
        pointsRequired: 3500,
      },
      {
        id: 103,
        type: OfferType.FREEBIE,
        title: "Bolsa Reutilizable Gratis",
        description: "Llévate una bolsa reutilizable exclusiva de Éxito en tu compra.",
        pointsRequired: 500,
      },
    ],
  },
  {
    id: 2,
    name: "Juan Valdez Café",
    logoUrl: "https://pbs.twimg.com/profile_images/1600175949591429120/Pz56n-1K_400x400.jpg",
    offers: [
      {
        id: 201,
        type: OfferType.FREEBIE,
        title: "Tinto o Americano Gratis",
        description: "Disfruta de un tinto o café americano mediano por cuenta de la casa.",
        pointsRequired: 400,
      },
      {
        id: 202,
        type: OfferType.DISCOUNT,
        title: "50% en Nevados",
        description: "Obtén un 50% de descuento en cualquier Nevado de café mediano.",
        pointsRequired: 300,
      },
      {
        id: 203,
        type: OfferType.BONUS,
        title: "Doble Puntos en Café en Grano",
        description: "Gana el doble de puntos por la compra de cualquier bolsa de café en grano.",
        pointsRequired: 150,
      },
    ],
  },
  {
    id: 3,
    name: "Alkosto",
    logoUrl: "https://colombia.payu.com/wp-content/uploads/sites/6/2020/06/alkosto-1.png",
    offers: [
      {
        id: 301,
        type: OfferType.DISCOUNT,
        title: "$100.000 dcto. en Celulares",
        description: "Obtén $100.000 de descuento en celulares seleccionados de gama alta.",
        pointsRequired: 5000,
      },
      {
        id: 302,
        type: OfferType.FREEBIE,
        title: "Envío Gratis a nivel nacional",
        description: "Recibe tu pedido en cualquier parte de Colombia sin costo de envío.",
        pointsRequired: 800,
      },
      {
        id: 303,
        type: OfferType.BONUS,
        title: "Mouse inalámbrico de regalo",
        description: "Llévate un mouse inalámbrico por la compra de cualquier computador portátil.",
        pointsRequired: 4500,
      },
    ],
  },
];
