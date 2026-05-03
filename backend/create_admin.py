from sqlmodel import Session, select
from db.database import engine
from models.user import User
from core.security import get_password_hash

def create_admin():
    with Session(engine) as session:
        # Check if admin already exists
        statement = select(User).where(User.email == "admin@firstchoice.cm")
        existing_admin = session.exec(statement).first()
        
        if existing_admin:
            print("Admin account already exists:")
            print("Email: admin@firstchoice.cm")
            return
            
        # Create Admin
        hashed_password = get_password_hash("Admin123!")
        admin_user = User(
            full_name="Super Admin",
            email="admin@firstchoice.cm",
            password_hash=hashed_password,
            role="admin"
        )
        session.add(admin_user)
        session.commit()
        print("Admin account created successfully!")
        print("Email: admin@firstchoice.cm")
        print("Password: Admin123!")

if __name__ == "__main__":
    create_admin()
