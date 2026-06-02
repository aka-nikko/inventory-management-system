
import { useEffect, useState } from "react";
import api from "../api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const [o,c] = await Promise.all([
      api.get("/orders/"),
      api.get("/customers/")
    ]);

    setOrders(o.data);
    setCustomers(c.data);
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
