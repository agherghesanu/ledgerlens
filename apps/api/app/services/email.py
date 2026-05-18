import asyncio
import logging
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)


def _cfg() -> tuple[str, int, str, str, str]:
    """Read SMTP config fresh from env every call (survives hot-reload / late dotenv load)."""
    return (
        os.getenv("SMTP_HOST", ""),
        int(os.getenv("SMTP_PORT", "587")),
        os.getenv("SMTP_USER", ""),
        os.getenv("SMTP_PASSWORD", ""),
        os.getenv("FROM_EMAIL", "noreply@ledgerlens.app"),
    )


def _configured() -> bool:
    host, _, user, pw, _ = _cfg()
    return bool(host and user and pw)


def _send_sync(to: str, subject: str, html: str) -> None:
    host, port, user, pw, from_email = _cfg()
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = from_email
    msg["To"] = to
    msg.attach(MIMEText(html, "html"))
    with smtplib.SMTP(host, port) as smtp:
        smtp.ehlo()
        smtp.starttls()
        smtp.login(user, pw)
        smtp.sendmail(from_email, to, msg.as_string())


async def send_verification_email(to: str, code: str) -> None:
    subject = "Your LedgerLens verification code"
    html = f"""
    <html><body style="font-family:sans-serif;color:#E4E1ED;background:#13131B;padding:32px;">
      <h2 style="color:#C0C1FF;">Verify your email</h2>
      <p>Enter this code to activate your LedgerLens account:</p>
      <p style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#C0C1FF;margin:24px 0;">{code}</p>
      <p style="color:#8a879b;font-size:12px;">Code expires after first use. If you didn't register, ignore this email.</p>
    </body></html>
    """
    if not _configured():
        logger.info("[email] Verification code for %s: %s", to, code)
        return
    try:
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, _send_sync, to, subject, html)
        logger.info("[email] Verification email sent to %s", to)
    except Exception as exc:
        logger.error("[email] Failed to send verification to %s: %s", to, exc)


async def send_invitation_email(to: str, org_name: str) -> None:
    subject = f"You've been added to {org_name} on LedgerLens"
    html = f"""
    <html><body style="font-family:sans-serif;color:#E4E1ED;background:#13131B;padding:32px;">
      <h2 style="color:#C0C1FF;">You've joined {org_name}</h2>
      <p>Hi there,</p>
      <p>You've been added as a member of <strong style="color:#E4E1ED;">{org_name}</strong> on LedgerLens.</p>
      <p>Log in to your account to see your organization's cases and track your performance.</p>
      <p><a href="http://localhost:3000/settings" style="color:#C0C1FF;">View Organization in Settings →</a></p>
      <p style="color:#8a879b;font-size:12px;">LedgerLens — Finance Judgment Simulator</p>
    </body></html>
    """
    if not _configured():
        logger.info("[email] Invitation email for %s to join %s (SMTP not configured)", to, org_name)
        return
    try:
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, _send_sync, to, subject, html)
        logger.info("[email] Invitation email sent to %s", to)
    except Exception as exc:
        logger.error("[email] Failed to send invitation to %s: %s", to, exc)


async def send_welcome_email(to: str) -> None:
    subject = "Welcome to LedgerLens"
    html = f"""
    <html><body style="font-family:sans-serif;color:#E4E1ED;background:#13131B;padding:32px;">
      <h2 style="color:#C0C1FF;">Welcome to LedgerLens</h2>
      <p>Hi there,</p>
      <p>Your account has been created. Start sharpening your financial judgment by reviewing AI-generated analyses and identifying where the AI went wrong.</p>
      <p><a href="http://localhost:3000/dashboard" style="color:#C0C1FF;">Open Dashboard →</a></p>
      <p style="color:#8a879b;font-size:12px;">LedgerLens — Finance Judgment Simulator</p>
    </body></html>
    """
    if not _configured():
        logger.info("[email] SMTP not configured — would send welcome to %s", to)
        return
    try:
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, _send_sync, to, subject, html)
        logger.info("[email] Welcome email sent to %s", to)
    except Exception as exc:
        logger.error("[email] Failed to send welcome to %s: %s", to, exc)
