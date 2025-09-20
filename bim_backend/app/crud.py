from sqlalchemy.orm import Session
from app import models, schemas
from datetime import datetime, timedelta

# ---------- Product CRUD ----------
def create_product(db: Session, product: schemas.ProductCreate, barcode: str, barcode_file: str):
    db_product = models.ProductDB(
        name=product.name,
        threshold=product.threshold,
        quantity=product.quantity,
        barcode=barcode, # numeric scannable
        barcode_file=barcode_file,
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def get_product_by_barcode(db: Session, barcode: str):
    return db.query(models.ProductDB).filter(models.ProductDB.barcode == barcode).first()

def get_products(db: Session):
    return db.query(models.ProductDB).all()

def update_product_quantity(db: Session, barcode: str, change: int):
    product = get_product_by_barcode(db, barcode)
    if product:
        product.quantity += change
        if product.quantity < 0:
            product.quantity = 0
        db.commit()
        db.refresh(product)
    return product

# ---------- Email Settings CRUD ----------
def add_email(db: Session, email: schemas.EmailSettingsCreate):
    db_email = models.EmailSettingsDB(email=email.email)
    db.add(db_email)
    db.commit()
    db.refresh(db_email)
    return db_email

def get_all_emails(db: Session):
    return db.query(models.EmailSettingsDB).all()

def get_email_by_id(db: Session, email_id: int):
    return db.query(models.EmailSettingsDB).filter(models.EmailSettingsDB.id == email_id).first()

# ---------- Scan CRUD ----------
def get_product_by_barcode(db: Session, barcode: str):
    return db.query(models.ProductDB).filter(models.ProductDB.barcode == barcode).first()

def create_scan_log(db: Session, scan_log: schemas.ScanLogCreate):
    # local_time = datetime.now(LOCAL_TZ)  # local time with tzinfo
    local_time = datetime.now() + timedelta(hours=8)  # UTC + 8 hour
    db_log = models.ScanLog(
        product_id=scan_log.product_id,
        purpose=scan_log.purpose,
        scanned_by=scan_log.scanned_by,
        scanned_at=local_time
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_scan_logs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ScanLog).offset(skip).limit(limit).all()

def delete_scan_log(db: Session, scan_log_id: int):
    scan_log = db.query(models.ScanLog).filter(models.ScanLog.id == scan_log_id).first()
    if scan_log:
        db.delete(scan_log)
        db.commit()
    return scan_log
