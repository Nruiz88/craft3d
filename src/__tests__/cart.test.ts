import { describe, it, expect, beforeEach } from "vitest";
import "./mocks";
import { resetMockStore } from "./mocks";

import {
  getCartItems,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCartItems,
  syncGuestCart,
} from "@/app/cuenta/actions/cart";

describe("Cart server actions", () => {
  beforeEach(() => {
    resetMockStore();
  });

  describe("getCartItems", () => {
    it("returns empty array for new user", async () => {
      const result = await getCartItems();
      expect(result).toEqual([]);
    });

    it("returns items after adding", async () => {
      await addCartItem("mate-copa-mundo-2026", 2);

      const items = await getCartItems();
      expect(items).toHaveLength(1);
      expect(items[0].slug).toBe("mate-copa-mundo-2026");
      expect(items[0].quantity).toBe(2);
    });
  });

  describe("addCartItem", () => {
    it("adds a new item to the cart", async () => {
      const result = await addCartItem("dummy-13-blanco");
      expect(result.ok).toBe(true);
      expect(result.items).toHaveLength(1);
      expect(result.items![0].slug).toBe("dummy-13-blanco");
      expect(result.items![0].quantity).toBe(1);
    });

    it("increments quantity for existing item", async () => {
      await addCartItem("dummy-13-blanco", 1);
      await addCartItem("dummy-13-blanco", 3);

      const items = await getCartItems();
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(4);
    });

    it("adds multiple different items", async () => {
      await addCartItem("mate-copa-mundo", 1);
      await addCartItem("dummy-13-blanco", 2);

      const items = await getCartItems();
      expect(items).toHaveLength(2);
    });
  });

  describe("updateCartItemQuantity", () => {
    it("updates quantity of an item", async () => {
      await addCartItem("dummy-13-blanco", 1);
      await updateCartItemQuantity("dummy-13-blanco", 5);

      const items = await getCartItems();
      expect(items[0].quantity).toBe(5);
    });

    it("removes item when quantity is 0", async () => {
      await addCartItem("dummy-13-blanco", 1);
      await updateCartItemQuantity("dummy-13-blanco", 0);

      const items = await getCartItems();
      expect(items).toHaveLength(0);
    });
  });

  describe("removeCartItem", () => {
    it("removes an item from the cart", async () => {
      await addCartItem("mate-copa-mundo", 1);
      await addCartItem("dummy-13-blanco", 2);

      const result = await removeCartItem("mate-copa-mundo");
      expect(result.ok).toBe(true);
      expect(result.items).toHaveLength(1);
      expect(result.items![0].slug).toBe("dummy-13-blanco");
    });
  });

  describe("clearCartItems", () => {
    it("clears all items from the cart", async () => {
      await addCartItem("mate-copa-mundo", 1);
      await addCartItem("dummy-13-blanco", 2);

      const result = await clearCartItems();
      expect(result.ok).toBe(true);

      const items = await getCartItems();
      expect(items).toHaveLength(0);
    });
  });

  describe("syncGuestCart", () => {
    it("syncs guest items to user cart", async () => {
      const result = await syncGuestCart([
        { slug: "mate-copa-mundo", quantity: 1 },
        { slug: "dummy-13-blanco", quantity: 2 },
      ]);

      expect(result.ok).toBe(true);
      expect(result.items).toHaveLength(2);
    });

    it("merges quantities when slug already exists", async () => {
      await addCartItem("mate-copa-mundo", 3);

      const result = await syncGuestCart([
        { slug: "mate-copa-mundo", quantity: 2 },
      ]);

      expect(result.ok).toBe(true);
      const items = await getCartItems();
      const mate = items.find((i) => i.slug === "mate-copa-mundo");
      expect(mate?.quantity).toBe(5); // 3 + 2
    });

    it("returns existing cart for empty guest cart", async () => {
      await addCartItem("mate-copa-mundo", 1);

      const result = await syncGuestCart([]);
      expect(result.ok).toBe(true);
      expect(result.items).toHaveLength(1);
    });
  });
});
