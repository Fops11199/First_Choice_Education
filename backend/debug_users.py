from sqlmodel import Session, create_engine, select
from db.database import engine
from models.user import User

def check_users():
    with Session(engine) as session:
        statement = select(User)
        users = session.exec(statement).all()
        print(f"Total users: {len(users)}")
        for user in users:
            print(f"User: {user.email}, Role: {user.role}, Is Active: {user.is_active}")

if __name__ == "__main__":
    check_users()
