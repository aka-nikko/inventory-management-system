
from fastapi import APIRouter, HTTPException
from app.database import SessionLocal
from app.models import Customer
from app.schemas import CustomerCreate

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.post("/")
def create_customer(customer: CustomerCreate):
    db = SessionLocal()

    existing = db.query(Customer).filter(Customer.email == customer.email).first()

    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    db_customer = Customer(**customer.dict())

    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)

    return db_customer

@router.get("/")
def get_customers():
    db = SessionLocal()
    return db.query(Customer).all()

@router.get("/{customer_id}")
def get_customer(customer_id: str):
    db = SessionLocal()

    customer = db.query(Customer).filter(Customer.id == customer_id).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    return customer

@router.delete("/{customer_id}")
def delete_customer(customer_id: str):
    db = SessionLocal()

    customer = db.query(Customer).filter(Customer.id == customer_id).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    db.delete(customer)
    db.commit()

    return {"message": "Deleted"}
