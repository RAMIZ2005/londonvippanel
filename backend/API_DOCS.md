# LONDON VIP License System API Documentation

## Base URL
`http://your-server-ip:3000`

## Authentication
Admin endpoints require a Bearer Token.
Header: `Authorization: Bearer <token>`

---

## 1. Authentication

### Login
**POST** `/auth/login`
**Body:**
```json
{
  "username": "LONDON",
  "password": "your_password"
}
```
**Response:**
```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "user": { "id": 1, "username": "LONDON", "role": "admin" }
}
```

### Get Profile
**GET** `/auth/profile`
**Headers:** `Authorization: Bearer <token>`

---

## 2. License Management (Admin Only)

### Get All Licenses
**GET** `/licenses`
**Response:** Array of license objects.

### Create License
**POST** `/licenses`
**Body:**
```json
{
  "max_devices": 1,
  "is_lifetime": false,
  "expire_at": "2024-12-31T23:59:59" 
}
```
*(If `is_lifetime` is true, `expire_at` is ignored)*

### Update License
**PUT** `/licenses/:id`
**Body:**
```json
{
  "max_devices": 2,
  "is_lifetime": true,
  "status": "active" 
}
```
*(Status can be `active` or `blocked`)*

### Delete License
**DELETE** `/licenses/:id`

### Get License Devices
**GET** `/licenses/:id/devices`

### Remove Device
**DELETE** `/licenses/:id/devices/:deviceId`

---

## 3. Android Client API (Public)

### Check License / Activate
**POST** `/api/v1/check`
**Rate Limit:** 100 requests / 15 mins per IP.
**Body:**
```json
{
  "license_key": "AAAA-BBBB-CCCC-DDDD",
  "device_fingerprint": "a6d0c... (SHA-256 hash of device ID)"
}
```

**Response (Signed JWT):**
The response is a JSON Web Token (JWT). You must decode it (and verify signature if using RSA) to get the payload.

**Decoded Payload:**
```json
{
  "valid": true,
  "message": "License active",
  "expire_at": "2024-12-31T23:59:59.000Z",
  "is_lifetime": false
}
```

**Possible Error Payloads:**
- `{"valid": false, "message": "License not found"}`
- `{"valid": false, "message": "License expired"}`
- `{"valid": false, "message": "Device limit reached"}`
- `{"valid": false, "message": "License is blocked"}`
