# Cursor tutorial — end-to-end (Utsav Registration Portal)

This document walks **students** through using **Cursor** with this project from zero to a running app. Follow the sections in order. The sample repo was built for a Cursor tutorial so you can practice **accounts**, **opening a folder**, **writing good prompts**, and **running the app** using **`README.md`**.

---

## What you will do

1. Create a **GitHub** account (if you do not have one).
2. Download and install **Cursor**, and sign in.
3. Open this **project folder** in Cursor.
4. Learn how to write a **clear prompt** (using **`CursorPrompt`** as an example).
5. Install **Node.js**, then **install dependencies** and **start** the app (details in **`README.md`**).

---

## Part A — Create a GitHub account

GitHub hosts code online. You use it to sign up, clone tutorials, and save your work later.

1. Open **[https://github.com](https://github.com)** in your browser.
2. Click **Sign up** and follow the steps (email, password, username).
3. Verify your email if GitHub asks you to.
4. (Optional for this tutorial) If this project is on GitHub, you can **clone** it with Git after installing Git, or download it as a ZIP from the repo page. If your instructor gave you a folder already, skip cloning.

---

## Part B — Download and install Cursor

**Cursor** is a code editor (based on VS Code) with built-in AI chat and agents.

1. Open **[https://cursor.com](https://cursor.com)** (or the download page linked from there).
2. Download the installer for your **Windows**, **macOS**, or **Linux** system.
3. Run the installer and complete the steps (accept license, install location, etc.).
4. Launch **Cursor** from the Start menu (Windows), Applications (macOS), or your app launcher (Linux).

If the site or installer looks different later, look for **Download** or **Get Cursor** and pick your operating system.

---

## Part C — Create a Cursor account and sign in

Cursor uses an account so you can use AI features (limits may apply on free plans).

1. When Cursor opens, you may see **Sign in** or **Log in**.
2. Choose **Sign up** if you need a new account, or **Log in** if you already have one.
3. You can often sign in with **GitHub**, **Google**, or **email** — pick what your instructor recommends.
4. Complete any email verification Cursor asks for.

After you are signed in, you should see the main Cursor window (sidebar, editor area, and usually a chat or AI panel).

---

## Part D — Open Cursor’s UI and select this project folder

You want Cursor to treat this folder as the **workspace** so the AI and file tree match the **Utsav Registration Portal** project.

### Open the folder

1. In Cursor, use the menu: **File → Open Folder…** (Windows/Linux) or **File → Open…** (macOS may say **Open Folder**).
2. Browse to the folder that contains this tutorial, e.g. **`utsav-registration-portal`** (the same folder as **`README.md`**, **`package.json`**, and **`server.js`**).
3. Click **Select Folder** / **Open**.

You should see files like **`README.md`**, **`package.json`**, **`server.js`**, **`public/`**, and **`CursorPrompt`** in the **Explorer** sidebar.

### Why the folder matters

- Cursor’s AI uses the **open folder** as context (which files exist, imports, etc.).
- Always open the **project root** (where **`package.json`** lives), not a random parent folder, unless your instructor says otherwise.

---

## Part E — How to write a good prompt in Cursor

A **prompt** is what you type in the **Chat** or **Composer** (or inline AI) to ask Cursor to help. Better prompts give better results.

### Basic habits

| Tip | Why it helps |
|-----|----------------|
| **Say which tool** | “Use the terminal to run…” vs “only edit `server.js`…” avoids confusion. |
| **State the goal in one line** | Example: “Add validation so email must contain `@`.” |
| **List requirements as bullets** | Easier for the AI to check every item. |
| **Name files or features** | Example: “In `public/register.html`, change the button label to…” |
| **Say what not to change** | Example: “Do not change the database schema.” |
| **Ask for small steps if you are learning** | Example: “Explain the change, then show the diff.” |

### Example of a weak prompt

> Fix the bug.

### Example of a stronger prompt

> The login form submits but shows a generic error. Open `public/script.js` and the login route in `server.js`. Find why the error message is wrong, fix it, and tell me what you changed.

### Reference prompt for *this* project: `CursorPrompt`

In this repo, the file **`CursorPrompt`** (no extension) is the **full specification** that was used to generate the **Utsav Registration Portal**. It includes:

- Tech stack (Node, Express, SQLite, vanilla HTML/CSS/JS, sessions)
- Features (registration, login, events, admin dashboard, seed data)
- Database tables and project layout

**Exercise for students:** Open **`CursorPrompt`** in Cursor (click it in the sidebar). Notice how it is **long but structured**: numbered requirements, exact seed emails, table columns, and file names. That is the kind of **clear, detailed requirement list** that works well with AI-assisted coding.

You do not need to paste the whole file every time you work on homework; use it as a **template** for how to describe your own assignments.

---

## Part F — Software you need and how to run the app

Do **not** guess versions from memory. Use the project’s **`README.md`** as the source of truth.

### Required for running this project

- **Node.js** (LTS recommended; includes **`npm`**).

Full install steps for Node.js (and optional SQLite CLI for inspecting the database) are in:

**[README.md](README.md)** — sections **Prerequisites** and **Installing Node.js**.

### First-time commands (after Node is installed)

In a terminal **inside the project folder** (`utsav-registration-portal`):

```bash
npm install
npm start
```

Then open **http://localhost:3000** in your browser.

More detail (database on first run, seeded admin login, troubleshooting) is in **`README.md`** — especially **Setup and run**, **First-time commands**, **Seeded admin**, and **How do I log in to the app?**.

**Summary:** **`README.md`** = install prerequisites and run instructions; **`CursorTutorial.md`** (this file) = Cursor + GitHub + prompting workflow.

---

## Part G — Suggested practice flow (end-to-end)

1. Complete **Part A–D** (GitHub, Cursor install, sign in, **File → Open Folder** on this repo).
2. Read **`CursorPrompt`** once to see a **complete** project prompt.
3. Open **Chat** in Cursor and try a **small** prompt (e.g. “Explain what `server.js` does on startup in three bullet points”).
4. Install **Node.js** using **`README.md`**, then run **`npm install`** and **`npm start`**.
5. Log in with the **seeded admin** credentials from **`README.md`** and click through the app.

---

## Quick checklist

- [ ] GitHub account created (if needed)
- [ ] Cursor downloaded, installed, signed in
- [ ] Project folder **`utsav-registration-portal`** opened in Cursor
- [ ] Read **`CursorPrompt`** as a prompting example
- [ ] Node.js installed (**`README.md`**)
- [ ] Ran **`npm install`** and **`npm start`**; app opens at **http://localhost:3000**

---

## Files to keep handy

| File | Purpose |
|------|--------|
| **[README.md](README.md)** | Prerequisites, run commands, login info, optional SQLite CLI |
| **[CursorPrompt](CursorPrompt)** | Full example of a detailed build specification for this project |
| **CursorTutorial.md** (this file) | Cursor + GitHub + folder + prompting workflow for students |

If something in Cursor’s menus changes, use **Help** inside Cursor or **[https://cursor.com/docs](https://cursor.com/docs)** for the latest official steps.
