import smtplib
from email.mime.text import MIMEText
from sqlalchemy.orm import Session
from app.models import EmailSettingsDB
import os

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")  # sender
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")  # sender's app password


def get_admin_emails(db: Session) -> list[str]:
    """Fetch all recipient emails from the database."""
    return [row.email for row in db.query(EmailSettingsDB).all()]


def send_threshold_email(recipients: list[str] | str, product_name: str, qty: int, threshold: int):
    """Send a professional stock threshold alert email to one or more recipients."""
    # Ensure recipients is always a list
    if isinstance(recipients, str):
        recipients = [recipients]

    if not recipients:
        return

    subject = f"⚠️ Restock Alert: {product_name}"
    body = f"""
Dear Inventory Manager,

This is an automated notification regarding your product inventory.

Product: {product_name}
Current Quantity: {qty}
Threshold: {threshold}

The stock level has reached or fallen below the defined threshold. 
Please take the necessary steps to restock this item promptly to avoid shortages.

Best regards,
Inventory Management System
    """

    msg = MIMEText(body, "plain")
    msg["Subject"] = subject
    msg["From"] = SMTP_USER
    msg["To"] = ", ".join(recipients)  # display all recipients properly

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_USER, recipients, msg.as_string())


# import aiosmtplib
# from email.message import EmailMessage
# from sqlalchemy.orm import Session
# from app import models

# async def send_threshold_email(to_email: str, product_name: str, quantity: int, threshold: int):
#     """Send an email alert when stock goes below threshold."""
#     msg = EmailMessage()
#     msg["From"] = "your_email@gmail.com"   # replace with your sender
#     msg["To"] = to_email
#     msg["Subject"] = f"Stock Alert: {product_name}"

#     msg.set_content(
#         f"""Hello,  

# The product **{product_name}** has fallen below its threshold.  
# - Current Quantity: {quantity}  
# - Threshold: {threshold}  

# Please restock soon.  

# Thanks,  
# Your Inventory System
# """
#     )

#     await aiosmtplib.send(
#         msg,
#         hostname="smtp.gmail.com",
#         port=587,
#         start_tls=True,
#         username="ritsu22397@gmail.com", # sender
#         password="bzdt dpai gxxf imkf",
#     )


# def get_admin_email(db: Session) -> str | None:
#     """Fetch stored email from EmailSettings table."""
#     email_setting = db.query(models.EmailSettingsDB).first()
#     return email_setting.email if email_setting else None
