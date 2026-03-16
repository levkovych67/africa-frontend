import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  productTitle: string;
  sku: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
  image: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.sku === item.sku);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.sku === item.sku
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (sku) =>
        set((state) => ({
          items: state.items.filter((i) => i.sku !== sku),
        })),

      updateQuantity: (sku, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.sku !== sku)
              : state.items.map((i) => (i.sku === sku ? { ...i, quantity } : i)),
        })),

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    }),
    {
      name: "africa-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
