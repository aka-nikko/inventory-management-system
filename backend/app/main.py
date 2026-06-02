import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routes import products, customers, orders
from sqlalchemy.exc import OperationalError
from sqlalchemy import text

for i in range(10):
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            Base.metadata.create_all(bind=engine)
            break

    except OperationalError as e:
        time.sleep(3)

app = FastAPI(title="Inventory Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)

@app.get("/")
def root():
    return {"message": "API Running"}
