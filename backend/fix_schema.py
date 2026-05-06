import sys
import os

# Add the current directory to sys.path
sys.path.append(os.getcwd())

from sqlmodel import Session, create_engine, text
from db.database import engine

def fix_schema():
    print("Checking database schema...")
    with Session(engine) as session:
        # 1. Add community_id to thread table if it doesn't exist
        try:
            session.exec(text("ALTER TABLE thread ADD COLUMN community_id UUID REFERENCES community(id)"))
            session.commit()
            print("Added community_id to thread table.")
        except Exception as e:
            session.rollback()
            if "already exists" in str(e).lower():
                print("community_id already exists in thread table.")
            else:
                print(f"Note (thread): {e}")

        # 2. Add category to thread table if it doesn't exist
        try:
            session.exec(text("ALTER TABLE thread ADD COLUMN category VARCHAR"))
            session.commit()
            print("Added category to thread table.")
        except Exception as e:
            session.rollback()
            if "already exists" in str(e).lower():
                print("category already exists in thread table.")
            else:
                print(f"Note (thread category): {e}")

        # 3. ENSURE category is NULLABLE (This was the cause of the 500 error!)
        try:
            session.exec(text("ALTER TABLE thread ALTER COLUMN category DROP NOT NULL"))
            session.commit()
            print("Ensured category column is nullable.")
        except Exception as e:
            session.rollback()
            print(f"Note (nullable category): {e}")

        # 4. Add is_pinned to reply table if it doesn't exist
        try:
            session.exec(text("ALTER TABLE reply ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE"))
            session.commit()
            print("Added is_pinned to reply table.")
        except Exception as e:
            session.rollback()
            if "already exists" in str(e).lower():
                print("is_pinned already exists in reply table.")
            else:
                print(f"Note (reply pin): {e}")

        # 5. Add parent_id to reply table if it doesn't exist
        try:
            session.exec(text("ALTER TABLE reply ADD COLUMN parent_id UUID REFERENCES reply(id)"))
            session.commit()
            print("Added parent_id to reply table.")
        except Exception as e:
            session.rollback()
            if "already exists" in str(e).lower():
                print("parent_id already exists in reply table.")
            else:
                print(f"Note (reply parent): {e}")

    print("Schema check complete.")

if __name__ == "__main__":
    fix_schema()
