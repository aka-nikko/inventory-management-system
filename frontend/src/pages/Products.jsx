
import React from "react";
import { useEffect, useState } from "react";
import api from "../api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name:"",
    sku:"",
    price:"",
    quantity:""
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setError(null);
    try {
      const res = await api.get("/products/");
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Products load error:", e);
      setError(String(e));
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    await api.post("/products/", {
      ...form,
      price:Number(form.price),
      quantity:Number(form.quantity)
    });

    setForm({
      name:"",
      sku:"",
      price:"",
      quantity:""
    });

    load();
  };

  const remove = async (id) => {
    await api.delete(`/products/${id}`);
    load();
  };

  return (
    <div className="container">
      {error && (
        <div className="card" style={{border: '1px solid red'}}>
          <strong>Error loading products:</strong>
          <pre style={{whiteSpace:'pre-wrap'}}>{error}</pre>
        </div>
      )}
      <h1>Products</h1>

      <form onSubmit={submit} className="card">
        <input placeholder="Name" value={form.name}
          onChange={e=>setForm({...form,name:e.target.value})}/>

        <input placeholder="SKU" value={form.sku}
          onChange={e=>setForm({...form,sku:e.target.value})}/>

        <input placeholder="Price" type="number" value={form.price}
          onChange={e=>setForm({...form,price:e.target.value})}/>

        <input placeholder="Quantity" type="number" value={form.quantity}
          onChange={e=>setForm({...form,quantity:e.target.value})}/>

        <button>Add Product</button>
      </form>

      <div className="grid">
        {products.map(product => (
          <div key={product.id} className="card">
            <h3>{product.name}</h3>
            <p>{product.sku}</p>
            <p>₹{product.price}</p>
            <p>Stock: {product.quantity}</p>

            <button onClick={()=>remove(product.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
