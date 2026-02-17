# EDUIO Test Recorder - Deployment Guide

## 🚀 Complete AI Test Generation System

This system allows your staff to record user flows and automatically generate AI-powered Midscene.js tests.

---

## 📋 Prerequisites

1. **Coolify** running on Hostinger VPS
2. **Existing testing-stack** deployed (with Allure dashboard)
3. **Claude API key** (for test generation)
4. **Git repository** for your test suite (testing-stack repo)

---

## 🏗️ Architecture

```
Staff → Web UI → Record Flow → Upload Code → Claude AI → Midscene Test → Review → Git Commit → CI/CD
```

**Components:**
- **Next.js Web App**: User interface for recording and reviewing tests
- **Claude API**: Converts Playwright recordings to Midscene tests
- **Gemini API**: Powers AI visual assertions (reuses your existing key)
- **SQLite Database**: Stores recordings and generated tests
- **Git Integration**: Auto-commits approved tests to your repo

---

## 📦 Deployment Steps

### 1. Get Claude API Key

```bash
# Get API key from: https://console.anthropic.com/
# Set as environment variable in Coolify
```

### 2. Clone to Your VPS

```bash
ssh your-vps
cd /home/your-user
git clone <your-repo-url> test-recorder-app
cd test-recorder-app
```

### 3. Configure Environment Variables

Create `.env` file:

```bash
# Claude API (for test generation)
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

# Gemini API (reuse from your testing-stack)
MIDSCENE_MODEL_API_KEY=AIzaSyCsqdBf1PEf-BPmA2bakjaI3UmVmv0DBGc

# App URL
NEXT_PUBLIC_APP_URL=https://test-recorder.yourdomain.com
APP_URL=https://test-recorder.yourdomain.com

# Database
DATABASE_URL=file:/app/data/dev.db

# Auth
JWT_SECRET=your_random_secret_key_min_32_chars

# Git repository (absolute path to testing-stack)
GIT_REPO_PATH=/path/to/testing-stack

# Allure (if connecting to existing dashboard)
ALLURE_SERVER_URL=http://allure:5050
```

### 4. Deploy on Coolify

#### Option A: Using Coolify UI

1. **Create New Resource** → Docker Compose
2. **Repository**: Point to your test-recorder-app repo
3. **Environment Variables**: Add all from `.env` above
4. **Domain**: `test-recorder.yourdomain.com`
5. **Deploy**

#### Option B: Using CLI

```bash
# Build and deploy
docker-compose up -d

# Check logs
docker logs eduio-test-recorder -f
```

### 5. Initialize Database

```bash
# SSH into container
docker exec -it eduio-test-recorder sh

# Run Prisma migrations
npx prisma migrate deploy
npx prisma db push

# Create admin user (optional)
# You can add an API route or manual script for this
```

---

## 🎯 How Staff Will Use It

### For Staff Members:

1. **Access Web UI**: `https://test-recorder.yourdomain.com`

2. **Start Recording**:
   - Click "New Recording"
   - Enter test name: "Login with valid credentials"
   - Enter starting URL: `https://school.eduio.io/login`
   - Click "Start Recording"

3. **Record Flow** (on their machine):
   ```bash
   npx playwright codegen https://school.eduio.io/login
   ```
   - Browser opens with recorder
   - Perform actions (type credentials, click login, etc.)
   - Copy generated code

4. **Upload Code**:
   - Paste code into web UI
   - Submit for processing

5. **AI Generates Test**:
   - System uses Claude to convert to Midscene test
   - Adds AI visual assertions
   - Shows preview

6. **Review & Approve**:
   - Admin reviews generated test
   - Can edit if needed
   - Clicks "Approve"
   - Test auto-commits to repo

7. **CI/CD Runs**:
   - New test appears in next test run
   - Results in Allure dashboard

---

## 🔧 Configuration Options

### Git Integration

The system auto-commits approved tests to your repository:

```env
GIT_REPO_PATH=/path/to/testing-stack
GIT_AUTHOR_NAME=Test Recorder Bot
GIT_AUTHOR_EMAIL=bot@eduio.io
```

**Important**: Make sure the Docker container has write access to your git repo.

### Custom Test Template

Edit `lib/ai-generator.ts` to customize the AI prompt and test template.

### Authentication

For production, implement proper authentication:
- Add user registration/login
- Use JWT tokens
- Restrict approve permissions to admins

---

## 📊 Monitoring

### Check Application Status

```bash
# View logs
docker logs eduio-test-recorder -f

# Check health
curl https://test-recorder.yourdomain.com/api/health
```

### Database Management

```bash
# Access SQLite database
docker exec -it eduio-test-recorder sh
npx prisma studio
# Opens at http://localhost:5555
```

---

## 🔐 Security Considerations

1. **API Keys**: Store securely in Coolify environment variables
2. **Git Access**: Use deploy keys or service account
3. **Authentication**: Add proper auth before production
4. **Code Review**: Always review AI-generated tests before approval

---

## 🚨 Troubleshooting

### Issue: Claude API Errors

```bash
# Check API key
echo $ANTHROPIC_API_KEY

# Test API
curl -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-sonnet-4-20250514","max_tokens":100,"messages":[{"role":"user","content":"test"}]}'
```

### Issue: Git Commit Fails

```bash
# Check git repo path
ls -la $GIT_REPO_PATH

# Check permissions
docker exec eduio-test-recorder sh -c "cd /app/test-suite && git status"
```

### Issue: Database Not Initialized

```bash
# Re-run migrations
docker exec eduio-test-recorder npx prisma migrate deploy
```

---

## 📈 Scaling & Performance

### For High Volume

- Upgrade to **PostgreSQL** instead of SQLite
- Add **Redis** for caching
- Implement **job queue** for test generation
- Add **rate limiting** on API routes

### Cost Optimization

- Claude API costs ~$0.003 per test generated
- Gemini is already free (your current setup)
- Total cost: ~$1-5/month for typical usage

---

## 🎉 Success!

Your staff can now:
✅ Record user flows via Playwright Codegen
✅ AI automatically generates Midscene tests
✅ Review and approve tests in web UI
✅ Tests auto-commit to your repo
✅ CI/CD runs tests automatically
✅ Results appear in Allure dashboard

---

## 📞 Support

For issues or questions:
1. Check logs: `docker logs eduio-test-recorder`
2. Review API responses in browser DevTools
3. Test API endpoints with curl
4. Check database with Prisma Studio

---

## 🔄 Future Enhancements

- [ ] Direct Playwright integration (record in-browser)
- [ ] Batch test generation
- [ ] Test quality scoring
- [ ] Historical analytics
- [ ] Slack notifications on test approval
- [ ] Multi-project support
