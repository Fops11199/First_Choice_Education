from sqlmodel import create_engine, text
import os

engine = create_engine('postgresql://fops@localhost:5434/firstchoice')

with engine.connect() as conn:
    try:
        conn.execute(text('ALTER TABLE "user" ADD COLUMN region VARCHAR DEFAULT NULL;'))
    except Exception as e:
        print(f"Skipping user.region: {e}")
        
    try:
        conn.execute(text('ALTER TABLE "user" ADD COLUMN current_school VARCHAR DEFAULT NULL;'))
    except Exception as e:
        print(f"Skipping user.current_school: {e}")

    try:
        conn.execute(text('ALTER TABLE advert ADD COLUMN description TEXT DEFAULT NULL;'))
    except Exception as e:
        print(f"Skipping advert.description: {e}")

    try:
        conn.execute(text('ALTER TABLE advert ADD COLUMN available_regions VARCHAR DEFAULT NULL;'))
    except Exception as e:
        print(f"Skipping advert.available_regions: {e}")
        
    try:
        conn.execute(text('ALTER TABLE advert ADD COLUMN location VARCHAR DEFAULT NULL;'))
    except Exception as e:
        print(f"Skipping advert.location: {e}")
        
    try:
        conn.execute(text('ALTER TABLE advert ADD COLUMN programs TEXT DEFAULT NULL;'))
    except Exception as e:
        print(f"Skipping advert.programs: {e}")
        
    try:
        conn.execute(text('ALTER TABLE advert ADD COLUMN contact_email VARCHAR DEFAULT NULL;'))
    except Exception as e:
        print(f"Skipping advert.contact_email: {e}")
        
    try:
        conn.execute(text('ALTER TABLE advert ADD COLUMN contact_phone VARCHAR DEFAULT NULL;'))
    except Exception as e:
        print(f"Skipping advert.contact_phone: {e}")
        
    try:
        conn.execute(text('ALTER TABLE advert ADD COLUMN institution_type VARCHAR DEFAULT NULL;'))
    except Exception as e:
        print(f"Skipping advert.institution_type: {e}")

    conn.commit()

print("Migration completed.")
