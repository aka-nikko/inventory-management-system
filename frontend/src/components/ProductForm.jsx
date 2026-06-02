
import { useState } from "react";

export default function ProductForm({ onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    price: "",
    quantity: ""
  });

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

    setForm({
      name: "",
      sku: "",
      price: "",
      quantity: ""
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
      <input name="sku" placeholder="SKU" value={form.sku} onChange={handleChange} />
      <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} />
      <input name="quantity" type="number" placeholder="Quantity" value={form.quantity} onChange={handleChange} />

      <button type="submit">Add Product</button>
    </form>
  );
}
