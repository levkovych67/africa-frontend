import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  productId: string;
  productTitle: string;
  sku: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
  image: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  syncStock: (sku: string, newStock: number) => void;
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
            const newQty = Math.min(existing.quantity + item.quantity, item.maxStock);
            if (newQty <= 0) return state;
            return {
              items: state.items.map((i) =>
                i.sku === item.sku
                  ? { ...i, quantity: newQty, maxStock: item.maxStock }
                  : i
              ),
            };
          }
          const cappedQty = Math.min(item.quantity, item.maxStock);
          if (cappedQty <= 0) return state;
          return { items: [...state.items, { ...item, quantity: cappedQty }] };
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
              : state.items.map((i) =>
                  i.sku === sku
                    ? { ...i, quantity: i.maxStock ? Math.min(quantity, i.maxStock) : quantity }
                    : i
                ),
        })),

      syncStock: (sku, newStock) =>
        set((state) => ({
          items: newStock <= 0
            ? state.items.filter((i) => i.sku !== sku)
            : state.items.map((i) =>
                i.sku === sku
                  ? { ...i, maxStock: newStock, quantity: Math.min(i.quantity, newStock) }
                  : i
              ),
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
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      partialize: (state) => ({ items: state.items }),
      merge: (persisted, current) => {
        const persistedState = persisted as { items?: CartItem[] };
        return {
          ...current,
          items: (persistedState?.items ?? []).map((item) => ({
            ...item,
            maxStock: item.maxStock ?? item.quantity,
          })),
        };
      },
    }
  )
);
