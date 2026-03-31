"use client";

import { useCallback } from "react";
import type { CartItem } from "@/types";
import { STORAGE_KEYS } from "@/config/storage-keys";

export function useCart() {
  const getCart = useCallback((): CartItem[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || "[]");
    } catch {
      return [];
    }
  }, []);

  const addToCart = useCallback((item: Omit<CartItem, "id">) => {
    const cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || "[]") as CartItem[];
    const existing = cart.find((c) => c.goodsId === item.goodsId && c.variant === item.variant);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      cart.push({ ...item, id: `cart-${Date.now()}` });
    }
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, []);

  const updateCartQuantity = useCallback((id: string, quantity: number) => {
    const cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || "[]") as CartItem[];
    const item = cart.find((c) => c.id === id);
    if (item) { item.quantity = Math.max(1, quantity); }
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, []);

  const removeFromCart = useCallback((id: string) => {
    const cart = (JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || "[]") as CartItem[])
      .filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, []);

  const clearCart = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.CART);
  }, []);

  const cartCount = useCallback(() => {
    const cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || "[]") as CartItem[];
    return cart.reduce((sum, c) => sum + c.quantity, 0);
  }, []);

  return { getCart, addToCart, updateCartQuantity, removeFromCart, clearCart, cartCount };
}
