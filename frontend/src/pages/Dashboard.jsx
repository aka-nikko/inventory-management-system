
import React from "react";
import { useEffect, useState } from "react";
import api from "../api";

export default function Dashboard() {
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    products:0,
    customers:0,
    orders:0,
    lowStock:0
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setError(null);
    try {
    const [p,c,o] = await Promise.all([
      api.get("/products/"),
      api.get("/customers/"),
      api.get("/orders/")
    ]);

    const products = Array.isArray(p.data) ? p.data : [];
    const customers = Array.isArray(c.data) ? c.data : [];
    const orders = Array.isArray(o.data) ? o.data : [];

    setStats({
      products: products.length,
      customers: customers.length,
      orders: orders.length,
      lowStock: products.filter(x=>x.quantity < 5).length
    });
    } catch (e) {
      console.error("Dashboard load error:", e);
      setError(String(e));
    }
  };

  return (
    <div className="container">
      {error && (
        <div className="card" style={{border: '1px solid red'}}>
          <strong>Error loading dashboard:</strong>
          <pre style={{whiteSpace:'pre-wrap'}}>{error}</pre>
        </div>
      )}
      <h1>Dashboard</h1>

      <div className="grid">
        <div className="card">
          <h3>Products</h3>
          <h1>{stats.products}</h1>
        </div>

        <div className="card">
          <h3>Customers</h3>
          <h1>{stats.customers}</h1>
        </div>

        <div className="card">
          <h3>Orders</h3>
          <h1>{stats.orders}</h1>
        </div>

        <div className="card">
          <h3>Low Stock</h3>
          <h1>{stats.lowStock}</h1>
        </div>
      </div>
    </div>
  );
}
