
import { Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";

export default function App() {
  return (
    <div>
      <nav style={{
        display: "flex",
        gap: "20px",
        padding: "20px",
        background: "black"
      }}>
        <Link to="/" style={{color:"white"}}>Dashboard</Link>
        <Link to="/products" style={{color:"white"}}>Products</Link>
        <Link to="/customers" style={{color:"white"}}>Customers</Link>
        <Link to="/orders" style={{color:"white"}}>Orders</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </div>
  );
}
