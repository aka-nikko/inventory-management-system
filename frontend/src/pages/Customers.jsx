
import { useEffect, useState } from "react";
import api from "../api";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    full_name:"",
    email:"",
    phone:""
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await api.get("/customers/");
    setCustomers(res.data);
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
