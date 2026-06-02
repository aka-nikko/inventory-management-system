import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState({ products: false, customers: false });
  const [error, setError] = useState(null);

  const loadProducts = async () => {
    setLoading(prev => ({...prev, products: true}));
    try {
      const res = await api.get("/products/");
      const list = Array.isArray(res.data) ? res.data : [];
      setProducts(list);
      return list;
    } catch (e) {
      console.error("loadProducts error", e);
      setError(e);
      return [];
    } finally {
      setLoading(prev => ({...prev, products: false}));
    }
  };

  const loadCustomers = async () => {
    setLoading(prev => ({...prev, customers: true}));
    try {
      const res = await api.get("/customers/");
      const list = Array.isArray(res.data) ? res.data : [];
      setCustomers(list);
      return list;
    } catch (e) {
      console.error("loadCustomers error", e);
      setError(e);
      return [];
    } finally {
      setLoading(prev => ({...prev, customers: false}));
    }
  };

  useEffect(() => {
    // initial load
    loadProducts();
    loadCustomers();
  }, []);

  const value = {
    products,
    customers,
    loading,
    error,
    loadProducts,
    loadCustomers,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}
