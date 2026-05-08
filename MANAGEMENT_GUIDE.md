# 🚀 First Choice Education: Management Guide

This guide explains how to manage your production environment, including editing code, redeploying, and managing services.

---

## 🛠️ 1. Backend Management
The backend runs as a background service managed by `systemd`.

### 📋 Common Commands
- **Check Status**: See if it's running and view recent logs.
  ```bash
  sudo systemctl status firstchoice-backend
  ```
- **Restart**: Apply code changes made to the Python files.
  ```bash
  sudo systemctl restart firstchoice-backend
  ```
- **Stop**: Bring the backend down.
  ```bash
  sudo systemctl stop firstchoice-backend
  ```
- **Start**: Bring the backend up.
  ```bash
  sudo systemctl start firstchoice-backend
  ```
- **View Live Logs**: Helpful for debugging.
  ```bash
  sudo journalctl -u firstchoice-backend -f
  ```

### 📝 Editing Backend Code
1. Edit the files in `backend/`.
2. After saving your changes, you **must restart** the service for them to take effect:
   ```bash
   sudo systemctl restart firstchoice-backend
   ```

---

## 🎨 2. Frontend Management
The frontend is served as static files by **Nginx**.

### 📋 Common Commands
- **Restart Nginx**: (Usually only needed if you change the Nginx config).
  ```bash
  sudo systemctl restart nginx
  ```
- **Status Check**:
  ```bash
  sudo systemctl status nginx
  ```

### 📝 Editing & Redeploying Frontend
1. **Edit Code**: Modify files in `frontend/src`.
2. **Build the Project**: You need to "recompile" the frontend into the `dist` folder.
   ```bash
   cd frontend
   npm run build
   ```
3. **Wait**: Once the build finishes, Nginx will automatically serve the new files. No restart is required for the frontend unless you change the Nginx configuration file itself.

---

## 🗄️ 3. Database Management
The database is **PostgreSQL** running on port `5434`.

### 📋 Common Commands
- **Access Database CLI**: Connect directly to query data or manage users.
  ```bash
  psql -h 127.0.0.1 -p 5434 -U fops -d firstchoice
  ```
  *(It will prompt for the password found in your `.env` file)*

- **Backup Database**: Create a safety copy of all your data.
  ```bash
  pg_dump -h 127.0.0.1 -p 5434 -U fops -d firstchoice > backup_$(date +%Y%m%d).sql
  ```

- **Restore Database**: Restore from a previously created backup file.
  ```bash
  psql -h 127.0.0.1 -p 5434 -U fops -d firstchoice < your_backup_file.sql
  ```

### 🔐 Managing the Password
If you change the database password:
1. **In Postgres**: Run `ALTER USER fops WITH PASSWORD 'new_password';` inside the `psql` console.
2. **In `.env`**: Update the `DATABASE_URL`.
   - **Note**: If your password contains special characters like `@`, you must URL-encode them (e.g., `@` becomes `%40`).
3. **Restart Backend**: `sudo systemctl restart firstchoice-backend`.

---

## 📁 4. Important Locations
- **Backend Directory**: `backend/`
- **Frontend Directory**: `frontend/`
- **Frontend Production Files**: `frontend/dist/`
- **Nginx Config**: `/etc/nginx/sites-enabled/firstchoice`
- **Backend Service File**: `/etc/systemd/system/firstchoice-backend.service`

---

## 🔄 5. Summary: How to update the site?
If you want to update both the Frontend and Backend with new code:

1. **Upload/Save** your new code files to the server.
2. **For Backend**: Run `sudo systemctl restart firstchoice-backend`.
3. **For Frontend**: Run `cd frontend && npm run build`.
