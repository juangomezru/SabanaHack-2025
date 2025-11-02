
import React from 'react';
import type { Product } from '../types';
import { AVAILABLE_PRODUCTS } from '../constants';

interface ProductListProps {
  onAddProduct: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ onAddProduct }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
       <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Productos Disponibles</h2>
       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {AVAILABLE_PRODUCTS.map((product) => (
          <button
            key={product.id}
            onClick={() => onAddProduct(product)}
            className="flex flex-col items-center justify-center text-center p-3 bg-slate-800 text-white rounded-lg shadow-sm hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span className="font-semibold text-sm">{product.name}</span>
            <span className="text-xs text-slate-300">{formatCurrency(product.price)}</span>
          </button>
        ))}
       </div>
    </div>
  );
};

export default ProductList;
