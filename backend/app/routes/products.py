
from fastapi import APIRouter, HTTPException, status
from app.database import SessionLocal
from app.models import Product
from app.schemas import ProductCreate

router = APIRouter(prefix="/products", tags=["Products"])
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_product(product: ProductCreate):
    db = SessionLocal()
    try:
        existing = db.query(Product).filter(Product.sku == product.sku).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="SKU already exists")

        db_product = Product(**product.dict())
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/")
def get_products():
    db = SessionLocal()
    return db.query(Product).all()

@router.get("/{product_id}")
def get_product(product_id: str):
    db = SessionLocal()
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product

@router.put("/{product_id}")
def update_product(product_id: str, payload: ProductCreate):
    db = SessionLocal()
    try:
        product = db.query(Product).filter(Product.id == product_id).first()

        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        if payload.sku != product.sku:
            existing = db.query(Product).filter(Product.sku == payload.sku).first()
            if existing:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="SKU already exists")

        for key, value in payload.dict().items():
            setattr(product, key, value)

        db.commit()
        db.refresh(product)
        return product
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.delete("/{product_id}")
def delete_product(product_id: str):
    db = SessionLocal()
    try:
        product = db.query(Product).filter(Product.id == product_id).first()

        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        db.delete(product)
        db.commit()

        return {"message": "Deleted"}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
