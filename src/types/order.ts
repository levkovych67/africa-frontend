export interface ShippingDetails {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CheckoutItem {
  productId: string;
  sku: string;
  quantity: number;
}

export interface CheckoutPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  items: CheckoutItem[];
  shippingDetails: ShippingDetails;
}

export interface OrderItem {
  productId: string;
  productTitle: string;
  sku: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  shippingDetails: ShippingDetails & {
    trackingNumber: string | null;
    carrier: string | null;
  };
  createdAt: string;
  updatedAt: string | null;
}
