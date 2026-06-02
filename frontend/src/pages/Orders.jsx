
import React from "react";
import { useEffect, useState } from "react";
import api from "../api";
import { toast } from "react-toastify";
import ConfirmationModal from "../components/ConfirmationModal";
import { useAppContext } from "../context/AppContext";

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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmOrderId, setConfirmOrderId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const { products: ctxProducts, customers: ctxCustomers, loadProducts, loadCustomers } = useAppContext();

  useEffect(() => {
    setProducts(ctxProducts);
  }, [ctxProducts]);

  useEffect(() => {
    setCustomers(ctxCustomers);
  }, [ctxCustomers]);

  const load = async () => {
    setError(null);
    try {
      const [o] = await Promise.all([
        api.get("/orders/")
      ]);

      setOrders(Array.isArray(o.data) ? o.data : []);
      // ensure context has latest products/customers
      await Promise.all([loadProducts(), loadCustomers()]);
    } catch (e) {
      console.error("Orders load error:", e);
      setError(String(e));
    }
  };

  const create = async () => {
    if(!customerId) {
      toast.error("Select a customer");
      return;
    }
    if(items.length === 0) {
      toast.error("Add at least one item to the order");
      return;
    }
    setError(null);
    const total = items.reduce((s,it)=> s + (Number(it.price)||0)*Number(it.quantity), 0);
    const tempId = `temp-${Date.now()}`;
    const customer = customers.find(c=>String(c.id) === String(customerId));
    const tempOrder = {
      id: tempId,
      customer_id: customerId,
      customer_name: customer?.full_name,
      total_amount: total.toFixed(2),
      items: items.map(it=>({product_id: it.product_id, quantity: it.quantity, name: it.name, price: it.price}))
    };

    // optimistic UI
    setOrders(prev => [tempOrder, ...prev]);
    setItems([]);
    setSelectedProduct("");
    setSelectedQty(1);

    try {
      await api.post("/orders/", {
        customer_id: customerId,
        items: items.map(i=>({product_id: i.product_id, quantity: i.quantity}))
      });

      // reconcile by reloading
      load();
      toast.success("Order created");
    } catch (e) {
      console.error("Create order error:", e);
      setError(String(e));
      // remove optimistic order
      setOrders(prev => prev.filter(o=>o.id !== tempId));
      toast.error("Failed to create order");
    }
  };

  const addItem = () => {
    if(!selectedProduct) { toast.error("Select a product"); return; }
    const pid = String(selectedProduct);
    const qty = Number(selectedQty) || 1;
    const prod = products.find(p=>String(p.id) === pid);
    if(!prod) { toast.error("Selected product not found"); return; }

    setItems(prev => {
      const existing = prev.find(it=>String(it.product_id) === pid);
      if (existing) {
        return prev.map(it=> String(it.product_id) === pid ? {...it, quantity: it.quantity + qty} : it);
      }
      return [...prev, { product_id: pid, name: prod.name, quantity: qty, price: prod.price }];
    });
    toast.success("Item added");
    setSelectedProduct("");
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
      toast.error("Failed to load order details");
    }
  };

  const openConfirm = (orderId) => {
    setConfirmOrderId(orderId);
    setConfirmOpen(true);
  };

  const removeConfirmed = async (orderId) => {
    const prev = orders;
    setOrders(orders.filter(o=>o.id !== orderId));
    setConfirmOpen(false);
    try {
      await api.delete(`/orders/${orderId}`);
      toast.success("Order deleted");
    } catch (e) {
      console.error("Order delete error:", e);
      setOrders(prev);
      toast.error("Failed to delete order");
    }
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

      <section className="card" style={{marginBottom:20}}>
        <h2>Create Order</h2>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 120px',gap:10}}>
          <div>
            <label>Customer</label>
            <select value={customerId} onChange={e=>setCustomerId(e.target.value)}>
              <option value="">Select Customer</option>
              {customers.map(customer=>(
                <option value={String(customer.id)} key={customer.id}>{customer.full_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Product</label>
            <select value={selectedProduct} onChange={e=>setSelectedProduct(e.target.value)}>
              <option value="">Select Product</option>
              {products.map(p=> (
                <option value={String(p.id)} key={p.id}>{p.name} - ₹{p.price} (Stock: {p.quantity})</option>
              ))}
            </select>
          </div>

          <div>
            <label>Quantity</label>
            <input type="number" value={selectedQty} min={1} onChange={e=>setSelectedQty(e.target.value)} />
          </div>

          <div style={{gridColumn:'1 / -1', display:'flex', justifyContent:'flex-end'}}>
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
                <button onClick={()=>openConfirm(order.id)} style={{background:'#900'}}>Delete</button>
              </div>

              {orderDetails[order.id] && (
                <div style={{marginTop:10}}>
                  <h4>Order Details</h4>
                  {orderDetails[order.id].items && Array.isArray(orderDetails[order.id].items) ? (
                    <div>
                      <table style={{width:'100%',borderCollapse:'collapse'}}>
                        <thead>
                          <tr>
                            <th style={{textAlign:'left',borderBottom:'1px solid #ddd'}}>Product</th>
                            <th style={{textAlign:'right',borderBottom:'1px solid #ddd'}}>Qty</th>
                            <th style={{textAlign:'right',borderBottom:'1px solid #ddd'}}>Price</th>
                            <th style={{textAlign:'right',borderBottom:'1px solid #ddd'}}>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderDetails[order.id].items.map((it, idx) => (
                            <tr key={idx}>
                              <td>{it.product_name || it.product?.name || it.product_id}</td>
                              <td style={{textAlign:'right'}}>{it.quantity}</td>
                              <td style={{textAlign:'right'}}>₹{it.price ?? it.product?.price ?? 0}</td>
                              <td style={{textAlign:'right'}}>₹{(it.quantity * (it.price ?? it.product?.price ?? 0)).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div style={{textAlign:'right',marginTop:8}}>
                        <strong>Total: ₹{orderDetails[order.id].total_amount ?? order.total_amount}</strong>
                      </div>
                    </div>
                  ) : (
                    <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(orderDetails[order.id], null, 2)}</pre>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        <ConfirmationModal
          open={confirmOpen}
          title="Delete order"
          message="Delete this order? This will restore stock and cannot be undone."
          onConfirm={() => removeConfirmed(confirmOrderId)}
          onCancel={() => setConfirmOpen(false)}
        />
      </section>
    </div>
  );
}
