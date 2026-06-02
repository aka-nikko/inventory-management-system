
import React, { useEffect, useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:8000'

export default function App() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const res = await axios.get(`${API}/products/`)
    setProducts(res.data)
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Inventory Management System</h1>

      <h2>Products</h2>

      {products.map((p) => (
        <div key={p.id}>
          <strong>{p.name}</strong> - ₹{p.price} - Stock: {p.quantity}
        </div>
      ))}
    </div>
  )
}
