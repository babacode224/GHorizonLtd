"""
Secure file upload handler — S3-compatible (AWS S3, MinIO, Cloudflare R2).
Returns a permanent HTTPS URL for the stored object.
"""
import uuid
import mimetypes
from pathlib import Path

import boto3
from botocore.exceptions import ClientError
from fastapi import UploadFile, HTTPException

from config import settings

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
}
MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024  # 20 MB

def _s3_client():
    kwargs = dict(
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    )
    if settings.AWS_ENDPOINT_URL:
        kwargs["endpoint_url"] = settings.AWS_ENDPOINT_URL
    return boto3.client("s3", **kwargs)

async def upload_file(file: UploadFile, folder: str = "documents") -> str:
    content = await file.read()
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds 20 MB limit")

    mime = file.content_type or mimetypes.guess_type(file.filename or "")[0]
    if mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {mime}. Allowed: PDF, JPEG, PNG, WEBP, HEIC",
        )

    ext = Path(file.filename or "file").suffix or ".bin"
    key = f"{folder}/{uuid.uuid4().hex}{ext}"

    try:
        s3 = _s3_client()
        s3.put_object(
            Bucket=settings.AWS_BUCKET_NAME,
            Key=key,
            Body=content,
            ContentType=mime,
            ServerSideEncryption="AES256",
        )
    except ClientError as exc:
        raise HTTPException(status_code=500, detail=f"Storage error: {exc}") from exc

    if settings.AWS_ENDPOINT_URL:
        return f"{settings.AWS_ENDPOINT_URL}/{settings.AWS_BUCKET_NAME}/{key}"
    return f"https://{settings.AWS_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"
