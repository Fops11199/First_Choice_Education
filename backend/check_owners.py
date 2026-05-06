from sqlmodel import text
from db.database import engine

def check_owners():
    with engine.connect() as conn:
        res = conn.execute(text("SELECT tablename, tableowner FROM pg_tables WHERE schemaname = 'public'"))
        for row in res:
            print(f"Table: {row.tablename}, Owner: {row.tableowner}")

if __name__ == "__main__":
    check_owners()
