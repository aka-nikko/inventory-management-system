
from fastapi import APIRouter, HTTPException
from app.database import SessionLocal
from app.models import Order, OrderItem, Product
from app.schemas import OrderCreate

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/")
def create_order(order: OrderCreate):
    db = SessionLocal()

    total = 0

    db_order = Order(customer_id=order.customer_id)

    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        if product.quantity < item.quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")

        product.quantity -= item.quantity

        line_total = product.price * item.quantity
        total += line_total

        order_item = OrderItem(
            order_id=db_order.id,
            product_id=product.id,
            quantity=item.quantity,
            price=product.price
        )

        db.add(order_item)

    db_order.total_amount = total

    db.commit()

    return {"message": "Order created", "total": total}

@router.get("/")
def get_orders():
    db = SessionLocal()
    return db.query(Order).all()

@router.get("/{order_id}")
def get_order(order_id: str):
    db = SessionLocal()

    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return order

@router.delete("/{order_id}")
def delete_order(order_id: str):
    db = SessionLocal()

    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    db.delete(order)
    db.commit()

    return {"message": "Deleted"}
