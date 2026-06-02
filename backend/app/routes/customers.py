
from fastapi import APIRouter, HTTPException, status
from app.database import SessionLocal
from app.models import Customer
from app.schemas import CustomerCreate

router = APIRouter(prefix="/customers", tags=["Customers"])
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_customer(customer: CustomerCreate):
    db = SessionLocal()
    try:
        existing = db.query(Customer).filter(Customer.email == customer.email).first()

        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")

        db_customer = Customer(**customer.dict())
        db.add(db_customer)
        db.commit()
        db.refresh(db_customer)

        return db_customer
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

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
