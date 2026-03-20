# Deployment Guide - ReportIt

Complete guide for deploying ReportIt to production environments.

## 📋 Pre-Deployment Checklist

### Security

- [ ] Change all default passwords
- [ ] Generate new JWT_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Set secure environment variables
- [ ] Configure firewall rules
- [ ] Enable database password authentication
- [ ] Review and fix security vulnerabilities
- [ ] Setup CORS for production domain
- [ ] Enable rate limiting
- [ ] Setup CSRF protection
- [ ] Review and update dependencies

### Configuration

- [ ] Update FRONTEND_URL for production
- [ ] Configure email service for production
- [ ] Setup database backups
- [ ] Configure logging
- [ ] Setup monitoring alerts
- [ ] Configure CDN (if using)
- [ ] Setup error tracking (Sentry, etc.)
- [ ] Configure analytics

### Testing

- [ ] Run all tests
- [ ] Test all user workflows
- [ ] Test API endpoints
- [ ] Test file uploads
- [ ] Test email notifications
- [ ] Security testing
- [ ] Performance testing
- [ ] Cross-browser testing

## 🚀 Deployment Options

### Option 1: Heroku Deployment

#### Prerequisites
- Heroku account
- Heroku CLI installed
- Git configured

#### Steps

1. **Create Heroku Apps**
   ```powershell
   heroku create reportit-backend
   heroku create reportit-frontend
   ```

2. **Set Environment Variables**
   ```powershell
   # Backend
   heroku config:set PORT=5000 -a reportit-backend
   heroku config:set MONGODB_URI=<your-mongodb-uri> -a reportit-backend
   heroku config:set JWT_SECRET=<secure-secret> -a reportit-backend
   heroku config:set EMAIL_SERVICE=gmail -a reportit-backend
   heroku config:set EMAIL_USER=<email> -a reportit-backend
   heroku config:set EMAIL_PASSWORD=<password> -a reportit-backend
   heroku config:set FRONTEND_URL=https://reportit-frontend.herokuapp.com -a reportit-backend
   ```

3. **Deploy Backend**
   ```powershell
   cd backend
   git subtree push --prefix backend heroku-backend main
   ```

4. **Deploy Frontend**
   ```powershell
   cd frontend
   # Update API URL in api.js to production backend
   npm run build
   git subtree push --prefix frontend heroku-frontend main
   ```

5. **Initialize Database**
   ```powershell
   heroku run "npm run seed" -a reportit-backend
   ```

#### Backend Procfile
Create `backend/Procfile`:
```
web: node server.js
```

### Option 2: AWS Deployment

#### Backend on EC2

1. **Launch EC2 Instance**
   - Ubuntu 20.04 LTS
   - t2.micro (or larger)
   - Security group opening ports 5000, 22

2. **SSH into Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

3. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install nodejs npm mongodb nginx
   ```

4. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd ReportIt/backend
   npm install
   ```

5. **Create `.env`**
   ```bash
   sudo nano .env
   # Add all environment variables
   ```

6. **Setup Nginx as Reverse Proxy**
   ```bash
   sudo nano /etc/nginx/sites-available/reportit
   ```
   
   Add:
   ```nginx
   server {
     listen 80;
     server_name your-domain.com;
   
     location / {
       proxy_pass http://localhost:5000;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
     }
   }
   ```

7. **Use PM2 for Process Management**
   ```bash
   sudo npm install -g pm2
   cd backend
   pm2 start server.js --name "reportit-backend"
   pm2 save
   sudo pm2 startup
   ```

#### Frontend on S3 + CloudFront

1. **Build Frontend**
   ```powershell
   cd frontend
   npm run build
   ```

2. **Create S3 Bucket**
   - Enable static website hosting
   - Set public access policy

3. **Upload Build Files**
   ```powershell
   aws s3 sync ./frontend/dist s3://your-bucket-name --delete
   ```

4. **Setup CloudFront Distribution**
   - Origin: S3 bucket
   - Default root object: index.html
   - Error pages: Route to index.html (for React routing)

#### RDS Database

1. **Create RDS Instance**
   - Engine: MongoDB
   - Instance type: db.t3.micro
   - Allocated storage: 20GB
   - Enable backup

2. **Get Connection String**
   - Update backend `.env` with RDS URL

### Option 3: DigitalOcean Deployment

#### Using App Platform

1. **Connect Repository**
   - Link GitHub/GitLab repository

2. **Create App Spec**
   ```yaml
   name: reportit
   services:
   - name: backend
     github:
       repo: username/reportit
       branch: main
     build_command: cd backend && npm install
     run_command: node server.js
     envs:
     - key: NODE_ENV
       value: production
     - key: MONGODB_URI
       value: ${db.connection_string}
     http_port: 5000
   
   - name: frontend
     github:
       repo: username/reportit
       branch: main
     build_command: cd frontend && npm install && npm run build
     http_port: 3000
     source_dir: frontend/dist
   
   databases:
   - name: db
     engine: MONGODB
   ```

3. **Deploy**
   - DigitalOcean will automatically build and deploy

### Option 4: Docker Deployment

#### Create Dockerfiles

**backend/Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

**frontend/Dockerfile**
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    environment:
      MONGODB_URI: mongodb://admin:password@mongodb:27017/reportit
      JWT_SECRET: production-secret
      NODE_ENV: production
      FRONTEND_URL: http://localhost:3000
    volumes:
      - ./backend/uploads:/app/uploads

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

#### Deploy with Docker
```powershell
docker-compose up -d
```

## 🔐 SSL/TLS Certificate Setup

### Using Let's Encrypt with Certbot

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d your-domain.com
sudo nginx -s reload
```

### Update Nginx for HTTPS
```nginx
server {
  listen 80;
  server_name your-domain.com;
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl;
  server_name your-domain.com;
  
  ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
  
  location / {
    proxy_pass http://localhost:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## 📊 Monitoring & Logging

### Backend Monitoring

```javascript
// Add Application Monitoring
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### Logging

```javascript
// Winston Logger Configuration
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'reportit-backend' },
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
```

### Database Monitoring

```javascript
// Monitor MongoDB connections
mongoose.connection.on('connected', () => {
  logger.info('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});
```

## 🔄 Continuous Deployment (CI/CD)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Build Backend
      run: |
        cd backend
        npm install
        npm test
    
    - name: Build Frontend
      run: |
        cd frontend
        npm install
        npm run build
    
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
        heroku_app_name: reportit-backend
        heroku_email: ${{ secrets.HEROKU_EMAIL }}
        appdir: backend
```

## 🗄️ Database Backup Strategy

### Automated Backups

```bash
# Mongodump daily backup script
#!/bin/bash
BACKUP_DIR="/backups/mongodb"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net" \
  --out=$BACKUP_DIR/backup_$TIMESTAMP

# Remove backups older than 30 days
find $BACKUP_DIR -type d -mtime +30 -exec rm -rf {} \;
```

Schedule with cron:
```bash
0 2 * * * /backup-script.sh
```

## 📈 Performance Optimization

### Backend Optimization

```javascript
// Enable compression
const compression = require('compression');
app.use(compression());

// Cache headers
app.use((req, res, next) => {
  if (req.path.match(/\.(css|js|jpg|png|gif|ico)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
  next();
});

// Database indexing
complaintSchema.index({ userId: 1, createdAt: -1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ policeStationId: 1 });
```

### Frontend Optimization

```javascript
// Code splitting in Vite
import { lazy, Suspense } from 'react';

const AdminPanel = lazy(() => import('./admin/AdminPanel'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminPanel />
    </Suspense>
  );
}
```

## 🆘 Troubleshooting Deployment

### Common Issues

**Issue**: Cannot connect to database
- Verify connection string
- Check firewall rules
- Ensure database service is running

**Issue**: CORS errors
- Update FRONTEND_URL in environment
- Check CORS configuration
- Verify domain matches

**Issue**: Slow API responses
- Check database indexes
- Monitor server resources
- Review query performance

**Issue**: Email not sending
- Verify email credentials
- Check rate limiting
- Verify SMTP settings

## ✅ Post-Deployment

### Health Checks

```bash
# Backend
curl -X GET http://your-domain.com/api/auth/health

# Database
mongostat --uri="your-mongodb-uri"
```

### Monitoring Setup

1. **Uptime Monitoring**: Use UptimeRobot or similar
2. **Performance Monitoring**: Setup New Relic or DataDog
3. **Error Tracking**: Configure Sentry
4. **Log Aggregation**: Use ELK Stack or similar

### Security Hardening

```bash
# Update all packages
npm audit fix

# Enable CSP headers
# Enable secure headers (helmet)
const helmet = require('helmet');
app.use(helmet());

# Setup WAF
# Enable rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(limiter);
```

## 📞 Support & Rollback

### Version Control

```bash
# Tag releases
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Rollback if needed
git revert <commit-hash>
```

### Database Migrations

```bash
# Backup before migration
mongodump --uri="your-connection-string"

# Run migration scripts
node scripts/migration.js

# Verify data integrity
```

## 🎯 Production Checklist

- [ ] SSL/TLS certificates installed
- [ ] Firewall configured
- [ ] Database backups automated
- [ ] Monitoring setup
- [ ] Error tracking active
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Logging enabled
- [ ] Database indexed
- [ ] Environment variables secure
- [ ] Dependencies updated
- [ ] Tests passing
- [ ] API documented
- [ ] Team trained

---

**Last Updated**: March 2026

For deployment issues, contact: deployment@reportit.com
