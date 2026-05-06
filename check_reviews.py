import sqlite3
import os

db_path = "backend/firstchoice.db"
if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("SELECT * FROM review;")
    columns = [description[0] for description in cursor.description]
    rows = cursor.fetchall()
    
    print(f"Columns: {columns}")
    for row in rows:
        print(row)
except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
