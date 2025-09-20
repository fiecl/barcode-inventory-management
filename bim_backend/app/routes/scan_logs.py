from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import schemas, crud
from app.database import get_db

router = APIRouter(prefix="/scan_logs", tags=["scan_logs"])

# @router.post("/", response_model=schemas.ScanLogOut)
# def create_scan_log(scan_log: schemas.ScanLogCreate, db: Session = Depends(get_db)):
#     # Verify product exists
#     print("Create scan log endpoint is working...")
#     product = db.query(crud.models.ProductDB).filter_by(id=scan_log.product_id).first()
#     if not product:
#         raise HTTPException(status_code=404, detail="Product not found")
#     return crud.create_scan_log(db, scan_log)

@router.post("/", response_model=schemas.ScanLogOut)
def create_scan_log(scan: schemas.ScanLogCreate, db: Session = Depends(get_db)):
    product = db.query(crud.models.ProductDB).filter(crud.models.ProductDB.id == scan.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db_log = crud.models.ScanLog(
        purpose=scan.purpose,
        scanned_by=scan.scanned_by,
        product_id=scan.product_id,
        quantity=product.quantity,
        threshold=product.threshold
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@router.get("/", response_model=List[schemas.ScanLogOut])
def read_scan_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_scan_logs(db, skip=skip, limit=limit)

@router.delete("/{scan_log_id}")
def remove_scan_log(scan_log_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_scan_log(db=db, scan_log_id=scan_log_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Scan log not found")
    return {"detail": "Deleted successfully"}