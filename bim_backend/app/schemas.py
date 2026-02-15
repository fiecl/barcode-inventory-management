"""
    Contains validation and response models (Pydantic).
"""
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# ---------- Product Schemas ----------
class ProductBase(BaseModel):
    name: str
    threshold: int = 5

class ProductCreate(ProductBase):
    quantity: int

class ProductOut(ProductBase):
    id: int
    quantity: int
    barcode: str
    barcode_file: Optional[str]
    status: Optional[str] = None  # Derived field (High/Warning/Low)

    class Config:
        orm_mode = True

# For partial updates
class ProductUpdate(BaseModel):
    name: Optional[str] = None
    threshold: Optional[int] = None
    quantity: Optional[int] = None
    barcode: Optional[str] = None
    barcode_file: Optional[str] = None

# ---------- Email Settings Schemas ----------
class EmailSettingsBase(BaseModel):
    email: EmailStr

class EmailSettingsCreate(EmailSettingsBase):
    pass

class EmailSettingsOut(EmailSettingsBase):
    id: int

    class Config:
        orm_mode = True

# ---------- For Scan Log ----------
class ProductInfo(BaseModel):
    id: int
    name: str
    barcode: str
    quantity: int
    threshold: int

    class Config:
        orm_mode = True

class ScanLogBase(BaseModel):
    purpose: str
    scanned_by: str
    product_id: int
    quantity: int
    threshold: int

class ScanLogCreate(ScanLogBase):
    pass

class ScanLogOut(ScanLogBase):
    id: int
    scanned_at: datetime
    product: ProductOut  # Include product info like name/barcode

    class Config:
        orm_mode = True
