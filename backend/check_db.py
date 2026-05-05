from sqlmodel import create_engine, select, text
from db.database import engine
from models.user import User
from core.config import settings

print(f"Connecting to: {settings.DATABASE_URL}")

try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'"))
        tables = [row[0] for row in result]
        print(f"Tables found: {tables}")
except Exception as e:
    print(f"Error: {e}")
