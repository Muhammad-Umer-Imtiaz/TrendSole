"use client";

import { create } from "zustand";
import { apiErrorMessage, productApi } from "@/lib/api";
import type { Product } from "@/lib/types";

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  clearError: () => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const products = await productApi.list();

      set({
        products,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: apiErrorMessage(error),
      });
    }
  },

  clearError: () => {
    set({
      error: null,
    });
  },
}));
