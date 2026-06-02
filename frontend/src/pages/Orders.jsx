
import React from "react";
import { useEffect, useState } from "react";
import api from "../api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);
  const [customerId, setCustomerId] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setError(null);
    try {
    const [o,c] = await Promise.all([
      api.get("/orders/"),
      api.get("/customers/")
    ]);
    setOrders(Array.isArray(o.data) ? o.data : []);
    setCustomers(Array.isArray(c.data) ? c.data : []);
    } catch (e) {
      console.error("Orders load error:", e);
      setError(String(e));
    }
  };

  const create = async () => {
    if(!customerId) return;

    await api.post("/orders/", {
      customer_id: customerId,
      items: []
    });

    load();
  };

  return (
    <div className="container">
      {error && (
        <div className="card" style={{border: '1px solid red'}}>
          <strong>Error loading orders:</strong>
          <pre style={{whiteSpace:'pre-wrap'}}>{error}</pre>
        </div>
      )}
      <h1>Orders</h1>

      <div className="card">
        <select onChange={e=>setCustomerId(e.target.value)}>
          <option>Select Customer</option>

          {customers.map(customer=>(
            <option value={customer.id} key={customer.id}>
              {customer.full_name}
            </option>
          ))}
        </select>

        <button onClick={create}>
          Create Order
        </button>
      </div>

      <div className="grid">
        {orders.map(order=>(
          <div className="card" key={order.id}>
            <h3>Order</h3>
            <p>Total: ₹{order.total_amount}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
