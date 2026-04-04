export interface ShippingDetails {
  city: string;
  cityRef: string;
  warehouseRef: string;
  warehouseDescription: string;
}

export interface CheckoutItem {
  productId: string;
  sku: string;
  quantity: number;
}

export type PaymentMethod = "COD" | "ONLINE";

export interface CheckoutPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  items: CheckoutItem[];
  shippingDetails: ShippingDetails;
  comment?: string;
  paymentMethod: PaymentMethod;
}

export interface OrderItem {
  productId: string;
  productTitle: string;
  sku: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
}

export interface NovaCity {
  ref: string;
  name: string;
  region: string;
}

export interface NovaWarehouse {
  ref: string;
  description: string;
  number: string;
  shortAddress: string;
  type: "warehouse" | "postbox";
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
  comment: string | null;
  createdAt: string;
  updatedAt: string | null;
}
