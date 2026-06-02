
from fastapi import APIRouter, HTTPException, status
from app.database import SessionLocal
from app.models import Order, OrderItem, Product
from app.schemas import OrderCreate

router = APIRouter(prefix="/orders", tags=["Orders"])
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_order(order: OrderCreate):
    db = SessionLocal()
    try:
        # validate customer existence
        from app.models import Customer
        customer = db.query(Customer).filter(Customer.id == order.customer_id).first()
        if not customer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

        total = 0
        db_order = Order(customer_id=order.customer_id)
        db.add(db_order)
        db.commit()
        db.refresh(db_order)

        for item in order.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()

            if not product:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product {item.product_id} not found")

            if product.quantity < item.quantity:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Insufficient stock for product {product.id}")

            # decrement stock
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

        return {"message": "Order created", "order_id": str(db_order.id), "total": total}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/")
def get_orders():
    db = SessionLocal()
    orders = db.query(Order).all()
    result = []
    from app.models import Customer
    for o in orders:
        cust = db.query(Customer).filter(Customer.id == o.customer_id).first()
        result.append({
            "id": str(o.id),
            "customer_id": str(o.customer_id),
            "customer_name": cust.full_name if cust else None,
            "total_amount": o.total_amount
        })
    return result

@router.get("/{order_id}")
def get_order(order_id: str):
    db = SessionLocal()
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    # fetch items
    items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    item_list = []
    for it in items:
        prod = db.query(Product).filter(Product.id == it.product_id).first()
        item_list.append({
            "product_id": str(it.product_id),
            "product_name": prod.name if prod else None,
            "quantity": it.quantity,
            "price": it.price
        })

    return {"id": str(order.id), "customer_id": str(order.customer_id), "total_amount": order.total_amount, "items": item_list}

@router.delete("/{order_id}")
def delete_order(order_id: str):
    db = SessionLocal()
    try:
        order = db.query(Order).filter(Order.id == order_id).first()

        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

        # restore stock for items
        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        for it in items:
            prod = db.query(Product).filter(Product.id == it.product_id).first()
            if prod:
                prod.quantity += it.quantity

        # delete order_items via bulk delete to ensure DB removes them before deleting order
        db.query(OrderItem).filter(OrderItem.order_id == order.id).delete(synchronize_session=False)

        db.delete(order)
        db.commit()

        return {"message": "Deleted"}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
