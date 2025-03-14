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
  clearCart: () => void;
  isCartOpen: boolean;
  toggleCart: () => void;
  decreaseQuantity: (item: CartItem) => void;
  increaseQuantity: (item: CartItem) => void;
  removeFromCart: (item: CartItem) => void;
  getTotalPrice: () => number;
};

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

// Função auxiliar para comparar dois itens do carrinho
const areItemsEqual = (item1: CartItem, item2: CartItem): boolean => {
  return (
    item1.productId === item2.productId &&
    areExtrasEqual(item1.orderExtras, item2.orderExtras) &&
    (item1.observation || "") === (item2.observation || "")
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
              isCartOpen: true,
            };
          }

          console.log("Item diferente, adicionando como novo");
          return {
            cart: [...state.cart, item],
            isCartOpen: true,
          };
        }),
      clearCart: () => set({ cart: [], isCartOpen: false }),
      isCartOpen: false,
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      decreaseQuantity: (item: CartItem) =>
        set((state) => ({
          cart: state.cart.map((cartItem) =>
            areItemsEqual(cartItem, item) && cartItem.quantity > 1
              ? { ...cartItem, quantity: cartItem.quantity - 1 }
              : cartItem
          ),
        })),
      increaseQuantity: (item: CartItem) =>
        set((state) => ({
          cart: state.cart.map((cartItem) =>
            areItemsEqual(cartItem, item) && cartItem.quantity < 10
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          ),
        })),
      removeFromCart: (item: CartItem) => {
        set((state) => ({
          cart: state.cart.filter((cartItem) => !areItemsEqual(item, cartItem)),
        }));
      },
      getTotalPrice: () => {
        const state = get();

        return state.cart.reduce((total, item) => {
          // Calcula o preço total dos extras
          const extrasTotal = item.orderExtras.reduce((total, extra) => {
            return total + extra.priceAtTime * extra.quantity;
          }, 0);

          // Calcula o preço total do item com base na quantidade e no preço unitário
          return total + (item.priceAtTime + extrasTotal) * item.quantity;
        }, 0);
      },
    }),

    {
      name: "cart-storage",
    }
  )
);
