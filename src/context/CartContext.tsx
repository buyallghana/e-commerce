'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem } from '@/types/database';
import { getCart, addToCartAction, updateCartItemQuantityAction, removeCartItemAction } from '@/app/actions/cart';

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (variantId: string, quantity?: number) => Promise<{ success?: boolean; error?: string; unauthenticated?: boolean }>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    try {
      const items = await getCart();
      setCart(items);
    } catch (err) {
      console.error('Failed to load cart:', err);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const addToCart = async (variantId: string, quantity: number = 1) => {
    setIsLoading(true);
    try {
      const result = await addToCartAction(variantId, quantity);
      if (result.success) {
        await refreshCart();
        setIsCartOpen(true);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    // Optimistic update
    setCart((prev) =>
      prev
        .map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0)
    );
    await updateCartItemQuantityAction(cartItemId, quantity);
    await refreshCart();
  };

  const removeItem = async (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    await removeCartItemAction(cartItemId);
    await refreshCart();
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => {
    const price =
      item.variant?.price_override !== null && item.variant?.price_override !== undefined
        ? Number(item.variant.price_override)
        : Number(item.variant?.product?.base_price || 0);
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeItem,
        refreshCart,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
