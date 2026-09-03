export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  category?: Category;
  price: number;
  weightKg: number;
  grade: string;
  estimatedPieces: string;
  avgCostPerPiece?: number | null;
  estimatedResale?: number | null;
  stockCount: number;
  isPreOrder: boolean;
  description: string;
  images: string; // JSON array string
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  mobileNumber: string;
  role: 'USER' | 'STAFF' | 'ADMIN' | 'SUPER_ADMIN';
  isSuspended: boolean;
  totpEnabled?: boolean;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user: User;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CLOSED' | 'CANCELLED';
  shippingMethod: 'DELIVERY' | 'PICKUP_BRADFORD';
  totalAmount: number;
  shippingCost: number;
  shippingCountry: string;
  shippingAddress: string;
  paymentMethod: string;
  stripePaymentId?: string | null;
  carrierName?: string | null;
  trackingNumber?: string | null;
  createdByName?: string | null;
  notes?: string | null;
  createdAt: string;
  items: OrderItem[];
}
