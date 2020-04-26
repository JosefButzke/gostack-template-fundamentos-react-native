import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storageProducts = await AsyncStorage.getItem('products');
      storageProducts && setProducts(JSON.parse(storageProducts));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      setProducts([...products, { ...product, quantity: 1 }]);

      await AsyncStorage.setItem(
        'products',
        JSON.stringify([...products, { ...product, quantity: 1 }]),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProds = products.map(p => {
        if (p.id === id) {
          return { ...p, quantity: p.quantity + 1 };
        }
        return p;
      });
      setProducts(newProds);
      await AsyncStorage.setItem('products', JSON.stringify(newProds));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newProds = products.map(p => {
        if (p.id === id) {
          return { ...p, quantity: p.quantity === 1 ? 1 : p.quantity - 1 };
        }
        return p;
      });
      setProducts(newProds);
      await AsyncStorage.setItem('products', JSON.stringify(newProds));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
