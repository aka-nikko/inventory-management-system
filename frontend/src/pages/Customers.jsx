
import React from "react";
import { useEffect, useState } from "react";
import api from "../api";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    full_name:"",
    email:"",
    phone:""
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setError(null);
    try {
      const res = await api.get("/customers/");
      setCustomers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Customers load error:", e);
      setError(String(e));
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    await api.post("/customers/", form);

    setForm({
      full_name:"",
      email:"",
      phone:""
    });

    load();
  };

  return (
    <div className="container">
      {error && (
        <div className="card" style={{border: '1px solid red'}}>
          <strong>Error loading customers:</strong>
          <pre style={{whiteSpace:'pre-wrap'}}>{error}</pre>
        </div>
      )}
      <h1>Customers</h1>

      <form onSubmit={submit} className="card">
        <input placeholder="Full Name" value={form.full_name}
          onChange={e=>setForm({...form,full_name:e.target.value})}/>

        <input placeholder="Email" value={form.email}
          onChange={e=>setForm({...form,email:e.target.value})}/>

        <input placeholder="Phone" value={form.phone}
          onChange={e=>setForm({...form,phone:e.target.value})}/>

        <button>Add Customer</button>
      </form>

      <div className="grid">
        {customers.map(customer => (
          <div className="card" key={customer.id}>
            <h3>{customer.full_name}</h3>
            <p>{customer.email}</p>
            <p>{customer.phone}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
