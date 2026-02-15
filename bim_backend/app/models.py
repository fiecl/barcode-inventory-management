"""
    Strictly contains database tables
"""
import uuid
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class ProductDB(Base):
    __tablename__ = "products"

    # id = Column(Integer, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    id = Column(Integer, primary_key=True, index=True)
    barcode = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    quantity = Column(Integer, default=0)
    quantity_to_order = Column(Integer, default=0)
    threshold = Column(Integer, default=5)
    barcode_file = Column(String, nullable=True)
    classification = Column(String, nullable=True)
    
    scan_logs = relationship("ScanLog", back_populates="product", cascade="all, delete-orphan")


class EmailSettingsDB(Base):
    __tablename__ = "email_settings"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)

# class ScanLog(Base):
#     __tablename__ = "scan_logs"

#     id = Column(Integer, primary_key=True, index=True)
#     product_id = Column(Integer, ForeignKey("products.id"))
#     purpose = Column(String, nullable=False)
#     scanned_by = Column(String, nullable=False)
#     scanned_at = Column(DateTime, default=datetime.now)

#     # New fields
#     quantity = Column(Integer, nullable=False)
#     threshold = Column(Integer, nullable=False)

#     product = relationship("ProductDB", back_populates="scan_logs")

class ScanLog(Base):
    __tablename__ = "scan_logs"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    purpose = Column(String, nullable=False)
    scanned_by = Column(String, nullable=False)
    scanned_at = Column(DateTime, default=datetime.now)

    # Inventory snapshot fields
    quantity = Column(Integer, nullable=False)   # remaining quantity
    threshold = Column(Integer, nullable=False)

    decremented_by = Column(Integer, nullable=False)  # NEW FIELD
    classification = Column(String, nullable=True)  # NEW FIELD

    product = relationship("ProductDB", back_populates="scan_logs")
