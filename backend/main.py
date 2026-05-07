# First Choice Education API - Main Entry Point
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
from db.database import init_db
from routers import auth, content, community, users, students, admin, notifications, reviews
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

# Initialize Limiter
limiter = Limiter(key_func=get_remote_address)

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

# Add Rate Limiting state and handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Custom Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        # Change DENY to SAMEORIGIN to allow same-domain iframes
        # Note: If frontend/backend are on different ports, SAMEORIGIN might still block it in some browsers.
        # But we'll also update CSP to be explicit.
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        # Update CSP to allow 'self' and the explicit backend origins for frames
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://accounts.google.com; "
            "frame-src 'self' https://www.youtube.com https://accounts.google.com http://localhost:8080 http://31.220.79.169:8080; "
            "img-src 'self' data: https:; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com;"
        )
        response.headers["Content-Security-Policy"] = csp
        return response

app.add_middleware(SecurityHeadersMiddleware)

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
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
