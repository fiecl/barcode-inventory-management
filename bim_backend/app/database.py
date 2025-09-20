"""
    Database connection and session management
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# SMTP_SERVER = os.getenv("SMTP_SERVER")
# SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
# SMTP_USER = os.getenv("SMTP_USER")
# SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

# Use environment variable or fallback to localhost
# DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:Yoshi22397@localhost:5432/bim_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency for getting DB session in endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
