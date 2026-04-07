# 🚀 Production Deployment Guide

## Overview

This guide covers deploying your SLIIT's Got Talent backend to production with MongoDB Atlas, security best practices, and monitoring.

---

## Phase 1: Pre-Deployment Setup

### 1.1 MongoDB Atlas Setup

1. **Create Account**
   - Go to: https://www.mongodb.com/cloud/atlas
   - Sign up with email
   - Create organization

2. **Create Cluster**
   - Click "Create Deployment"
   - Choose "Shared" (Free tier)
   - Region: Choose closest to your users
   - Cluster name: `sliit-talent`

3. **Configure Security**
   - Create database user:
     - Username: `sliit_admin`
     - Password: Generate strong password
   - Save credentials securely

4. **Configure Network Access**
   - Click "Network Access"
   - Add IP addresses:
     - Current IP: Add current
     - Allow from anywhere: `0.0.0.0/0` (For development)
     - Production: Add specific IPs only

5. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` and `<dbname>`

### 1.2 Environment Configuration

Create `.env.production`:

```env
# MongoDB Atlas
MONGO_URI=mongodb+srv://sliit_admin:PASSWORD@sliit-talent.mongodb.net/sliit-talent?retryWrites=true&w=majority

# Server
PORT=5000
NODE_ENV=production

# JWT
JWT_SECRET=generate_very_long_random_string_here_min_32_chars

# API
API_URL=https://your-domain.com
CLIENT_URL=https://your-frontend-domain.com

# Email (For notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@sliit-talent.com

# Security
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Phase 2: Application Optimization

### 2.1 Security Hardening

```javascript
// In app.js, add security headers
const helmet = require('helmet');
app.use(helmet());

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

Install dependencies:
```bash
npm install helmet express-rate-limit
```

### 2.2 Performance Optimization

```bash
# Install compression
npm install compression

# Added to app.js
const compression = require('compression');
app.use(compression());
```

### 2.3 Logging Setup

```bash
npm install winston
```

Create `config/logger.js`:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

---

## Phase 3: Deployment Options

### Option A: Deploy to Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login & Initialize**
   ```bash
   railway login
   railway init
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set MONGO_URI "your_connection_string"
   railway variables set JWT_SECRET "your_secret"
   ```

4. **Deploy**
   ```bash
   railway up
   ```

### Option B: Deploy to Render

1. **Create Render Account**
   - Go to: https://render.com
   - Sign up

2. **Create New Web Service**
   - Repository: Your GitHub repo
   - Build command: `npm install`
   - Start command: `npm start`

3. **Add Environment Variables**
   - In Render dashboard: Settings → Environment
   - Add all variables from `.env.production`

4. **Deploy**
   - Connect GitHub and push

### Option C: Deploy to VPS (DigitalOcean, Linode)

1. **Setup Server**
   ```bash
   # SSH into server
   ssh root@your_server_ip
   
   # Update system
   apt update && apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   apt install -y nodejs
   
   # Install MongoDB client
   apt install -y mongodb-clients
   
   # Install PM2
   npm install -g pm2
   ```

2. **Clone & Setup**
   ```bash
   git clone your-repo
   cd your-repo/server
   cp .env.example .env
   npm install
   ```

3. **Start with PM2**
   ```bash
   pm2 start index.js --name "sliit-api"
   pm2 startup
   pm2 save
   ```

4. **Setup Nginx (Reverse Proxy)**
   ```bash
   apt install nginx
   
   # Create config
   sudo nano /etc/nginx/sites-available/default
   ```

   Configure:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
   
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
       }
   }
   ```

5. **Enable HTTPS (Let's Encrypt)**
   ```bash
   apt install certbot python3-certbot-nginx
   certbot --nginx -d your-domain.com
   ```

---

## Phase 4: Database Maintenance

### 4.1 Scheduled Backups

For MongoDB Atlas:
1. Go to Backup & Restore
2. Enable automatic backups
3. Set retention: 30 days

For self-hosted:
```bash
# Cron job: backup daily at 2 AM
0 2 * * * node /path/to/db_admin.js backup
```

### 4.2 Monitoring

**MongoDB Atlas Monitoring:**
- Performance tab
- Query Insights
- Atlas Search
- Alerts

**Application Monitoring:**
```bash
# Install monitoring
npm install newrelic

# Set license key
export NEW_RELIC_LICENSE_KEY="your_key"
```

---

## Phase 5: Domain & SSL

### 5.1 Setup Custom Domain

1. **Register Domain**
   - GoDaddy, Namecheap, Route53, etc.

2. **Point to Your Server**
   - Update DNS records
   - A Record: points to server IP
   - CNAME: for subdomains

3. **Setup SSL Certificate**
   ```bash
   # Using Let's Encrypt (free)
   certbot certonly --standalone -d your-domain.com
   ```

### 5.2 Environment Variables for Production

```bash
# Update frontend URLs
API_URL=https://api.your-domain.com
CLIENT_URL=https://your-domain.com
```

---

## Phase 6: Testing Before Production

### 6.1 Load Testing

```bash
# Install load testing tool
npm install -g autocannon

# Test server
autocannon -c 100 -d 30 http://localhost:5000/api/health
```

### 6.2 Security Testing

```bash
# Install security scanner
npm install -g snyk

# Scan dependencies
snyk test
```

### 6.3 End-to-End Testing

```bash
# Run full workflow
1. Login
2. Get contestants
3. Submit score
4. Get scoreboard
5. Verify average calculation
```

---

## Phase 7: Monitoring & Alerts

### 7.1 Setup Application Monitoring

```bash
npm install datadog-browser-rum
```

### 7.2 Error Tracking

```bash
npm install @sentry/node
```

Configure in app.js:
```javascript
const Sentry = require("@sentry/node");

Sentry.init({ 
  dsn: "your-sentry-dsn",
  environment: "production"
});

app.use(Sentry.Handlers.errorHandler());
```

### 7.3 Uptime Monitoring

- UptimeRobot: https://uptimerobot.com
- Pingdom: https://www.pingdom.com
- Healthchecks.io: https://healthchecks.io

---

## Phase 8: Post-Deployment

### 8.1 Verification

```bash
# Test API endpoint
curl https://your-domain.com/api/health

# Check logs
pm2 logs
tail -f error.log

# Monitor MongoDB
Check MongoDB Atlas dashboard
```

### 8.2 Documentation

Create runbook with:
- How to deploy updates
- How to rollback
- Emergency procedures
- Contact information

### 8.3 Performance Metrics

Monitor:
- API response time
- Database query time
- Error rate
- Server CPU/Memory
- MongoDB connection pool

---

## Troubleshooting

### Issue: CORS Errors
```javascript
// Update in app.js
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
```

### Issue: MongoDB Connection Timeout
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db?serverSelectionTimeoutMS=5000
```

### Issue: Memory Leak
```bash
# Monitor memory usage
free -h
ps aux | grep node

# Restart if needed
pm2 restart sliit-api
```

### Issue: High Database Load
```bash
# Check current connections
db.serverStatus().connections

# Check slow queries
db.setProfilingLevel(1)
db.system.profile.find().sort({ts: -1}).limit(10)
```

---

## Regular Maintenance

### Daily
- [ ] Check error logs
- [ ] Monitor server resources
- [ ] Verify database connectivity

### Weekly
- [ ] Review performance metrics
- [ ] Check backup status
- [ ] Update security patches

### Monthly
- [ ] Performance review
- [ ] Dependency updates
- [ ] Security audit
- [ ] Database optimization

---

## Rollback Procedure

If deployment fails:

```bash
# View previous versions
railway backups list  # (Railway)
git log --oneline     # (Git)

# Rollback
git reset --hard HEAD~1
npm start

# Or restore from backup
node db_admin.js restore ./backups/backup-*.json
```

---

## Scaling Strategy

### Current Configuration
- Single server: Handles ~1000 concurrent users
- MongoDB shared cluster: Handles typical load

### If Traffic Increases

1. **Add Read Replicas**
   - MongoDB Atlas: Enable replication
   
2. **Load Balancing**
   - Use Nginx or HAProxy
   - Distribute traffic across servers

3. **Caching**
   - Implement Redis for scoreboard
   - Cache popular queries

4. **Database Optimization**
   - Add more indexes
   - Archive old data

---

## Checklist Before Going Live

- [ ] MongoDB Atlas configured
- [ ] All environment variables set
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Error tracking setup
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Load testing passed
- [ ] Security testing passed
- [ ] End-to-end testing completed
- [ ] Documentation updated
- [ ] Support team trained
- [ ] Rollback plan ready

---

## 🎉 You're Live!

Your backend is now in production, serving real judge scores!

Monitor, maintain, and scale as needed.

**Happy deployment! 🚀**

---

For production support:
- MongoDB Atlas Support: https://support.mongodb.com
- Node.js Security: https://nodejs.org/en/security
- Express Security: https://expressjs.com/en/advanced/best-practice-security.html
