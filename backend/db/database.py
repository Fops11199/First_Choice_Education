from sqlmodel import create_engine, SQLModel, Session
from core.config import settings

# Import models here to register them with SQLModel.metadata
from models import user, content, community, progress, notification, review, advert

engine = create_engine(
    settings.DATABASE_URL, 
    echo=False,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True
)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
