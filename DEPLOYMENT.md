# Deployment Guide

## ⚡ Quick Deploy Options

### Option 1: Render (Recommended - Free Tier)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Render**
   - Go to https://render.com
   - Sign up with GitHub
   - Click "New +" → "Web Service"
   - Select your repository
   - Configure:
     - **Name**: emotional-vent-space
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: Free
   - Add Environment Variable:
     - `MONGODB_URI` = your MongoDB Atlas connection string
   - Click "Create Web Service"

✅ Live in 2-3 minutes!

---

### Option 2: Railway (Easiest - No Config Needed)

1. **Push to GitHub** (same as above)

2. **Deploy on Railway**
   - Go to https://railway.app
   - Click "Start a New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway auto-detects Node.js
   - Add environment variable in dashboard:
     - `MONGODB_URI` = your MongoDB Atlas connection string
   - Deploy automatically starts

✅ Live in 1-2 minutes!

---

### Option 3: Heroku (Classic Choice)

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login and Create App**
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI="your_mongodb_atlas_uri"
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

5. **Open App**
   ```bash
   heroku open
   ```

---

### Option 4: Vercel (Requires Serverless Conversion)

Vercel doesn't support traditional Node.js servers. You'd need to convert to serverless functions.

---

### Option 5: Netlify (Requires Serverless Conversion)

Netlify also requires serverless functions instead of Express server.

---

## 🗄️ MongoDB Atlas Setup (Required for all options)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster (free tier)
4. Click "Connect" → "Connect your application"
5. Copy connection string
6. Replace `<password>` with your database password
7. Use this as your `MONGODB_URI` environment variable

Example:
```
mongodb+srv://username:password@cluster0.mongodb.net/ventspace?retryWrites=true&w=majority
```

---

## 📝 Pre-Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas cluster created
- [ ] MongoDB connection string ready
- [ ] `.env` file NOT committed (it's in .gitignore)
- [ ] Environment variables set in deployment platform

---

## 🔧 Troubleshooting

**MongoDB Connection Error**
- Check if your IP is whitelisted in MongoDB Atlas (Network Access)
- Or allow all IPs: `0.0.0.0/0` (for testing)
- Verify connection string format

**Port Already in Use (Local)**
- Kill existing Node processes:
  ```bash
  # Windows
  taskkill /F /IM node.exe
  
  # Mac/Linux
  killall node
  ```

**App Not Loading**
- Check deployment logs
- Verify environment variables are set
- Ensure `npm start` works locally first

---

## 🚀 Recommended: Render

For this project, **Render** is the best choice because:
- ✅ Free tier available
- ✅ Supports Node.js servers natively
- ✅ Easy GitHub integration
- ✅ Automatic HTTPS
- ✅ No credit card required
- ✅ Simple environment variable management

Deploy time: ~2 minutes
