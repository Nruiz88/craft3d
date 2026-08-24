import { describe, it, expect, beforeEach } from "vitest";
import "./mocks";
import { resetMockStore } from "./mocks";

// Import after mocks are set up
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  migrateGuestAddresses,
} from "@/app/cuenta/actions/addresses";

describe("Addresses server actions", () => {
  beforeEach(() => {
    resetMockStore();
  });

  describe("getAddresses", () => {
    it("returns empty array for no addresses", async () => {
      const result = await getAddresses();
      expect(result).toEqual([]);
    });

    it("returns addresses after creation", async () => {
      await createAddress({
        label: "Casa",
        name: "Juan Pérez",
        phone: "299 123 4567",
        address: "Av. San Martín 1234",
        city: "Neuquén",
        province: "Neuquén",
        postalCode: "8300",
      });

      const result = await getAddresses();
      expect(result).toHaveLength(1);
      expect(result[0].label).toBe("Casa");
      expect(result[0].name).toBe("Juan Pérez");
      expect(result[0].isDefault).toBe(true); // First address is default
    });
  });

  describe("createAddress", () => {
    it("creates an address successfully", async () => {
      const result = await createAddress({
        label: "Trabajo",
        name: "María García",
        phone: "299 987 6543",
        address: "Belgrano 567",
        city: "Neuquén",
        province: "Neuquén",
        postalCode: "8300",
      });

      expect(result.ok).toBe(true);
      expect(result.address).toBeDefined();
      expect(result.address!.label).toBe("Trabajo");
    });

    it("makes first address the default", async () => {
      await createAddress({
        label: "Primera",
        name: "Test",
        phone: "123",
        address: "Calle 1",
        city: "NQN",
        province: "NQN",
        postalCode: "8300",
      });

      const addresses = await getAddresses();
      expect(addresses[0].isDefault).toBe(true);
    });

    it("makes second address non-default", async () => {
      await createAddress({
        label: "Primera",
        name: "Test",
        phone: "123",
        address: "Calle 1",
        city: "NQN",
        province: "NQN",
        postalCode: "8300",
      });

      await createAddress({
        label: "Segunda",
        name: "Test 2",
        phone: "456",
        address: "Calle 2",
        city: "NQN",
        province: "NQN",
        postalCode: "8300",
      });

      const addresses = await getAddresses();
      expect(addresses).toHaveLength(2);
      const defaults = addresses.filter((a) => a.isDefault);
      expect(defaults).toHaveLength(1);
    });
  });

  describe("updateAddress", () => {
    it("updates an existing address", async () => {
      const created = await createAddress({
        label: "Vieja",
        name: "Test",
        phone: "123",
        address: "Calle Vieja",
        city: "NQN",
        province: "NQN",
        postalCode: "8300",
      });

      const result = await updateAddress(created.address!.id, {
        label: "Nueva",
        name: "Test",
        phone: "123",
        address: "Calle Nueva",
        city: "NQN",
        province: "NQN",
        postalCode: "8300",
      });

      expect(result.ok).toBe(true);

      const addresses = await getAddresses();
      expect(addresses[0].label).toBe("Nueva");
      expect(addresses[0].address).toBe("Calle Nueva");
    });
  });

  describe("deleteAddress", () => {
    it("deletes an address", async () => {
      const created = await createAddress({
        label: "Para borrar",
        name: "Test",
        phone: "123",
        address: "Calle",
        city: "NQN",
        province: "NQN",
        postalCode: "8300",
      });

      const result = await deleteAddress(created.address!.id);
      expect(result.ok).toBe(true);

      const addresses = await getAddresses();
      expect(addresses).toHaveLength(0);
    });

    it("makes another address default when deleting the default", async () => {
      const first = await createAddress({
        label: "Primera",
        name: "Test",
        phone: "123",
        address: "Calle 1",
        city: "NQN",
        province: "NQN",
        postalCode: "8300",
      });

      await createAddress({
        label: "Segunda",
        name: "Test 2",
        phone: "456",
        address: "Calle 2",
        city: "NQN",
        province: "NQN",
        postalCode: "8300",
      });

      await deleteAddress(first.address!.id);

      const addresses = await getAddresses();
      expect(addresses).toHaveLength(1);
      expect(addresses[0].isDefault).toBe(true);
    });
  });

  describe("setDefaultAddress", () => {
    it("sets one address as default and unsets others", async () => {
      const first = await createAddress({
        label: "Primera",
        name: "Test",
        phone: "123",
        address: "Calle 1",
        city: "NQN",
        province: "NQN",
        postalCode: "8300",
      });

      const second = await createAddress({
        label: "Segunda",
        name: "Test 2",
        phone: "456",
        address: "Calle 2",
        city: "NQN",
        province: "NQN",
        postalCode: "8300",
      });

      await setDefaultAddress(second.address!.id);

      const addresses = await getAddresses();
      const defaults = addresses.filter((a) => a.isDefault);
      expect(defaults).toHaveLength(1);
      expect(defaults[0].label).toBe("Segunda");
    });
  });

  describe("migrateGuestAddresses", () => {
    it("migrates guest addresses to Supabase", async () => {
      const result = await migrateGuestAddresses([
        {
          label: "Casa",
          name: "Juan",
          phone: "123",
          address: "Calle 1",
          city: "NQN",
          province: "NQN",
          postalCode: "8300",
          isDefault: true,
        },
        {
          label: "Trabajo",
          name: "Juan",
          phone: "456",
          address: "Calle 2",
          city: "NQN",
          province: "NQN",
          postalCode: "8300",
        },
      ]);

      expect(result.ok).toBe(true);
      expect(result.migrated).toBe(2);

      const addresses = await getAddresses();
      expect(addresses).toHaveLength(2);
    });

    it("does not migrate if user already has addresses", async () => {
      await createAddress({
        label: "Existente",
        name: "Test",
        phone: "123",
        address: "Calle",
        city: "NQN",
        province: "NQN",
        postalCode: "8300",
      });

      const result = await migrateGuestAddresses([
        {
          label: "Nueva",
          name: "Test",
          phone: "456",
          address: "Otra",
          city: "NQN",
          province: "NQN",
          postalCode: "8300",
        },
      ]);

      expect(result.migrated).toBe(0);

      const addresses = await getAddresses();
      expect(addresses).toHaveLength(1); // Only original
    });

    it("returns ok with 0 for empty array", async () => {
      const result = await migrateGuestAddresses([]);
      expect(result.ok).toBe(true);
      expect(result.migrated).toBe(0);
    });
  });
});
