from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app import schemas, crud, models, email_service
from app.database import get_db
import uuid, os, barcode
from barcode.writer import ImageWriter
import random
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/products", tags=["products"])

BARCODE_DIR = "barcodes"
os.makedirs(BARCODE_DIR, exist_ok=True)


# @router.post("/", response_model=schemas.ProductOut)
# def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
#     """Generate a barcode for a new product and save it to DB"""
#     barcode_value = str(uuid.uuid4())
#     file_path = os.path.join(BARCODE_DIR, f"{barcode_value}.png")
#     code128 = barcode.get("code128", barcode_value, writer=ImageWriter())
#     code128.save(file_path)

#     db_product = crud.create_product(db, product, barcode_value, file_path)
#     return _with_status(db_product)

# @router.post("/", response_model=schemas.ProductOut)
# def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
#     """Generate a numeric barcode for a new product and save it to DB"""
#     barcode_value = str(random.randint(10000000, 99999999))  # 8-digit code
#     file_path = os.path.join(BARCODE_DIR, f"{barcode_value}.png")
#     code128 = barcode.get("code128", barcode_value, writer=ImageWriter())
#     code128.save(file_path)

#     print(f"Barcode Value: {barcode_value}")
#     db_product = crud.create_product(db, product, barcode_value, file_path)
#     return _with_status(db_product)

@router.post("/", response_model=schemas.ProductOut)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    """Generate a unique numeric barcode for a new product and save it to DB"""
    
    MAX_ATTEMPTS = 10
    for _ in range(MAX_ATTEMPTS):
        barcode_value = str(random.randint(10000000, 99999999))  # 8-digit
        # Check if barcode already exists
        existing = db.query(models.ProductDB).filter(models.ProductDB.barcode == barcode_value).first()
        if not existing:
            break
    else:
        raise HTTPException(status_code=500, detail="Failed to generate unique barcode")

    # Save barcode image
    file_path = os.path.join(BARCODE_DIR, f"{barcode_value}.png")
    code128 = barcode.get("code128", barcode_value, writer=ImageWriter())
    code128.save(file_path)

    print(f"Barcode Value: {barcode_value}")
    db_product = crud.create_product(db, product, barcode_value, file_path)
    return _with_status(db_product)

@router.get("/{barcode_value}", response_model=schemas.ProductOut)
def get_product(barcode_value: str, db: Session = Depends(get_db)):
    """Fetch a single product by barcode"""
    product = crud.get_product_by_barcode(db, barcode_value)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return _with_status(product)

@router.get("/", response_model=list[schemas.ProductOut])
def list_products(db: Session = Depends(get_db)):
    """List all products with status (High/Warning/Low)"""
    products = crud.get_products(db)
    return [_with_status(p) for p in products]

@router.put("/{barcode_value}", response_model=schemas.ProductOut)
def update_product(
    barcode_value: str,
    product_update: schemas.ProductCreate,  # reuse schema for name/threshold
    db: Session = Depends(get_db),
):
    """Update product details (name, threshold)"""
    product = crud.get_product_by_barcode(db, barcode_value)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.name = product_update.name
    product.threshold = product_update.threshold
    db.commit()
    db.refresh(product)
    return _with_status(product)

@router.patch("/{barcode_value}", response_model=schemas.ProductOut)
def patch_product(
    barcode_value: str,
    product_update: schemas.ProductUpdate,
    db: Session = Depends(get_db),
):
    """Partially update product details (PATCH semantics)"""
    product = crud.get_product_by_barcode(db, barcode_value)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = product_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return _with_status(product)

@router.delete("/{barcode_value}")
def delete_product(barcode_value: str, db: Session = Depends(get_db)):
    """Delete a product by barcode"""
    product = crud.get_product_by_barcode(db, barcode_value)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()
    return {"message": f"Product '{barcode_value}' deleted successfully"}

@router.post("/scan/{barcode_value}", response_model=schemas.ProductOut)
def scan_product(
    barcode_value: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Decrement product quantity when scanned, trigger email if threshold crossed"""
    product = crud.update_product_quantity(db, barcode_value, -1)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Email alert if threshold crossed
    if product.quantity <= product.threshold:
        recipients = email_service.get_admin_emails(db)
        for recipient in recipients:
            background_tasks.add_task(
                email_service.send_threshold_email,
                recipient,
                product.name,
                product.quantity,
                product.threshold,
            )

    return _with_status(product)


@router.put("/{barcode_value}/quantity/{new_quantity}", response_model=schemas.ProductOut)
def update_quantity(
    barcode_value: str,
    new_quantity: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Manually update quantity of a product (e.g. correction), trigger email if threshold crossed"""
    product = crud.get_product_by_barcode(db, barcode_value)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.quantity = new_quantity
    db.commit()
    db.refresh(product)

    # Email alert if threshold crossed
    if product.quantity <= product.threshold:
        recipients = email_service.get_admin_emails(db)
        for recipient in recipients:
            background_tasks.add_task(
                email_service.send_threshold_email,
                recipient,
                product.name,
                product.quantity,
                product.threshold,
            )

    return _with_status(product)


def _with_status(product: models.ProductDB) -> schemas.ProductOut:
    """Attach a status string to product based on threshold comparison"""
    if product.quantity > product.threshold:
        status = "High"
    elif product.quantity == product.threshold:
        status = "Warning"
    else:
        status = "Low"

    return schemas.ProductOut(
        id=product.id,
        name=product.name,
        threshold=product.threshold,
        quantity=product.quantity,
        barcode=product.barcode,
        barcode_file=product.barcode_file,
        status=status,
    )

# @router.get("/barcode/{barcode}", response_model=schemas.ProductOut)
@router.get("/barcode/{barcode}")
def get_product_by_barcode(barcode: str, db: Session = Depends(get_db)):
    product = crud.get_product_by_barcode(db, barcode)
    if not product:
        return None
    return product

# from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
# from sqlalchemy.orm import Session
# from app import schemas, crud, models, email_service
# from app.database import get_db
# import uuid, os, barcode, asyncio
# from barcode.writer import ImageWriter

# router = APIRouter(prefix="/products", tags=["products"])

# BARCODE_DIR = "barcodes"
# os.makedirs(BARCODE_DIR, exist_ok=True)


# @router.post("/", response_model=schemas.ProductOut)
# def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
#     barcode_value = str(uuid.uuid4())
#     file_path = os.path.join(BARCODE_DIR, f"{barcode_value}.png")
#     code128 = barcode.get("code128", barcode_value, writer=ImageWriter())
#     code128.save(file_path)
#     db_product = crud.create_product(db, product, barcode_value, file_path)
#     return _with_status(db_product)


# @router.get("/", response_model=list[schemas.ProductOut])
# def list_products(db: Session = Depends(get_db)):
#     products = crud.get_products(db)
#     return [_with_status(p) for p in products]

# @router.post("/scan/{barcode_value}", response_model=schemas.ProductOut)
# def scan_product(
#     barcode_value: str,
#     background_tasks: BackgroundTasks,
#     db: Session = Depends(get_db)
# ):
#     product = crud.update_product_quantity(db, barcode_value, -1)
#     if not product:
#         raise HTTPException(status_code=404, detail="Product not found")

#     if product.quantity < product.threshold:
#         admin_email = email_service.get_admin_email(db)
#         if admin_email:
#             background_tasks.add_task(
#                 email_service.send_threshold_email,
#                 admin_email,
#                 product.name,
#                 product.quantity,
#                 product.threshold
#             )

#     return _with_status(product)
# # @router.post("/scan/{barcode_value}", response_model=schemas.ProductOut)
# # def scan_product(barcode_value: str, db: Session = Depends(get_db)):
# #     """Decrement product quantity when scanned, trigger email if threshold crossed"""
# #     product = crud.update_product_quantity(db, barcode_value, -1)
# #     if not product:
# #         raise HTTPException(status_code=404, detail="Product not found")

# #     # Email alert if below threshold
# #     if product.quantity < product.threshold:
# #         admin_email = email_service.get_admin_email(db)
# #         if admin_email:
# #             asyncio.create_task(
# #                 email_service.send_threshold_email(
# #                     admin_email,
# #                     product.name,
# #                     product.quantity,
# #                     product.threshold
# #                 )
# #             )

# #     return _with_status(product)


# @router.put("/{barcode_value}/quantity/{new_quantity}", response_model=schemas.ProductOut)
# def update_quantity(barcode_value: str, new_quantity: int, db: Session = Depends(get_db)):
#     product = crud.get_product_by_barcode(db, barcode_value)
#     if not product:
#         raise HTTPException(status_code=404, detail="Product not found")

#     product.quantity = new_quantity
#     db.commit()
#     db.refresh(product)

#     # Email alert if below threshold
#     if product.quantity < product.threshold:
#         admin_email = email_service.get_admin_email(db)
#         if admin_email:
#             asyncio.create_task(
#                 email_service.send_threshold_email(
#                     admin_email,
#                     product.name,
#                     product.quantity,
#                     product.threshold
#                 )
#             )

#     return _with_status(product)


# def _with_status(product: models.ProductDB) -> schemas.ProductOut:
#     if product.quantity > product.threshold:
#         status = "High"
#     elif product.quantity == product.threshold:
#         status = "Warning"
#     else:
#         status = "Low"

#     return schemas.ProductOut(
#         id=product.id,
#         name=product.name,
#         threshold=product.threshold,
#         quantity=product.quantity,
#         barcode=product.barcode,
#         barcode_file=product.barcode_file,
#         status=status,
#     )
