# Login Setup Guide

The application uses **OTP-based authentication** for judges. Before you can login, you need to create judge accounts in the database.

## Quick Start (2 minutes)

### 1. Ensure MongoDB is Running
- MongoDB Atlas should be configured in `.env` with `MONGO_URI`
- Or use local MongoDB: `mongod`

### 2. Create Test Judge Accounts

Run this command in the `server` folder:

```bash
node create_judge.js "judge1@sliit.lk,Judge One,Password123" "judge2@sliit.lk,Judge Two,Password456"
```

**Output Example:**
```
✅ Connected to MongoDB
✅ Judge created: judge1@sliit.lk / Judge One (ID: 507f1...)
✅ Judge created: judge2@sliit.lk / Judge Two (ID: 507f2...)

=== Summary ===
✅ Created: 2
❌ Failed: 0

📋 Created Judges (can login with these credentials):
  📧 Email: judge1@sliit.lk
  👤 Name: Judge One
  🔑 ID: 507f1...

  📧 Email: judge2@sliit.lk
  👤 Name: Judge Two
  🔑 ID: 507f2...
```

### 3. Start the Server

```bash
npm start
```

You'll see:
```
✅ MongoDB Connected Successfully
   Host: your-host
   Database: judge-scoring-db
```

### 4. Login in the Web App

1. Go to `http://localhost:5173`
2. Enter email: `judge1@sliit.lk`
3. **Check server console** - you'll see the OTP printed:
   ```
   📧 OTP for judge1@sliit.lk: 123456
   ```
4. Enter the OTP in the web app
5. ✅ Login successful!

---

## Full Command Format

```bash
node create_judge.js "email,name,password" "email2,name2,password2"
```

**Rules:**
- ✅ Email: Any format (for testing)
- ✅ Name: 1-100 characters
- ✅ Password: Min 6 characters
- ❌ No spaces around commas

**Examples:**
```bash
# Single judge
node create_judge.js "john@example.com,John Doe,MyPass123"

# Multiple judges
node create_judge.js "judge1@test.com,Judge One,Test@1234" "judge2@test.com,Judge Two,Test@1234" "admin@test.com,Admin User,Admin@123"

# Using @sliit.lk emails (if required)
node create_judge.js "judge1@sliit.lk,Judge One,Password123"
```

---

## Troubleshooting

### Error: "Email not registered"
**Solution:** Create the judge account first using the `create_judge.js` script above.

### Error: "MONGO_URI not set"
**Solution:** Check `.env` file has:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/judge-scoring-db
```

### Error: "Cannot connect to MongoDB"
**Solution:** 
- Verify MongoDB is running
- Check your connection string
- Add your IP to MongoDB Atlas whitelist

### OTP Not Showing in Console
**Solution:** 
- In **development mode**, the server logs the OTP to console
- Check the server terminal where you ran `npm start`
- Look for: `📧 OTP for [email]: [code]`

---

## Production Setup

In production, emails should be sent via SMTP. Modify `auth.Controller.js`:

```javascript
// TODO: Uncomment in production
await sendEmail({
  to: email,
  subject: 'Your OTP for SLIIT Got Talent',
  text: `Your OTP is: ${otp}. Valid for 10 minutes.`
});
```

Configure SMTP in `.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```
