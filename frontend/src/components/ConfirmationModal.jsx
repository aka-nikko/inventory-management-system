import React from "react";

export default function ConfirmationModal({ open, title = "Confirm", message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
      <div style={{background:'#fff',padding:20,borderRadius:8, width: '90%', maxWidth:400}}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div style={{display:'flex',justifyContent:'flex-end',gap:10}}>
          <button onClick={onCancel} style={{background:'#777'}}>Cancel</button>
          <button onClick={onConfirm} style={{background:'#900'}}>Delete</button>
        </div>
      </div>
    </div>
  );
}
