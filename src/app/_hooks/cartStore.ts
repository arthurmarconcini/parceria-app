import { Product } from "@prisma/client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Extra = {
  name: string;
  extraId: string;
  quantity: number;
  priceAtTime: number;
};

type HalfHalf = {
  firstHalf?: Product;
  secondHalf?: Product;
};

export type CartItem = {
  name: string;
  productId: string;
  cartItemId: string;
  quantity: number;
  sizeId?: string;
  halfhalf?: HalfHalf;
  imageUrl: string;
  observation?: string;
  priceAtTime: number;
  orderExtras: Extra[];
};

type CartState = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "cartItemId">) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  toggleCart: () => void;
  decreaseQuantity: (cartItemId: string) => void;
  increaseQuantity: (cartItemId: string) => void;
  removeFromCart: (cartItemId: string) => void;
  getTotalPrice: () => number;
};

const generateUniqueId = () =>
  `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// Função auxiliar para comparar dois arrays de extras
const areExtrasEqual = (extras1: Extra[], extras2: Extra[]): boolean => {
  if (extras1.length !== extras2.length) return false;
  return extras1.every((extra1) =>
    extras2.some(
      (extra2) =>
        extra1.extraId === extra2.extraId &&
        extra1.quantity === extra2.quantity &&
        extra1.priceAtTime === extra2.priceAtTime
    )
  );
};

// Função auxiliar para comparar HalfHalf
const areHalfHalfEqual = (h1?: HalfHalf, h2?: HalfHalf): boolean => {
  if (!h1 && !h2) return true;
  if (!h1 || !h2) return false;
  return (
    h1.firstHalf?.id === h2.firstHalf?.id &&
    h1.secondHalf?.id === h2.secondHalf?.id
  );
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      addToCart: (item: Omit<CartItem, "cartItemId">) =>
        set((state) => {
          const existingItem = state.cart.find((cartItem) => {
            const sameProduct = cartItem.productId === item.productId;
            const sameSize = cartItem.sizeId === item.sizeId; // Inclui sizeId na comparação
            const sameExtras = areExtrasEqual(
              cartItem.orderExtras,
              item.orderExtras
            );
            const sameObservation =
              (cartItem.observation || "") === (item.observation || "");
            const sameHalfHalf = areHalfHalfEqual(
              cartItem.halfhalf,
              item.halfhalf
            );
            return (
              sameProduct &&
              sameSize &&
              sameExtras &&
              sameObservation &&
              sameHalfHalf
            );
          });

          if (existingItem) {
            console.log("Item idêntico encontrado, incrementando quantidade");
            return {
              cart: state.cart.map((cartItem) =>
                cartItem.cartItemId === existingItem.cartItemId
                  ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                  : cartItem
              ),
              isCartOpen: true,
            };
          }

          console.log("Item diferente, adicionando como novo");
          const newItem = { ...item, cartItemId: generateUniqueId() };
          return {
            cart: [...state.cart, newItem],
            isCartOpen: true,
          };
        }),
      clearCart: () => set({ cart: [], isCartOpen: false }),
      isCartOpen: false,
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      decreaseQuantity: (cartItemId: string) =>
        set((state) => ({
          cart: state.cart.map((cartItem) =>
            cartItem.cartItemId === cartItemId && cartItem.quantity > 1
              ? { ...cartItem, quantity: cartItem.quantity - 1 }
              : cartItem
          ),
        })),
      increaseQuantity: (cartItemId: string) =>
        set((state) => ({
          cart: state.cart.map((cartItem) =>
            cartItem.cartItemId === cartItemId && cartItem.quantity < 10
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          ),
        })),
      removeFromCart: (cartItemId: string) =>
        set((state) => ({
          cart: state.cart.filter(
            (cartItem) => cartItem.cartItemId !== cartItemId
          ),
        })),
      getTotalPrice: () => {
        const state = get();
        return state.cart.reduce((total, item) => {
          const extrasTotal = item.orderExtras.reduce((total, extra) => {
            return total + extra.priceAtTime * extra.quantity;
          }, 0);
          return total + (item.priceAtTime + extrasTotal) * item.quantity;
        }, 0);
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
