# Backend Status & Instructions

## Latest Changes
- Initialized backend with FastAPI, SQLModel, and PostgreSQL.
- Configured CORS to allow all origins for development.
- Implemented routers for authentication, content, and community.
- Database initialization logic added to app lifespan.

## Current Configuration
- **Port:** 8000
- **URL:** http://localhost:8000
- **Documentation:** http://localhost:8000/docs
- **Database:** PostgreSQL (firstchoice)

## How to Run (Detailed)
1. **Open Terminal:** Open a terminal window in the root of the project.
2. **Navigate to Backend:**
   ```powershell
   cd backend
   ```
3. **Activate Virtual Environment:**
   ```powershell
   .\venv\Scripts\activate
   ```
4. **Run Server:**
   ```powershell
   python main.py
   ```

## Troubleshooting
- **Error 10048 (Port in use):** This means port 8000 is already being used. 
  - **Solution:** Close any other terminal running the backend. If it still fails, run this in PowerShell to find the process ID:
    ```powershell
    netstat -ano | findstr :8000
    ```
    Then kill the process using the PID (the last number in the list):
    ```powershell
    taskkill /F /PID <PID_NUMBER>
    ```
