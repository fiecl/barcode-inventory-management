from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, crud
from app.database import get_db

router = APIRouter(prefix="/email", tags=["email"])

# Add a new email
@router.post("/", response_model=schemas.EmailSettingsOut)
def add_email(email: schemas.EmailSettingsCreate, db: Session = Depends(get_db)):
    """Add a new email recipient"""
    return crud.add_email(db, email)

# Get all emails
@router.get("/", response_model=list[schemas.EmailSettingsOut])
def get_all_emails(db: Session = Depends(get_db)):
    """Retrieve all email recipients"""
    return crud.get_all_emails(db)

# Update an existing email by ID
@router.put("/{email_id}", response_model=schemas.EmailSettingsOut)
def update_email(email_id: int, email: schemas.EmailSettingsCreate, db: Session = Depends(get_db)):
    """Update a specific email recipient by ID"""
    db_email = crud.get_email_by_id(db, email_id)
    if not db_email:
        raise HTTPException(status_code=404, detail="Email not found")
    db_email.email = email.email
    db.commit()
    db.refresh(db_email)
    return db_email

# Delete an email by ID
@router.delete("/{email_id}")
def delete_email(email_id: int, db: Session = Depends(get_db)):
    """Delete a specific email recipient by ID"""
    db_email = crud.get_email_by_id(db, email_id)
    if not db_email:
        raise HTTPException(status_code=404, detail="Email not found")
    db.delete(db_email)
    db.commit()
    return {"message": "Email deleted successfully"}
