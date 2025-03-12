import { create } from "zustand";
import { persist } from "zustand/middleware";

type Extra = {
  name: string;
  extraId: string;
  quantity: number;
  priceAtTime: number;
};

export type CartItem = {
  name: string;
  productId: string;
  quantity: number;
  imageUrl: string;
  observation?: string;
  priceAtTime: number;
  orderExtras: Extra[];
};

type CartState = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
}; // Função auxiliar para comparar dois arrays de extras
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

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (item: CartItem) =>
        set((state) => {
          const existingItem = state.cart.find((cartItem) => {
            // Verifica se o productId é o mesmo
            const sameProduct = cartItem.productId === item.productId;
            if (!sameProduct) return false;

            // Verifica se os extras são iguais
            const sameExtras = areExtrasEqual(
              cartItem.orderExtras,
              item.orderExtras
            );

            // Verifica se as observações são iguais (considerando undefined como "")
            const sameObservation =
              (cartItem.observation || "") === (item.observation || "");

            // Retorna true apenas se produto, extras e observações forem iguais
            return sameProduct && sameExtras && sameObservation;
          });

          if (existingItem) {
            console.log("Item idêntico encontrado, incrementando quantidade");
            return {
              cart: state.cart.map((cartItem) =>
                cartItem.productId === item.productId &&
                areExtrasEqual(cartItem.orderExtras, item.orderExtras) &&
                (cartItem.observation || "") === (item.observation || "")
                  ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                  : cartItem
              ),
            };
          }

          console.log("Item diferente, adicionando como novo");
          return {
            cart: [...state.cart, item],
          };
        }),
    }),
    {
      name: "cart-storage",
    }
  )
);
