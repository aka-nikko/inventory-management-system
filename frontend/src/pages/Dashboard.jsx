
import { useEffect, useState } from "react";
import api from "../api";

export default function Dashboard() {
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
    const [p,c,o] = await Promise.all([
      api.get("/products/"),
      api.get("/customers/"),
      api.get("/orders/")
    ]);

    setStats({
      products: p.data.length,
      customers: c.data.length,
      orders: o.data.length,
      lowStock: p.data.filter(x=>x.quantity < 5).length
    });
  };

  return (
    <div className="container">
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
