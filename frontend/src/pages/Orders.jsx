
import React from "react";
import { useEffect, useState } from "react";
import api from "../api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [customerId, setCustomerId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedQty, setSelectedQty] = useState(1);
  const [items, setItems] = useState([]);
  const [orderDetails, setOrderDetails] = useState({});

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setError(null);
    try {
    const [o,c,p] = await Promise.all([
      api.get("/orders/"),
      api.get("/customers/"),
      api.get("/products/")
    ]);
    setOrders(Array.isArray(o.data) ? o.data : []);
    setCustomers(Array.isArray(c.data) ? c.data : []);
    setProducts(Array.isArray(p.data) ? p.data : []);
    } catch (e) {
      console.error("Orders load error:", e);
      setError(String(e));
    }
  };

  const create = async () => {
    if(!customerId) return;
    if(items.length === 0) return alert("Add at least one item to the order");

    setError(null);
    try {
      await api.post("/orders/", {
        customer_id: customerId,
        items: items.map(i=>({product_id: i.product_id, quantity: i.quantity}))
      });

      setItems([]);
      setSelectedProduct("");
      setSelectedQty(1);
      load();
    } catch (e) {
      console.error("Create order error:", e);
      setError(String(e));
    }
  };

  const addItem = () => {
    if(!selectedProduct) return;
    const pid = Number(selectedProduct);
    const qty = Number(selectedQty) || 1;
    const prod = products.find(p=>p.id === pid);
    if(!prod) return;

    // merge if already present
    const existing = items.find(it=>it.product_id === pid);
    if(existing) {
      setItems(items.map(it=> it.product_id === pid ? {...it, quantity: it.quantity + qty} : it));
    } else {
      setItems([...items, { product_id: pid, name: prod.name, quantity: qty, price: prod.price }]);
    }
  };

  const removeItem = (product_id) => {
    setItems(items.filter(i=>i.product_id !== product_id));
  };

  const viewDetails = async (orderId) => {
    if(orderDetails[orderId]) {
      // toggle
      setOrderDetails(prev=> { const copy = {...prev}; delete copy[orderId]; return copy; });
      return;
    }

    try {
      const res = await api.get(`/orders/${orderId}`);
      setOrderDetails(prev=> ({...prev, [orderId]: res.data}));
    } catch (e) {
      console.error("Order details error:", e);
      setError(String(e));
    }
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

      <section className="card" style={{marginBottom:20}}>
        <h2>Create Order</h2>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <div>
            <label>Customer</label>
            <select value={customerId} onChange={e=>setCustomerId(e.target.value)}>
              <option value="">Select Customer</option>
              {customers.map(customer=>(
                <option value={customer.id} key={customer.id}>{customer.full_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Product</label>
            <select value={selectedProduct} onChange={e=>setSelectedProduct(e.target.value)}>
              <option value="">Select Product</option>
              {products.map(p=> (
                <option value={p.id} key={p.id}>{p.name} - ₹{p.price} (Stock: {p.quantity})</option>
              ))}
            </select>
          </div>

          <div>
            <label>Quantity</label>
            <input type="number" value={selectedQty} min={1} onChange={e=>setSelectedQty(e.target.value)} />
          </div>

          <div style={{alignSelf:'end'}}>
            <button type="button" onClick={addItem}>Add Item</button>
          </div>
        </div>

        {items.length>0 && (
          <div style={{marginTop:10}}>
            <h4>Items</h4>
            <div className="grid">
              {items.map(it=> (
                <div className="card" key={it.product_id}>
                  <strong>{it.name}</strong>
                  <p>Qty: {it.quantity}</p>
                  <p>Price: ₹{it.price}</p>
                  <button onClick={()=>removeItem(it.product_id)} style={{background:'#900'}}>Remove</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{marginTop:10}}>
          <button onClick={create}>Create Order</button>
        </div>
      </section>

      <section>
        <h2>Orders</h2>
        <div className="grid">
          {orders.map(order=>(
            <div className="card" key={order.id}>
              <h3>Order #{order.id}</h3>
              <p>Customer: {order.customer_name || order.customer_id}</p>
              <p>Total: ₹{order.total_amount}</p>
              <div style={{display:'flex',gap:10}}>
                <button onClick={()=>viewDetails(order.id)}>View Details</button>
              </div>

              {orderDetails[order.id] && (
                <div style={{marginTop:10}}>
                  <h4>Order Details</h4>
                  <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(orderDetails[order.id], null, 2)}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
