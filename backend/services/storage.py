import boto3
from botocore.config import Config
from core.config import settings
import os
import time
import shutil
import mimetypes

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
                region_name='auto'
            )
            print("🚀 StorageService: Cloudflare R2 Active")
        else:
            print("📁 StorageService: Using Local Storage (R2 Credentials Missing)")

    async def upload_file(self, file_obj, filename: str) -> str:
        """
        Uploads a file and returns the public URL.
        Detects content type dynamically and sets 'inline' disposition for PDFs.
        """
        timestamp = int(time.time())
        # Clean filename: replace spaces and special chars
        clean_name = "".join([c if c.isalnum() or c in "._-" else "_" for c in filename])
        unique_filename = f"{timestamp}_{clean_name}"
        
        # Detect content type
        content_type, _ = mimetypes.guess_type(filename)
        if not content_type:
            content_type = 'application/octet-stream'
            
        if self.use_r2:
            try:
                # Set extra args for better browser handling
                extra_args = {'ContentType': content_type}
                
                # Force PDFs to display inline in the browser instead of downloading
                if content_type == 'application/pdf':
                    extra_args['ContentDisposition'] = 'inline'
                
                print(f"⬆️ Uploading to R2: {unique_filename} ({content_type})")
                
                self.s3_client.upload_fileobj(
                    file_obj,
                    settings.R2_BUCKET_NAME,
                    unique_filename,
                    ExtraArgs=extra_args
                )
                
                base_url = settings.R2_PUBLIC_URL.rstrip('/')
                public_url = f"{base_url}/{unique_filename}"
                print(f"✅ R2 Upload Success: {public_url}")
                return public_url
                
            except Exception as e:
                print(f"❌ R2 Upload Failed: {str(e)}")
                # Fallback to local
                return await self._upload_local(file_obj, unique_filename)
        else:
            return await self._upload_local(file_obj, unique_filename)

    async def _upload_local(self, file_obj, unique_filename: str) -> str:
        upload_dir = "uploads"
        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir)
        
        file_path = os.path.join(upload_dir, unique_filename)
        print(f"💾 Saving locally: {file_path}")
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file_obj, buffer)
            
        return f"/uploads/{unique_filename}"

storage_service = StorageService()

