
import React from "react";

export default function DashboardCard({ title, value }) {
  return (
    <div
      style={{
        background: "#f4f4f4",
        padding: "20px",
        borderRadius: "10px",
        minWidth: "200px"
      }}
    >
      <h3>{title}</h3>
      <h1>{value}</h1>
    </div>
  );
}
