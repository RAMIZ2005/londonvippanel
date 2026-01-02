# LONDON VIP License Management System

A complete, enterprise-grade license management system for Android applications.

## Features
- **Secure Admin Panel**: Manage licenses, devices, and view statistics.
- **REST API**: Node.js backend with JWT authentication.
- **MySQL Database**: Fully normalized schema.
- **Security**: Rate limiting, Bcrypt hashing, Signed JSON responses, Device Fingerprinting.
- **License Types**: Time-based (expiration) and Lifetime licenses.
- **Device Locking**: Auto-bind devices to licenses with strict limits.

## Project Structure
- `backend/`: Node.js Express API
- `frontend/`: HTML5/Bootstrap Admin Panel
- `database/`: MySQL Schema (`schema.sql`)

## Setup Instructions

### 1. Database Setup
1. Install MySQL Server (XAMPP/WAMP or standalone).
2. Create a new database or use the default `london_vip`.
3. Import `database/schema.sql` into your MySQL server.
   ```sql
   source database/schema.sql;
   ```

### 2. Backend Setup
1. Navigate to `backend/`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure `.env`:
   - Edit `.env` and set your `DB_PASSWORD` and `JWT_SECRET`.
4. Start the server:
   ```bash
   npm start
   ```
   Server will run on `http://localhost:3000`.

### 3. Frontend Setup
1. Open `frontend/index.html` in your browser.
2. Login with default credentials:
   - **Username**: `LONDON`
   - **Password**: `admin123` (Note: The hash in SQL corresponds to this or 'Ramiz2005' depending on update status. Use the SQL file comment reference).

## VPS Deployment (Ubuntu/Linux)

1. **Install Node.js & MySQL**:
   ```bash
   sudo apt update
   sudo apt install nodejs npm mysql-server
   ```
2. **Clone/Upload Code**: Upload the project files to `/var/www/london-vip`.
3. **Setup Database**:
   - Log into mysql: `sudo mysql`
   - Run the content of `schema.sql`.
4. **Setup Backend**:
   - `cd /var/www/london-vip/backend`
   - `npm install --production`
   - Use `pm2` to keep server running:
     ```bash
     npm install -g pm2
     pm2 start src/app.js --name "license-system"
     pm2 save
     pm2 startup
     ```
5. **Setup Frontend**:
   - Serve the `frontend` folder using Nginx or Apache.
   - **Nginx Example**:
     ```nginx
     server {
         listen 80;
         server_name your-domain.com;
         
         root /var/www/london-vip/frontend;
         index index.html;

         location /api/ {
             proxy_pass http://localhost:3000/;
         }
     }
     ```
   - *Note*: If hosting frontend and backend on different ports locally, `api.js` in frontend points to `http://localhost:3000`. Update `frontend/assets/js/api.js` `API_BASE_URL` for production if needed.

## Security Notes
- Change the `JWT_SECRET` in `.env` immediately.
- Change the default admin password after first login.
- Enable HTTPS (SSL) on your web server (Nginx/Apache) using Let's Encrypt.
