import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="app-header">
      <div className="container header-inner">
        <div className="brand">Inventory</div>
        <nav className="main-nav">
          <Link to="/">Dashboard</Link>
          <Link to="/products">Products</Link>
          <Link to="/customers">Customers</Link>
          <Link to="/orders">Orders</Link>
        </nav>
      </div>
    </header>
  );
}
