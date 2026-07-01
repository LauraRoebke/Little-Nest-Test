export type Tab = 'home' | 'shop' | 'sale' | 'inspiration';
export type Category = 'all' | 'deko' | 'textilien' | 'moebel';

export interface Product {
  id: number;
  name: string;
  category: 'deko' | 'textilien' | 'moebel';
  price: number;
  priceOld?: number;
  badge?: string;
  img: string;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
