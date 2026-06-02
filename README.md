
# Inventory Management System

A simple, production-oriented inventory management web application with a React + Vite frontend and a FastAPI backend. The project is containerized with Docker Compose for easy local development and testing.

**Table of contents**
- Features
- Tech stack
- Quick start (Docker)
- Development (local)
- API overview
- Data rules & validation
- Contributing

## Features
- Product management: add, list, update, delete
- Customer management: add, list, delete
- Order management: create orders, view orders and order details, delete orders (restores stock)
- Dashboard: totals and low-stock alerts
- Responsive, accessible UI with form validation and toast notifications
- Containerized (Docker Compose) for zero-configuration local setup

## Tech stack
- **Frontend:** React 18 + Vite, JSX, axios
- **Backend:** FastAPI, SQLAlchemy, Pydantic
- **Database:** PostgreSQL
- **Dev / Deploy:** Docker, docker-compose

## Quick start (Docker)
Prerequisite: Docker and Docker Compose installed.

1. Build and start services:

```bash
docker compose up --build -d
```

2. Tail logs (optional):

```bash
docker compose logs -f backend
```

3. Open the apps in your browser:

- Frontend: http://localhost:5173/
- Backend OpenAPI docs: http://localhost:8000/docs

## Development (run locally)
Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev -- --host
```

If the frontend needs to reach the backend during development, set `VITE_API_URL` (example for local backend):

```bash
export VITE_API_URL=http://localhost:8000
```

## API overview
The backend exposes REST endpoints (see OpenAPI at `/docs`). Key endpoints:

- `POST /products/` — create product (201). SKU is unique.
- `GET /products/` — list products.
- `PUT /products/{id}` — update product.
- `DELETE /products/{id}` — delete product.

- `POST /customers/` — create customer (201). Email is unique.
- `GET /customers/` — list customers.
- `DELETE /customers/{id}` — delete customer.

- `POST /orders/` — create order (201). Backend validates stock and customer existence, atomically reduces stock, and calculates the order total.
- `GET /orders/` — list orders (includes `customer_name`).
- `GET /orders/{id}` — get order details (items and totals).
- `DELETE /orders/{id}` — delete order (restores stock and removes related order items).

All endpoints use appropriate HTTP status codes and return JSON error details on failure.

## Data rules & validation
- Product `sku` must be unique.
- Customer `email` must be unique and a valid email address.
- Product `quantity` is non-negative; order item `quantity` must be > 0.
- Orders cannot be placed if inventory is insufficient; order creation is transactional and will fail with a `400` if any item is out of stock.
- Deleting an order restores product stock and removes order items atomically.

## Quick curl checks
Create a customer:

```bash
curl -X POST http://localhost:8000/customers/ -H "Content-Type: application/json" \
	-d '{"full_name":"Test User","email":"test@example.com","phone":"12345"}'
```

Try creating an over-quantity order (should fail with 400):

```bash
curl -X POST http://localhost:8000/orders/ -H "Content-Type: application/json" \
	-d '{"customer_id":"<id>","items":[{"product_id":"<id>","quantity":9999}]}'
```
