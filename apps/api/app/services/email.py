import asyncio
import logging
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)

SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@ledgerlens.app")

def _configured() -> bool:
    return bool(SMTP_HOST and SMTP_USER and SMTP_PASSWORD)

def _send_sync(to: str, subject: str, html: str) -> None:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = FROM_EMAIL
    msg["To"] = to
    msg.attach(MIMEText(html, "html"))
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as smtp:
        smtp.ehlo()
        smtp.starttls()
        smtp.login(SMTP_USER, SMTP_PASSWORD)
        smtp.sendmail(FROM_EMAIL, to, msg.as_string())

async def send_welcome_email(to: str) -> None:
    subject = "Welcome to LedgerLens"
    html = f"""
    <html><body style="font-family: sans-serif; color: #E4E1ED; background: #13131B; padding: 32px;">
      <h2 style="color: #C0C1FF;">Welcome to LedgerLens</h2>
      <p>Hi there,</p>
      <p>Your account has been created. Start sharpening your financial judgment by reviewing AI-generated analyses and identifying where the AI went wrong.</p>
      <p><a href="http://localhost:3000/dashboard" style="color: #C0C1FF;">Open Dashboard →</a></p>
      <p style="color: #8a879b; font-size: 12px;">LedgerLens — Finance Judgment Simulator</p>
    </body></html>
    """
    if not _configured():
        logger.info(f"[email] SMTP not configured — would send welcome to {to}")
        return
    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, _send_sync, to, subject, html)
        logger.info(f"[email] Welcome email sent to {to}")
    except Exception as exc:
        logger.error(f"[email] Failed to send welcome to {to}: {exc}")
