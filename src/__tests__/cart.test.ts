import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "@/store/cart";

const mockItem = {
  productId: "prod-1",
  productTitle: "Africa Tour T-Shirt",
  sku: "TSHIRT-BLK-S",
  variantLabel: "Size: S, Color: Black",
  unitPrice: 29.99,
  quantity: 1,
  image: "/img/tshirt.jpg",
};

const mockItem2 = {
  productId: "prod-2",
  productTitle: "Logo Hoodie",
  sku: "HOODIE-WHT-M",
  variantLabel: "Size: M, Color: White",
  unitPrice: 49.99,
  quantity: 2,
  image: "/img/hoodie.jpg",
};

describe("Cart Store", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: false });
  });

  describe("addItem", () => {
    it("adds a new item to empty cart", () => {
      useCartStore.getState().addItem(mockItem);
      expect(useCartStore.getState().items).toHaveLength(1);
      expect(useCartStore.getState().items[0].sku).toBe("TSHIRT-BLK-S");
    });

    it("increments quantity for existing SKU", () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().addItem({ ...mockItem, quantity: 3 });
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(4);
    });

    it("adds different SKUs as separate items", () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().addItem(mockItem2);
      expect(useCartStore.getState().items).toHaveLength(2);
    });
  });

  describe("removeItem", () => {
    it("removes item by SKU", () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().addItem(mockItem2);
      useCartStore.getState().removeItem("TSHIRT-BLK-S");
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].sku).toBe("HOODIE-WHT-M");
    });

    it("does nothing for non-existent SKU", () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().removeItem("DOES-NOT-EXIST");
      expect(useCartStore.getState().items).toHaveLength(1);
    });
  });

  describe("updateQuantity", () => {
    it("updates quantity for existing item", () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().updateQuantity("TSHIRT-BLK-S", 5);
      expect(useCartStore.getState().items[0].quantity).toBe(5);
    });

    it("removes item when quantity is 0", () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().updateQuantity("TSHIRT-BLK-S", 0);
      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it("removes item when quantity is negative", () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().updateQuantity("TSHIRT-BLK-S", -1);
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe("clearCart", () => {
    it("removes all items", () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().addItem(mockItem2);
      useCartStore.getState().clearCart();
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe("totals", () => {
    it("calculates totalItems correctly", () => {
      useCartStore.getState().addItem(mockItem); // qty 1
      useCartStore.getState().addItem(mockItem2); // qty 2
      expect(useCartStore.getState().totalItems()).toBe(3);
    });

    it("calculates totalPrice correctly", () => {
      useCartStore.getState().addItem(mockItem); // 29.99 * 1
      useCartStore.getState().addItem(mockItem2); // 49.99 * 2
      const expected = 29.99 * 1 + 49.99 * 2;
      expect(useCartStore.getState().totalPrice()).toBeCloseTo(expected);
    });

    it("returns 0 for empty cart", () => {
      expect(useCartStore.getState().totalItems()).toBe(0);
      expect(useCartStore.getState().totalPrice()).toBe(0);
    });
  });

  describe("cart drawer state", () => {
    it("opens and closes", () => {
      expect(useCartStore.getState().isOpen).toBe(false);
      useCartStore.getState().openCart();
      expect(useCartStore.getState().isOpen).toBe(true);
      useCartStore.getState().closeCart();
      expect(useCartStore.getState().isOpen).toBe(false);
    });
  });
});
