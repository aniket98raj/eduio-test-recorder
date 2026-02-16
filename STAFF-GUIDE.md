# 📚 Staff Guide: Recording Tests

## Step-by-Step Instructions

### 1️⃣ Access the Test Recorder

Open your browser and go to:
```
https://test-recorder.eduio.io
```

(Or whatever URL your admin provides)

---

### 2️⃣ Start a New Recording

1. Click the **"+ New Recording"** button
2. Fill in the form:
   - **Test Name**: Describe what you're testing (e.g., "Login with valid credentials")
   - **Starting URL**: The page where the test starts (e.g., `https://school.eduio.io/login`)
3. Click **"Start Recording"**

---

### 3️⃣ Record Your Actions

A command will appear. Copy it and run in your terminal:

```bash
npx playwright codegen https://school.eduio.io/login
```

**What happens:**
- A browser window opens
- A recording panel appears on the side
- Everything you do is recorded automatically!

**Perform your test:**
- Click buttons
- Fill in forms
- Navigate pages
- Do exactly what a user would do

---

### 4️⃣ Stop & Copy Code

When you're done:
1. Close the browser window
2. The recording panel shows generated code
3. Copy ALL the code

---

### 5️⃣ Upload to System

Back in the Test Recorder website:
1. Find your recording in the list
2. Click on it
3. Paste the copied code
4. Click **"Generate Test"**

---

### 6️⃣ Wait for AI

The system will:
- ✅ Analyze your recording
- ✅ Convert it to an AI-powered test
- ✅ Add smart visual checks
- ✅ Show you the result

This takes about 10-30 seconds.

---

### 7️⃣ Done! 🎉

Your test is now pending review by an admin. Once approved:
- It will run automatically with other tests
- Results appear in the dashboard
- You'll be notified of any failures

---

## ❓ Common Questions

**Q: Do I need coding knowledge?**
A: Nope! Just record your actions. AI writes the code.

**Q: What if I make a mistake while recording?**
A: Just restart the recording. Or record normally and let the admin edit it.

**Q: How long does it take?**
A: Recording: 2-5 minutes. AI generation: 10-30 seconds.

**Q: Can I see the generated test?**
A: Yes! It appears in the dashboard after generation.

**Q: What happens after I upload?**
A: Admin reviews it, approves it, and it starts running automatically.

---

## 💡 Tips for Good Tests

1. **Start from a clean state**: Clear cookies or use incognito
2. **One feature at a time**: Don't test everything in one recording
3. **Use realistic data**: Use test accounts, not real user data
4. **Wait for pages to load**: Don't click too fast
5. **Name tests clearly**: Use descriptive names like "Create new student account"

---

## 🆘 Need Help?

Contact your admin or check:
- Test Recorder Dashboard
- EDUIO Testing Documentation
- Your team's Slack channel

---

## 📋 Example Tests to Record

Good test examples:
- ✅ Login with valid credentials
- ✅ Create a new student
- ✅ Upload grades for a class
- ✅ Generate attendance report
- ✅ Edit teacher profile

Bad test examples:
- ❌ Test everything in the system (too broad)
- ❌ Delete all data (destructive)
- ❌ Test with production data (use test accounts)

---

Happy Testing! 🎉
