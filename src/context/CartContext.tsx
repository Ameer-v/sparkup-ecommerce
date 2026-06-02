"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";

import { useAuth } from "./AuthContext";

type Product = {
  id: string;
  productId?: string;
  title: string;
  price: string;
  image: string;
  quantity?: number;
};

type CartContextType = {
  cart: Product[];

  addToCart: (
    product: Product
  ) => Promise<void>;

  removeFromCart: (
    id: string
  ) => Promise<void>;

  clearCart: () => Promise<void>;

  syncCart: () => Promise<void>;
};

const CART_STORAGE_KEY =
  "sparkup-cart";

const emptyCart: Product[] = [];
const cartListeners =
  new Set<() => void>();

let cachedCartValue: string | null =
  null;
let cachedCartSnapshot: Product[] =
  emptyCart;

function parseCart(
  value: string | null
) {
  if (!value) {
    return emptyCart;
  }

  try {
    return JSON.parse(value) as Product[];
  } catch {
    return emptyCart;
  }
}

function getCartSnapshot() {
  const value =
    window.localStorage.getItem(
      CART_STORAGE_KEY
    );

  if (value === cachedCartValue) {
    return cachedCartSnapshot;
  }

  cachedCartValue = value;
  cachedCartSnapshot = parseCart(value);

  return cachedCartSnapshot;
}

function getServerCartSnapshot() {
  return emptyCart;
}

function emitCartChange() {
  cartListeners.forEach((listener) =>
    listener()
  );
}

function subscribeCart(
  listener: () => void
) {
  cartListeners.add(listener);
  window.addEventListener(
    "storage",
    listener
  );

  return () => {
    cartListeners.delete(listener);
    window.removeEventListener(
      "storage",
      listener
    );
  };
}

function writeCartSnapshot(
  cart: Product[]
) {
  const value = JSON.stringify(cart);

  cachedCartValue = value;
  cachedCartSnapshot = cart;

  window.localStorage.setItem(
    CART_STORAGE_KEY,
    value
  );

  emitCartChange();
}

function asRecord(value: unknown) {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return null;
  }

  return value as Record<
    string,
    unknown
  >;
}

function getStringValue(
  value: unknown,
  fallback = ""
) {
  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value);
  }

  return fallback;
}

function normalizeCartItem(
  item: unknown
): Product | null {
  const itemRecord = asRecord(item);

  if (!itemRecord) {
    return null;
  }

  const productRecord =
    asRecord(itemRecord.product) ??
    itemRecord;

  const productId = getStringValue(
    productRecord.id ??
      itemRecord.productId ??
      itemRecord.product_id
  );

  const cartItemId =
    getStringValue(itemRecord.id) ||
    productId;

  if (!cartItemId) {
    return null;
  }

  const quantity =
    Number(
      itemRecord.quantity ??
        itemRecord.qty ??
        1
    ) || 1;

  return {
    id: cartItemId,
    productId,
    title: getStringValue(
      productRecord.name ??
        productRecord.title,
      "Product"
    ),
    price: getStringValue(
      productRecord.price ??
        itemRecord.price,
      "0"
    ),
    image: getStringValue(
      productRecord.imageUrl ??
        productRecord.image ??
        itemRecord.imageUrl ??
        itemRecord.image
    ),
    quantity,
  } satisfies Product;
}

function normalizeCartResponse(
  data: unknown
) {
  const record = asRecord(data);
  const items =
    Array.isArray(data)
      ? data
      : Array.isArray(record?.items)
        ? record.items
        : Array.isArray(record?.cart)
          ? record.cart
          : Array.isArray(
                record?.cartItems
              )
            ? record.cartItems
            : [];

  return items
    .map(normalizeCartItem)
    .filter(
      (item): item is Product =>
        Boolean(item)
    );
}

async function readResponseJson(
  response: Response
) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function syncBackendCart(
  token: string
) {
  const response = await fetch(
    "/api/cart",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    return;
  }

  writeCartSnapshot(
    normalizeCartResponse(
      await readResponseJson(response)
    )
  );
}

const CartContext =
  createContext<CartContextType | null>(
    null
  );

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const { token } = useAuth();

  const cart = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getServerCartSnapshot
  );

  async function syncCart() {
    if (!token) {
      return;
    }

    await syncBackendCart(token);
  }

  useEffect(() => {
    if (token) {
      syncBackendCart(token);
    }
  }, [token]);

  /* ADD */
  async function addToCart(
    product: Product
  ) {

    if (token) {
      const response = await fetch(
        "/api/cart",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            productId:
              product.productId ??
              product.id,
            quantity: product.quantity ?? 1,
          }),
        }
      );

      if (response.ok) {
        await syncCart();
        return;
      }
    }

    const existingItem = cart.find(
      (item) =>
        (item.productId ?? item.id) ===
        (product.productId ??
          product.id)
    );

    if (existingItem) {
      writeCartSnapshot(
        cart.map((item) =>
          item.id === existingItem.id
            ? {
                ...item,
                quantity:
                  (item.quantity ?? 1) + 1,
              }
            : item
        )
      );

      return;
    }

    writeCartSnapshot([
      ...cart,
      {
        ...product,
        quantity:
          product.quantity ?? 1,
      },
    ]);
  }

  /* REMOVE */
  async function removeFromCart(
    id: string
  ) {

    if (token) {
      const response = await fetch(
        `/api/cart/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await syncCart();
        return;
      }
    }

    writeCartSnapshot(
      cart.filter(
        (item) => item.id !== id
      )
    );
  }

  /* CLEAR */
  async function clearCart() {
    if (token) {
      await Promise.all(
        cart.map((item) =>
          fetch(`/api/cart/${item.id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );
    }

    writeCartSnapshot([]);
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        syncCart,
      }}
    >

      {children}

    </CartContext.Provider>
  );
}

export function useCart() {

  const context =
    useContext(CartContext);

  if (!context) {

    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}
