
import type { Product, Customer } from './types';

export const AVAILABLE_PRODUCTS: Product[] = [
  { id: 1, name: 'Pan de bono', price: 2000 },
  { id: 2, name: 'Croissant', price: 3500 },
  { id: 3, name: 'Galleta de avena', price: 2500 },
  { id: 4, name: 'Café americano', price: 3000 },
  { id: 5, name: 'Chocolate caliente', price: 3500 },
  { id: 6, name: 'Jugo de Naranja', price: 4000 },
];

export const MOCK_CUSTOMER_DATA: Customer = {
  fullName: 'Brayan Yesid Baez Mendoza',
  documentType: 'C.C',
  documentNumber: '1001119202',
  email: 'brabaez94@gmail.com',
  address: 'Calle Falsa 123',
  city: 'Bogotá D.C.',
  department: 'Cundinamarca',
  postalCode: '110111',
  phone: '3001234567',
};
