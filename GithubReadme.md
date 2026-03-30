# 🚀 Git Setup & First Commit (Node.js Project with .gitignore)

This guide helps you upload your project (e.g., **utsav-registration-portal**) to GitHub using **HTTPS (no SSH keys)**.

---

# 📁 Step 1: Go to your project folder

```bash
cd utsav-registration-portal
```

---

# 🧠 Step 2: Initialize Git

```bash
git init
```

This creates a `.git` folder and starts version control.

---

# 📄 Step 3: Create `.gitignore` (IMPORTANT)

Create a file named `.gitignore`:

```bash
touch .gitignore
```

Or manually create it.

### Paste this content:

```text
# Node modules
node_modules/

# Logs
logs
*.log
npm-debug.log*

# Environment variables
.env

# OS files
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/

# Temp files
tmp/
temp/
```

⚠️ NOTE:
Do **NOT ignore `.db` file** for this demo project (so students can see seeded data).

---

# 🧠 Step 4: Add files to Git

```bash
git add .
```

---

# 🧠 Step 5: Commit your code

```bash
git commit -m "Initial commit - Utsav Registration Portal"
```

---

# 🌐 Step 6: Create repository on GitHub

1. Go to GitHub
2. Click **New Repository**
3. Name:

```
utsav-registration-portal
```

4. Select Public or Private
5. ❌ Do NOT add README
6. Click **Create Repository**

---

# 🔗 Step 7: Connect local repo to GitHub (HTTPS)

Copy the HTTPS URL from GitHub and run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/utsav-registration-portal.git
```

Example:

```bash
git remote add origin https://github.com/satya123/utsav-registration-portal.git
```

---

# 🧠 Step 8: Set branch to main

```bash
git branch -M main
```

---

# 🚀 Step 9: Push code to GitHub

```bash
git push -u origin main
```

---

# 🔐 Step 10: Authentication (IMPORTANT)

GitHub will ask:

### Username

```
your_github_username
```

### Password

👉 Use **Personal Access Token (PAT)** (NOT your real password)

---

# 🔑 How to create Personal Access Token

1. Go to GitHub → Settings
2. Developer Settings
3. Personal Access Tokens
4. Generate new token
5. Select:

   * ✅ repo
6. Generate and copy token

Use this token as your password.

---

# ✅ Done!

Your project is now on GitHub 🎉

---

# 🔁 Next time (only 3 commands needed)

```bash
git add .
git commit -m "your message"
git push
```

---

# 🔍 Useful commands

### Check status

```bash
git status
```

### Check commit history

```bash
git log --oneline
```

### Check remote repo

```bash
git remote -v
```

---

# 🚨 Common Issues

### ❌ Remote already exists

```bash
git remote remove origin
git remote add origin <repo_url>
```

---

### ❌ Push rejected (pull first)

```bash
git pull origin main --rebase
git push
```

---

# 💡 Key Concept

* `git add` → prepare changes
* `git commit` → save changes
* `git push` → upload to GitHub

---

# 🎯 Tip for Students

Always create `.gitignore` before first commit to avoid uploading unnecessary files like `node_modules`.

---
