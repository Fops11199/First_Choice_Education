
import os
import subprocess
from datetime import datetime
import boto3
from botocore.client import Config
from dotenv import load_dotenv

# Load configuration
load_dotenv()

# Database configuration
DB_URL = os.getenv("DATABASE_URL")
# Extract password from URL if needed, but pg_dump can take the whole URL or use PGPASSWORD
# URL format: postgresql://fops:password@127.0.0.1:5434/firstchoice
# We'll use the URL directly with pg_dump if possible, or extract components.

# R2 configuration
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME")
R2_ENDPOINT = os.getenv("R2_ENDPOINT")

# Backup settings
BACKUP_DIR = "backups"
RETENTION_DAYS = 30

def run_backup():
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"db_backup_{timestamp}.sql.gz"
    local_path = os.path.join(BACKUP_DIR, filename)

    print(f"[{datetime.now()}] Starting backup to {filename}...")

    try:
        # Use pg_dump with the connection string directly
        # Note: we pipe to gzip to compress on the fly
        command = f"pg_dump {DB_URL} | gzip > {local_path}"
        subprocess.run(command, shell=True, check=True)
        print(f"[{datetime.now()}] Local backup created: {local_path}")

        # Upload to R2
        upload_to_r2(local_path, filename)

        # Cleanup local file (since it's now in the cloud)
        os.remove(local_path)
        print(f"[{datetime.now()}] Local file removed.")

        # Cleanup old backups in R2
        cleanup_old_backups()

    except Exception as e:
        print(f"[{datetime.now()}] Backup failed: {e}")

def upload_to_r2(local_path, filename):
    print(f"[{datetime.now()}] Uploading to Cloudflare R2...")
    s3 = boto3.client(
        's3',
        endpoint_url=R2_ENDPOINT,
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        config=Config(signature_version='s3v4')
    )
    
    s3.upload_file(local_path, R2_BUCKET_NAME, f"backups/{filename}")
    print(f"[{datetime.now()}] Upload successful.")

def cleanup_old_backups():
    print(f"[{datetime.now()}] Checking for old backups in R2...")
    s3 = boto3.client(
        's3',
        endpoint_url=R2_ENDPOINT,
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        config=Config(signature_version='s3v4')
    )

    response = s3.list_objects_v2(Bucket=R2_BUCKET_NAME, Prefix='backups/')
    
    if 'Contents' not in response:
        return

    backups = []
    for obj in response['Contents']:
        if obj['Key'].endswith('.sql.gz'):
            backups.append(obj)

    # Sort by date
    backups.sort(key=lambda x: x['LastModified'])

    # If we have more than retention limit, delete the oldest
    if len(backups) > RETENTION_DAYS:
        to_delete = backups[:-RETENTION_DAYS]
        for obj in to_delete:
            print(f"[{datetime.now()}] Deleting old backup: {obj['Key']}")
            s3.delete_object(Bucket=R2_BUCKET_NAME, Key=obj['Key'])

if __name__ == "__main__":
    run_backup()
