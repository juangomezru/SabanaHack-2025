
import React from 'react';
import type { CartItem } from '../types';
import { PlusIcon, MinusIcon, TrashIcon, ShoppingCartIcon } from './icons';

interface ShoppingCartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
  onRemoveItem: (productId: number) => void;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({ items, onUpdateQuantity, onRemoveItem }) => {

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
        <ShoppingCartIcon />
        Carrito
      </h2>
      <div className="space-y-4">
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay productos agregados.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {items.map((item) => (
              <li key={item.id} className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="p-1 rounded-full text-gray-600 hover:bg-gray-200 transition">
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="p-1 rounded-full text-gray-600 hover:bg-gray-200 transition">
                    <PlusIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => onRemoveItem(item.id)} className="ml-2 p-1 text-red-500 hover:text-red-700 transition">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-6 pt-4 border-t">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-800">Total:</span>
          <span className="text-xl font-bold text-red-600">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
