
import React, { useEffect, useState } from "react";

export default function ProductForm({ onSubmit, initial = null, submitLabel = "Add Product", showCancel = false, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    price: "",
    quantity: ""
  });

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || "",
        sku: initial.sku || "",
        price: initial.price != null ? String(initial.price) : "",
        quantity: initial.quantity != null ? String(initial.quantity) : ""
      });
    } else {
      setForm({ name: "", sku: "", price: "", quantity: "" });
    }
  }, [initial]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.sku || !form.price) {
      alert("Required fields missing");
      return;
    }

    onSubmit({
      ...form,
      price: Number(form.price),
      quantity: Number(form.quantity)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3>{submitLabel}</h3>
      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
      <input name="sku" placeholder="SKU" value={form.sku} onChange={handleChange} />
      <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} />
      <input name="quantity" type="number" placeholder="Quantity" value={form.quantity} onChange={handleChange} />

      <div style={{display:'flex',gap:10}}>
        <button type="submit">{submitLabel}</button>
        {showCancel && (
          <button type="button" onClick={onCancel} style={{background:'#777'}}>Cancel</button>
        )}
      </div>
    </form>
  );
}
