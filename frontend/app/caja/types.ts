
export interface Product {
  id: number;
  name: string;
  price: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Customer {
  fullName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  address: string;
  city: string;
  department: string;
  postalCode: string;
  phone: string;
}
