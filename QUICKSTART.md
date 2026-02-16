# 🚀 QUICK START - EDUIO Test Recorder

## ⚡ Get Running in 10 Minutes

This is the **complete AI test generation system** for your EDUIO platform.

---

## 📦 What You're Getting

✅ **Web-based UI** for staff to record tests
✅ **Claude AI integration** for converting recordings to Midscene tests  
✅ **Gemini AI** for visual assertions (reuses your existing API key)
✅ **Auto-commit** approved tests to your repository
✅ **Full integration** with your existing testing-stack

---

## 🎯 Prerequisites Checklist

- [ ] Coolify running on Hostinger VPS
- [ ] Your existing `testing-stack` deployed
- [ ] Gemini API key (you already have: `AIzaSyByolJHu7UQjnmvWlHmkN3Ehat0IBNZXng`)
- [ ] Git access to your testing-stack repository

**That's it! No additional API keys needed!** ✅

---

## 🏃 Installation (5 Minutes)

### Step 1: Upload to Your Server

```bash
# SSH into your VPS
ssh your-vps

# Create directory
mkdir -p /home/your-user/eduio-test-recorder
cd /home/your-user/eduio-test-recorder

# Extract the package
tar -xzf test-recorder-app.tar.gz
cd test-recorder-app
```

### Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your values
nano .env
```

**Required variables:**
```env
# Your existing Gemini key (from testing-stack)
MIDSCENE_MODEL_API_KEY=AIzaSyByolJHu7UQjnmvWlHmkN3Ehat0IBNZXng

# Your domain
NEXT_PUBLIC_APP_URL=https://test-recorder.yourdomain.com

# Absolute path to your testing-stack repo
GIT_REPO_PATH=/home/your-user/testing-stack

# Random secret (generate with: openssl rand -hex 32)
JWT_SECRET=your_random_secret_min_32_chars
```

**No other API keys needed!** 🎉

### Step 3: Deploy on Coolify

#### Option A: Docker Compose (Recommended)

```bash
# Build and start
docker-compose up -d

# Check status
docker logs eduio-test-recorder -f
```

#### Option B: Coolify UI

1. Open Coolify dashboard
2. **New Resource** → **Docker Compose**
3. **Source**: Upload `docker-compose.yml`
4. **Environment**: Add all variables from `.env`
5. **Domain**: `test-recorder.yourdomain.com`
6. **Deploy**

### Step 4: Initialize Database

```bash
# Run migrations
docker exec eduio-test-recorder npx prisma migrate deploy
docker exec eduio-test-recorder npx prisma db push

# Create demo user (optional)
docker exec eduio-test-recorder sh scripts/create-demo-user.sh
```

### Step 5: Test It Works

```bash
# Check health
curl https://test-recorder.yourdomain.com/api/health

# Should return: {"status":"healthy",...}
```

---

## ✅ Verify Installation

Open browser: `https://test-recorder.yourdomain.com`

You should see:
- Dashboard with "New Recording" button
- Empty test list
- Clean, professional UI

---

## 👥 Staff Usage (2 Minutes)

Share this with your staff:

### For Recording a Test:

1. **Open**: `https://test-recorder.yourdomain.com`

2. **Click**: "+ New Recording"

3. **Fill in**:
   - Test Name: "Login with valid credentials"
   - Starting URL: `https://school.eduio.io/login`

4. **Run on their machine**:
   ```bash
   npx playwright codegen https://school.eduio.io/login
   ```

5. **Record actions** (login, navigate, etc.)

6. **Copy generated code** from Playwright

7. **Paste in web UI** → Click "Generate Test"

8. **Done!** AI creates Midscene test automatically

---

## 🔍 Admin Workflow

### Reviewing Tests:

1. Open dashboard → See pending tests
2. Click on test → Review AI-generated code
3. Edit if needed (optional)
4. Click "Approve & Commit"
5. Test auto-commits to your `testing-stack` repo
6. Next CI/CD run includes the new test
7. Results appear in Allure dashboard

---

## 📊 Architecture Overview

```
┌──────────────┐
│ Staff Browser│
│  (Recorder)  │
└──────┬───────┘
       │ 1. Record flow with Playwright Codegen
       │
       ▼
┌──────────────┐
│   Web UI     │◄── 2. Upload recorded code
│  (Next.js)   │
└──────┬───────┘
       │ 3. Send to Claude API
       │
       ▼
┌──────────────┐
│  Claude AI   │◄── Converts to Midscene test
└──────┬───────┘
       │ 4. Generated test
       │
       ▼
┌──────────────┐
│   Database   │◄── 5. Store for review
│   (SQLite)   │
└──────┬───────┘
       │ 6. Admin approves
       │
       ▼
┌──────────────┐
│ Git Commit   │◄── 7. Auto-commit to repo
└──────┬───────┘
       │ 8. CI/CD runs
       │
       ▼
┌──────────────┐
│    Allure    │◄── 9. Results dashboard
└──────────────┘
```

---

## 🔧 Configuration Details

### Git Integration

```env
GIT_REPO_PATH=/absolute/path/to/testing-stack
```

Tests are saved to: `{GIT_REPO_PATH}/tests/ai-tests/`

### API Costs

- **Gemini**: 100% FREE! (your existing key)
- **Total**: **$0/month** 🎉
- No usage limits for reasonable use

### Database

SQLite by default (no setup needed).

To upgrade to PostgreSQL:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/testrecorder
```

---

## 🚨 Troubleshooting

### Issue: Gemini API errors

```bash
# Check API key
docker exec eduio-test-recorder printenv | grep MIDSCENE

# Test API manually with your key
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=YOUR_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"test"}]}]}'
```

### Issue: Git commits fail

```bash
# Check permissions
docker exec eduio-test-recorder ls -la /app/test-suite

# Test git access
docker exec eduio-test-recorder sh -c "cd /app/test-suite && git status"
```

### Issue: Database locked

```bash
# Restart container
docker restart eduio-test-recorder

# Or recreate database
docker exec eduio-test-recorder npx prisma db push --force-reset
```

---

## 📚 Documentation

- **[README.md](README.md)**: Complete technical documentation
- **[DEPLOYMENT.md](DEPLOYMENT.md)**: Detailed deployment guide
- **[STAFF-GUIDE.md](STAFF-GUIDE.md)**: Guide for staff members

---

## ✨ Features Included

✅ Web-based recording interface
✅ AI test generation (Claude + Gemini)
✅ Code review workflow
✅ Git auto-commit
✅ SQLite database (upgradeable)
✅ Docker deployment
✅ Health check endpoint
✅ Responsive UI
✅ Error handling
✅ Comprehensive logging

---

## 🎉 Success Criteria

After setup, you should be able to:

1. ✅ Access web UI at your domain
2. ✅ Create new recording
3. ✅ Upload Playwright code
4. ✅ See AI-generated test
5. ✅ Approve and commit
6. ✅ Test appears in repo
7. ✅ CI/CD runs test
8. ✅ Results in Allure

---

## 📞 Next Steps

1. **Test the system** with a simple recording
2. **Train your staff** using STAFF-GUIDE.md
3. **Set up authentication** (add in production)
4. **Configure CI/CD** to run tests on commit
5. **Monitor results** in Allure dashboard

---

## 🎯 Expected Results

After deploying, your staff can:
- Record any user flow in 2-5 minutes
- AI generates test in 10-30 seconds
- Admin approves in 30 seconds
- Test runs automatically forever
- Full visibility in Allure dashboard

**No coding required for staff!**

---

## 🙏 Support

Questions? Check:
1. Logs: `docker logs eduio-test-recorder -f`
2. Health: `curl https://your-domain/api/health`
3. Database: `docker exec -it eduio-test-recorder npx prisma studio`

---

**Ready to revolutionize your testing? Let's go! 🚀**
