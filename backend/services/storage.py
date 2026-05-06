import boto3
from botocore.config import Config
from core.config import settings
import os
import time
import shutil

class StorageService:
    def __init__(self):
        self.use_r2 = all([
            settings.R2_ACCESS_KEY_ID,
            settings.R2_SECRET_ACCESS_KEY,
            settings.R2_ENDPOINT,
            settings.R2_BUCKET_NAME
        ])
        
        if self.use_r2:
            self.s3_client = boto3.client(
                's3',
                endpoint_url=settings.R2_ENDPOINT,
                aws_access_key_id=settings.R2_ACCESS_KEY_ID,
                aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
                config=Config(signature_version='s3v4'),
                region_name='auto' # Cloudflare R2 uses 'auto'
            )
            print("🚀 StorageService: Cloudflare R2 Enabled")
        else:
            print("📁 StorageService: Using Local Storage (R2 credentials missing)")

    async def upload_file(self, file_obj, filename: str) -> str:
        """
        Uploads a file and returns the public URL.
        Falls back to local storage if R2 is not configured.
        """
        timestamp = int(time.time())
        unique_filename = f"{timestamp}_{filename.replace(' ', '_')}"
        
        if self.use_r2:
            try:
                # Upload to R2
                self.s3_client.upload_fileobj(
                    file_obj,
                    settings.R2_BUCKET_NAME,
                    unique_filename,
                    ExtraArgs={'ContentType': 'application/pdf'} # Assuming PDF for now
                )
                
                # Construct public URL
                base_url = settings.R2_PUBLIC_URL.rstrip('/')
                return f"{base_url}/{unique_filename}"
                
            except Exception as e:
                print(f"❌ R2 Upload Failed: {str(e)}")
                # Fallback to local
                return await self._upload_local(file_obj, unique_filename)
        else:
            return await self._upload_local(file_obj, unique_filename)

    async def _upload_local(self, file_obj, unique_filename: str) -> str:
        if not os.path.exists("uploads"):
            os.makedirs("uploads")
        
        file_path = os.path.join("uploads", unique_filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file_obj, buffer)
            
        return f"/uploads/{unique_filename}"

storage_service = StorageService()
