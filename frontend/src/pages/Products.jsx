
import React from "react";
import { useEffect, useState } from "react";
import api from "../api";
import { toast } from "react-toastify";
import ConfirmationModal from "../components/ConfirmationModal";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name:"",
    sku:"",
    price:"",
    quantity:""
  });
  const [editing, setEditing] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmProductId, setConfirmProductId] = useState(null);

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
    setError(null);
    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, {
          ...form,
          price:Number(form.price),
          quantity:Number(form.quantity)
        });
        setEditing(null);
      } else {
        await api.post("/products/", {
          ...form,
          price:Number(form.price),
          quantity:Number(form.quantity)
        });
      }

      setForm({ name:"", sku:"", price:"", quantity:"" });
      load();
      toast.success(editing ? "Product updated" : "Product added");
    } catch (e) {
      console.error("Products submit error:", e);
      setError(String(e));
      toast.error("Failed to save product");
    }
  };

  const removeConfirmed = async (id) => {
    const prev = products;
    setProducts(products.filter(p=>p.id !== id));
    setConfirmOpen(false);
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
    } catch (e) {
      console.error("Product delete error:", e);
      setProducts(prev);
      toast.error("Failed to delete product");
    }
    load();
  };

  const openConfirm = (id) => {
    setConfirmProductId(id);
    setConfirmOpen(true);
  };

  const startEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name || "",
      sku: product.sku || "",
      price: product.price != null ? String(product.price) : "",
      quantity: product.quantity != null ? String(product.quantity) : ""
    });
    window.scrollTo({top:0,behavior:'smooth'});
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ name:"", sku:"", price:"", quantity:"" });
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

      <section style={{marginBottom:20}}>
        <h2>{editing ? "Edit Product" : "Add Product"}</h2>
        <form onSubmit={submit} className="card">
          <input placeholder="Name" value={form.name}
            onChange={e=>setForm({...form,name:e.target.value})}/>

          <input placeholder="SKU" value={form.sku}
            onChange={e=>setForm({...form,sku:e.target.value})}/>

          <input placeholder="Price" type="number" value={form.price}
            onChange={e=>setForm({...form,price:e.target.value})}/>

          <input placeholder="Quantity" type="number" value={form.quantity}
            onChange={e=>setForm({...form,quantity:e.target.value})}/>

          <div style={{display:'flex',gap:10}}>
            <button>{editing ? "Update Product" : "Add Product"}</button>
            {editing && <button type="button" onClick={cancelEdit} style={{background:'#777'}}>Cancel</button>}
          </div>
        </form>
      </section>

      <section>
        <h2>Product List</h2>
        <div className="grid">
          {products.map(product => (
            <div key={product.id} className="card">
              <h3>{product.name}</h3>
              <p>{product.sku}</p>
              <p>₹{product.price}</p>
              <p>Stock: {product.quantity}</p>

              <div style={{display:'flex',gap:10}}>
                <button onClick={()=>startEdit(product)}>Edit</button>
                <button onClick={()=>openConfirm(product.id)} style={{background:'#900'}}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <ConfirmationModal
        open={confirmOpen}
        title="Delete product"
        message="Delete this product? This action cannot be undone."
        onConfirm={() => removeConfirmed(confirmProductId)}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
