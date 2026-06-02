
import React from "react";
import { useEffect, useState } from "react";
import api from "../api";
import { toast } from "react-toastify";
import ConfirmationModal from "../components/ConfirmationModal";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    full_name:"",
    email:"",
    phone:""
  });
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmCustomerId, setConfirmCustomerId] = useState(null);

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
    setError(null);
    const errs = {};
    if (!form.full_name) errs.full_name = "Full name is required";
    if (!form.email) errs.email = "Email is required";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = "Invalid email";
    if (form.phone && !/^\+?[0-9\-\s]{7,15}$/.test(form.phone)) errs.phone = "Invalid phone";

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      await api.post("/customers/", form);

      setForm({ full_name:"", email:"", phone:"" });
      load();
      toast.success("Customer added");
    } catch (e) {
      console.error("Customers submit error:", e);
      setError(String(e));
      toast.error("Failed to add customer");
    }
  };

  const removeConfirmed = async (id) => {
    const prev = customers;
    setCustomers(customers.filter(c=>c.id !== id));
    setConfirmOpen(false);
    try {
      await api.delete(`/customers/${id}`);
      toast.success("Customer deleted");
    } catch (e) {
      console.error("Customers delete error:", e);
      setCustomers(prev);
      toast.error("Failed to delete customer");
    }
    load();
  };

  const openConfirm = (id) => {
    setConfirmCustomerId(id);
    setConfirmOpen(true);
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

      <section style={{marginBottom:20}}>
        <h2>Add Customer</h2>
        <form onSubmit={submit} className="card">
        <input placeholder="Full Name" value={form.full_name}
          onChange={e=>setForm({...form,full_name:e.target.value})}/>
        {errors.full_name && <div style={{color:'red'}}>{errors.full_name}</div>}

        <input placeholder="Email" value={form.email}
          onChange={e=>setForm({...form,email:e.target.value})}/>
        {errors.email && <div style={{color:'red'}}>{errors.email}</div>}

        <input placeholder="Phone" value={form.phone}
          onChange={e=>setForm({...form,phone:e.target.value})}/>
        {errors.phone && <div style={{color:'red'}}>{errors.phone}</div>}

        <button>Add Customer</button>
        </form>
      </section>

      <section>
        <h2>Customer List</h2>
        <div className="grid">
          {customers.map(customer => (
            <div className="card" key={customer.id}>
              <h3>{customer.full_name}</h3>
              <p>{customer.email}</p>
              <p>{customer.phone}</p>
              <div style={{display:'flex',gap:10}}>
                <button onClick={()=>openConfirm(customer.id)} style={{background:'#900'}}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <ConfirmationModal
        open={confirmOpen}
        title="Delete customer"
        message="Delete this customer? This action cannot be undone."
        onConfirm={() => removeConfirmed(confirmCustomerId)}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
