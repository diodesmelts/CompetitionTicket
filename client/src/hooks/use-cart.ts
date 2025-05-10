import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";

type CartContextType = {
  cartCount: number;
  refreshCart: () => Promise<void>;
  addToCart: (competitionId: number, quantity: number) => Promise<void>;
};

const CartContext = createContext<CartContextType>({
  cartCount: 0,
  refreshCart: async () => {},
  addToCart: async () => {},
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart');
      
      if (!res.ok) {
        throw new Error("Failed to fetch cart");
      }
      
      const cartItems = await res.json();
      
      // Sum up quantities
      const totalItems = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
      setCartCount(totalItems);
      
      return cartItems;
    } catch (error) {
      console.error("Error refreshing cart:", error);
      setCartCount(0);
      return [];
    }
  }, []);

  const addToCart = useCallback(async (competitionId: number, quantity: number) => {
    await apiRequest('POST', '/api/cart', { competitionId, quantity });
    queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    await refreshCart();
  }, [refreshCart]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider
      value={{
        cartCount: cartCount,
        refreshCart: refreshCart,
        addToCart: addToCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
