from sqlmodel import create_engine, text

# Try to connect as postgres superuser to fix permissions
POSTGRES_URL = "postgresql://postgres:postgres@localhost:5434/firstchoice"
engine = create_engine(POSTGRES_URL)

def fix_ownership():
    print("Attempting to transfer table ownership to 'fops'...")
    tables = ['thread', 'reply', 'user', 'paper', 'subject', 'level', 'pdf', 'video']
    
    try:
        with engine.connect() as conn:
            for table in tables:
                try:
                    conn.execute(text(f"ALTER TABLE \"{table}\" OWNER TO fops"))
                    print(f"Transferred ownership of '{table}' to fops.")
                except Exception as e:
                    print(f"Could not transfer '{table}': {e}")
            conn.commit()
        print("Ownership fix attempt complete.")
    except Exception as e:
        print(f"CRITICAL ERROR: Could not connect as postgres user. {e}")

if __name__ == "__main__":
    fix_ownership()
