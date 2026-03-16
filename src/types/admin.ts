// Auth
export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Order status
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

// Admin order (extended from storefront OrderResponse)
export interface AdminOrder {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  items: AdminOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingDetails: {
    city: string;
    cityRef: string;
    warehouseRef: string;
    warehouseDescription: string;
    country: string;
    carrier: string;
    trackingNumber: string | null;
  };
  comment: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface AdminOrderItem {
  productId: string;
  productTitle: string;
  sku: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
}

// Dashboard
export interface TopProduct {
  productId: string;
  title: string;
  unitsSold: number;
  revenue: number;
}

export interface RevenueByDay {
  date: string;
  revenue: number;
  orders: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUnitsSold: number;
  topProducts: TopProduct[];
  revenueByDay: RevenueByDay[];
}

// Image upload
export interface PresignResponse {
  uploadUrl: string;
  publicUrl: string;
}
