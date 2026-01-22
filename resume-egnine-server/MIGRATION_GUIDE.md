# Migration Guide: Implementing the Enhanced Server

## 📋 Overview

This guide will help you replace your existing `server.js` with the new enhanced version that includes all missing backend routes.

---

## 🚀 Step-by-Step Migration

### Step 1: Backup Your Current Server

```bash
cd resume-egnine-server
cp server.js server.js.backup
```

### Step 2: Replace server.js

Copy the new `server.js` file to your `resume-egnine-server` directory:

```bash
# If the new server.js is in your downloads or current directory
cp /path/to/new/server.js ./server.js
```

### Step 3: Verify Dependencies

Check that your `package.json` has all required dependencies:

```json
{
  "name": "server",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "node test-api.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^5.1.0",
    "puppeteer": "^24.31.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.11"
  }
}
```

All dependencies should already be installed. If not:

```bash
npm install
```

### Step 4: Set Up Environment Variables (Optional)

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your preferred settings (optional for now)
nano .env
```

For development, the defaults work fine. You can skip this step initially.

### Step 5: Start the Server

```bash
# Development mode (recommended - auto-reloads on changes)
npm run dev

# Or production mode
npm start
```

You should see:

```
╔══════════════════════════════════════════════════════════════════╗
║   🎯 ATS Resume Builder - Complete Server                        ║
║   Running on http://localhost:3001                               ║
╚══════════════════════════════════════════════════════════════════╝

📡 ENDPOINTS:

📁 Template Management:
   POST   /api/templates/save
   GET    /api/templates
   ...
```

### Step 6: Test the Server

Run the test script to verify all endpoints work:

```bash
# In a new terminal window (keep the server running)
node test-api.js
```

You should see all tests pass with ✅ green checkmarks.

### Step 7: Update Frontend Configuration

Your frontend already has the correct API calls in `resumeAPI.js`, so it should work immediately. Just verify the API URL is correct:

In `resume-engine/src/services/resumeAPI.js`:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
```

If you want to set a custom URL, create `resume-engine/.env`:

```env
REACT_APP_API_URL=http://localhost:3001
```

### Step 8: Start the Frontend

```bash
cd resume-engine
npm run dev
```

Your frontend should now be able to:
- ✅ Save templates
- ✅ Load templates
- ✅ Generate AI-filled resumes
- ✅ Calculate ATS scores
- ✅ Print PDFs

---

## 🧪 Testing the Integration

### Test 1: Template Management

1. Open your frontend (http://localhost:5173)
2. Create a resume template in the editor
3. Click "Save Template"
4. Give it a name
5. Check the server logs - you should see:
   ```
   ✅ Template saved: Your Template Name (template-abc123)
   ```

### Test 2: Load Template

1. Click "Load Template"
2. You should see your saved template in the list
3. Click to load it
4. The template should appear in the editor

### Test 3: Generate Resume

1. Fill in user data in the form
2. Click "Generate Resume"
3. Server should respond with:
   ```
   🤖 Generating resume for: Your Name
   ✅ Resume generated: resume-xyz789 (ATS Score: 85)
   ```
4. You should see the filled resume with ATS score

### Test 4: Print PDF

1. With a generated resume loaded
2. Click "Print PDF"
3. Server should generate and download a PDF file
4. Server logs should show:
   ```
   🖨️  Generating PDF: your-resume
   ✅ PDF generated successfully
   ```

---

## 📊 What's Different?

### Before (Old Server)
```
❌ 2 endpoints only
❌ No template storage
❌ No AI generation
❌ No ATS scoring
❌ Basic PDF only
```

### After (New Server)
```
✅ 9 endpoints
✅ Template management (CRUD)
✅ AI resume generation
✅ ATS score calculation
✅ Enhanced PDF with multiple options
✅ In-memory storage (upgradeable to DB)
✅ Comprehensive error handling
✅ Request logging
```

---

## 🔧 Common Issues & Solutions

### Issue 1: Port 3001 Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution:**
```bash
# Find what's using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3002 npm start
```

### Issue 2: Frontend Can't Connect to Backend

**Error in browser console:**
```
Failed to fetch: CORS policy
```

**Solution:**
The new server already has CORS enabled. Make sure:
1. Server is running on port 3001
2. Frontend is making requests to `http://localhost:3001`
3. Check browser console for actual URL being called

### Issue 3: Templates Not Persisting

**Symptom:** Templates disappear when server restarts

**Explanation:** This is expected - the server uses in-memory storage.

**Solutions:**
- Short term: Keep server running during development
- Long term: Implement database (see SERVER_README.md)

### Issue 4: Puppeteer Installation Fails

**Error:**
```
The chromium binary is not available for your platform
```

**Solution:**
```bash
# Reinstall puppeteer
npm uninstall puppeteer
npm install puppeteer --save

# Or use puppeteer-core with system Chrome
npm install puppeteer-core
```

### Issue 5: PDF Generation Timeout

**Error:**
```
TimeoutError: Navigation timeout exceeded
```

**Solution:**
Increase timeout in server.js:
```javascript
await page.setContent(html, { 
  waitUntil: 'networkidle0',
  timeout: 60000  // Increase to 60 seconds
});
```

---

## 🎯 Next Steps After Migration

### 1. Verify Everything Works
- [ ] Server starts without errors
- [ ] All test endpoints pass
- [ ] Frontend can connect to server
- [ ] Templates can be saved and loaded
- [ ] Resume generation works
- [ ] PDF printing works

### 2. Implement Database (Optional but Recommended)

Choose your database:

#### Option A: MongoDB (Recommended for this project)
```bash
# Install MongoDB driver
npm install mongoose

# Create models/Template.js
const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: String,
  template: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Template', templateSchema);
```

#### Option B: PostgreSQL
```bash
# Install PostgreSQL driver
npm install pg

# Create schema
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Add Real AI Integration

See SERVER_README.md for instructions on integrating:
- OpenAI GPT-4
- Anthropic Claude
- Google Gemini
- Or any other AI service

### 4. Add Authentication

```bash
npm install jsonwebtoken bcrypt express-session
```

See SERVER_README.md for implementation guide.

### 5. Deploy to Production

Deployment options:
- **Heroku**: Easy deployment, free tier available
- **AWS**: EC2 or Elastic Beanstalk
- **DigitalOcean**: App Platform or Droplets
- **Railway**: Simple deployment, good for Node.js
- **Render**: Free tier available

---

## 📝 Rollback Instructions

If you need to rollback to the old server:

```bash
cd resume-egnine-server
cp server.js.backup server.js
npm start
```

---

## 🆘 Getting Help

### Server Logs
Always check server logs first:
```bash
# Server terminal will show:
✅ Success messages (green)
❌ Error messages (red)
🖨️ PDF generation logs
🤖 AI generation logs
```

### Test Individual Endpoints

Use curl to test specific endpoints:

```bash
# Test health
curl http://localhost:3001/health

# Test save template
curl -X POST http://localhost:3001/api/templates/save \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","template":{"elements":[],"sections":[]}}'
```

### Enable Debug Mode

Add to server.js top:
```javascript
process.env.DEBUG = '*';
```

### Check Network Tab

In browser DevTools → Network tab:
- See all API calls
- Check request/response
- Verify URLs and methods

---

## ✅ Migration Checklist

- [ ] Backed up old server.js
- [ ] Copied new server.js to resume-egnine-server/
- [ ] Verified all dependencies installed
- [ ] Started server successfully
- [ ] Ran test-api.js - all tests passed
- [ ] Started frontend
- [ ] Tested template save/load
- [ ] Tested resume generation
- [ ] Tested PDF printing
- [ ] Server logs show no errors
- [ ] Frontend works end-to-end

---

## 🎉 Success!

If all checklist items are complete, your migration is successful! 

Your resume builder now has:
✅ Full backend API
✅ Template management
✅ AI resume generation (framework ready)
✅ ATS scoring
✅ PDF generation
✅ Error handling
✅ Request logging

Enjoy building amazing resumes! 🚀
