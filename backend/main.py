# First Choice Education API - Main Entry Point
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
from db.database import init_db
from routers import auth, content, community, users, students, admin, notifications, reviews

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title="First Choice Education API",
    description="GCE past papers platform for Cameroonian students",
    version="2.0.0",
    lifespan=lifespan
)

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://31.220.79.169:5173",
    "http://31.220.79.169.nip.io:5173",
    "http://31.220.79.169",
    "http://31.220.79.169:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Auth (public)
app.include_router(auth.router, prefix="/api/v1")

# Self-service profile (any auth user)
app.include_router(users.router, prefix="/api/v1")

# Read-only content (any auth user)
app.include_router(content.router, prefix="/api/v1")

# Student data — /me pattern, JWT-inferred identity
app.include_router(students.router, prefix="/api/v1")

# Community (any auth user)
app.include_router(community.router, prefix="/api/v1")

# Admin-only CRUD for all platform content
app.include_router(admin.router, prefix="/api/v1")

# Notifications (any auth user)
app.include_router(notifications.router, prefix="/api/v1")

# Reviews/Testimonials
app.include_router(reviews.router, prefix="/api/v1")

# Static Files (PDFs)
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/")
async def root():
    return {
        "message": "First Choice Education API",
        "version": "2.0.0",
        "docs": "/docs",
        "status": "active"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
