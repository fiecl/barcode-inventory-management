from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app import models
from app.routes import products, email, scan_logs

# Initialize DB
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Allow frontend (Expo app) to connect
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(products.router)
app.include_router(email.router)
app.include_router(scan_logs.router)
