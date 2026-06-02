
from pydantic import BaseModel
from typing import List
from uuid import UUID

class ProductCreate(BaseModel):
    name: str
    sku: str
    price: float
    quantity: int

class CustomerCreate(BaseModel):
    full_name: str
    email: str
    phone: str

class OrderItemCreate(BaseModel):
    product_id: UUID
    quantity: int

class OrderCreate(BaseModel):
    customer_id: UUID
    items: List[OrderItemCreate]
