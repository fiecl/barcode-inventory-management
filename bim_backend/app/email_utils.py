import smtplib
from email.mime.text import MIMEText

def send_email(recipient: str, subject: str, body: str):
    sender = "your-email@gmail.com"
    password = "your-app-password"

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = recipient

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(sender, password)
        server.send_message(msg)
