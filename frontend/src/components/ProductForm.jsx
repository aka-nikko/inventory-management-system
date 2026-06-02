
import React, { useEffect, useState } from "react";

export default function ProductForm({ onSubmit, initial = null, submitLabel = "Add Product", showCancel = false, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    price: "",
    quantity: ""
  });
  const [errors, setErrors] = useState({});

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
    const errs = {};
    if (!form.name) errs.name = "Name is required";
    if (!form.sku) errs.sku = "SKU is required";
    if (!form.price) errs.price = "Price is required";
    if (form.price && Number(form.price) < 0) errs.price = "Price must be >= 0";
    if (form.quantity && Number(form.quantity) < 0) errs.quantity = "Quantity must be >= 0";

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

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
      {errors.name && <div style={{color:'red'}}>{errors.name}</div>}

      <input name="sku" placeholder="SKU" value={form.sku} onChange={handleChange} />
      {errors.sku && <div style={{color:'red'}}>{errors.sku}</div>}

      <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} />
      {errors.price && <div style={{color:'red'}}>{errors.price}</div>}

      <input name="quantity" type="number" placeholder="Quantity" value={form.quantity} onChange={handleChange} />
      {errors.quantity && <div style={{color:'red'}}>{errors.quantity}</div>}

      <div style={{display:'flex',gap:10}}>
        <button type="submit">{submitLabel}</button>
        {showCancel && (
          <button type="button" onClick={onCancel} style={{background:'#777'}}>Cancel</button>
        )}
      </div>
    </form>
  );
}
