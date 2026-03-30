# Utsav Registration Portal

A beginner-friendly college fest registration app: **Node.js**, **Express**, **SQLite** (`sqlite3`), **express-session**, and a **vanilla HTML/CSS/JS** frontend.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended; includes `npm`) — see [Installing Node.js](#installing-nodejs-windows-macos-and-linux) below if you need setup steps.
- The **SQLite3 command-line tool** (`sqlite3`) is optional; it is only needed if you want to run SQL from a terminal as described in [How do I inspect tables and run SQL?](#how-do-i-inspect-tables-and-run-sql). See [Installing the SQLite3 CLI](#installing-the-sqlite3-cli-windows-macos-and-linux).

## Setup and run

1. Open a terminal in this project folder (`utsav-registration-portal`).

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the server:

   ```bash
   npm start
   ```

4. In your browser, open:

   **http://localhost:3000**

   - Home: `/` or `/index.html`
   - Register: `/register.html`
   - Login: `/login.html`
   - Student dashboard (after login): `/dashboard.html`
   - Admin dashboard: `/admin.html` (admin account only)

### First-time commands (quick reference)

From the project root, the **only** shell commands you need for this app are:

```bash
npm install
npm start
```

There are **no separate database initialization commands** (no `sqlite3` CLI step, no manual `CREATE TABLE`, no `npm run migrate`). On every `npm start`, the server runs schema creation and seeding in code before listening on the port:

- **`db.js`** — `initSchema()` creates tables if they do not exist.
- **`seed.js`** — `seed()` inserts admin, demo users, events, and registrations (idempotent; safe on later runs).

That logic is invoked from **`server.js`** in the `start()` function (`await initSchema();` then `await seed();`).

**Two different “SQLite” things:**

| What | How you get it | Required? |
|------|------------------|-----------|
| **Node package `sqlite3`** (lets the app open `utsav.db`) | `npm install` pulls it from `package.json` | **Yes** — needed to run the server |
| **SQLite command-line tool** (`sqlite3` on your PATH) | Optional install; see [Installing the SQLite3 CLI](#installing-the-sqlite3-cli-windows-macos-and-linux) | **No** — only if you want to run SQL in a terminal against `utsav.db` |

To **re-run a full “first run”** (wipe and recreate `utsav.db` plus seed), delete `utsav.db` in this folder, then run `npm start` again. See [Where is the SQLite database?](#where-is-the-sqlite-database).

## First run

On the first start, the app:

- Creates `utsav.db` in the project folder
- Creates tables (`users`, `events`, `registrations`)
- Seeds the admin user, demo users, events, and sample registrations (no duplicates on later runs)

## Seeded admin

- **Email:** `admin@utsav.com`
- **Password:** `admin123`

## Where is the SQLite database?

The database is a **single file** on disk:

- **Path:** `utsav.db` in the **project root** (the same folder as `server.js`, `db.js`, and `package.json`).
- It is created automatically the **first time** you run `npm start` (when the server starts and runs the schema + seed).

You can copy or back up the whole app by including `utsav.db`. Deleting `utsav.db` and restarting the server creates a fresh empty database and re-runs the seed.

## How do I log in to the app?

Use the **browser** after starting the server (`npm start`):

1. Open **http://localhost:3000/login.html** (or click **Login** from the home page).
2. Enter **email** and **password**, then submit.

**Admin (full admin dashboard):**

| Email            | Password   |
|------------------|------------|
| `admin@utsav.com` | `admin123` |

**Demo students** (seeded users; all use the same password):

| Email               | Password  |
|---------------------|-----------|
| `ananya@example.com` | `pass123` |
| `rahul@example.com`  | `pass123` |
| (and other demo emails from the seed — see `seed.js`) | `pass123` |

You can also **register a new account** at **http://localhost:3000/register.html** and then log in with that email and password.

**After login:** regular users are sent to the **user dashboard**; the admin account is sent to the **admin dashboard**.

## How do I inspect tables and run SQL?

The app does not ship a built-in SQL console. You use **external tools** that can open `utsav.db`.

### Option A: SQLite command-line tool (`sqlite3`)

If you have the `sqlite3` CLI installed (e.g. from [SQLite download page](https://www.sqlite.org/download.html) or via a package manager), open a terminal **in the project folder** and run:

```bash
sqlite3 utsav.db
```

Useful **dot-commands** inside the SQLite prompt:

| Command        | What it does                          |
|----------------|----------------------------------------|
| `.tables`      | Lists all tables                       |
| `.schema`      | Shows `CREATE TABLE` for all objects   |
| `.schema users`| Shows schema for one table             |
| `.headers on`  | Show column names in query results     |
| `.mode column` | Nicer column alignment (optional)      |
| `.quit`        | Exit                                   |

**Example queries** (type at the `sqlite>` prompt, end with `;`):

```sql
SELECT id, full_name, email, college, role FROM users;
SELECT id, title, event_date, event_time, max_participants FROM events;
SELECT * FROM registrations;
```

Passwords in `users` are **hashed** (bcrypt), so they will not match plain text.

### Option B: DB Browser for SQLite (GUI)

Install **[DB Browser for SQLite](https://sqlitebrowser.org/)**, choose **Open Database**, select `utsav.db` from this project folder, then use the **Browse Data** and **Execute SQL** tabs to view tables and run `SELECT` statements.

### Important

- **Stop the Node server** (`Ctrl+C` in the terminal running `npm start`) before opening `utsav.db` in some tools, or you may see “database is locked” errors. Alternatively, open read-only or retry after closing the app.

## Optional environment variables

- `PORT` — server port (default `3000`)
- `SESSION_SECRET` — secret for session cookies (set a long random string in production)

## Project layout

| File / folder   | Purpose                          |
|----------------|-----------------------------------|
| `server.js`    | Express app, routes, session      |
| `db.js`        | SQLite helpers and schema         |
| `seed.js`      | Idempotent seed data              |
| `public/`      | Static HTML, CSS, JS              |

## Notes

- Passwords are stored with **bcrypt** hashing.
- Sessions use a cookie (`connect.sid` by default); keep the frontend and API on the same origin for local development.

---

## Installing Node.js (Windows, macOS, and Linux)

Node.js includes **`node`** and **`npm`**. Install the **LTS** version unless you have a reason to use Current.

### Windows

#### Option A: Official installer (simplest)

1. Open **[https://nodejs.org/](https://nodejs.org/)** and download the **LTS** Windows Installer (`.msi`).
2. Run the installer. Enable **“Add to PATH”** if the wizard offers it.
3. Close and reopen your terminal, then check:

   ```bash
   node -v
   npm -v
   ```

#### Option B: winget (Windows Package Manager)

[winget](https://learn.microsoft.com/en-us/windows/package-manager/winget/) is Microsoft’s command-line package manager. It is included on **Windows 11** and recent **Windows 10** builds when the **App Installer** from the Microsoft Store is present. If `winget` is missing, install or update **App Installer** from the Store, then reopen your terminal.

1. Open **PowerShell**, **Command Prompt**, or **Windows Terminal** (normal window is fine; admin is usually not required).
2. Confirm winget is available:

   ```bash
   winget --version
   ```

3. See what Node packages are available (optional):

   ```bash
   winget search OpenJS.NodeJS
   ```

   You should see **`OpenJS.NodeJS.LTS`** for the long-term support release.

4. Install the LTS build non-interactively:

   ```bash
   winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements
   ```

   - `--id OpenJS.NodeJS.LTS` selects the LTS package by id.
   - `-e` uses exact match.
   - The `--accept-*` flags avoid extra prompts in the terminal (safe for learning; you can omit them if you prefer to read each prompt).

5. **Close the terminal completely** and open a new one so `PATH` updates apply.

6. Verify:

   ```bash
   node -v
   npm -v
   ```

If `node` is still not found, sign out of Windows or reboot once, then try again.

**Useful winget commands:** `winget list` (installed packages), `winget upgrade` (updates), `winget uninstall --id OpenJS.NodeJS.LTS` (remove Node). Official docs: [Use WinGet](https://learn.microsoft.com/en-us/windows/package-manager/winget/).

### macOS

#### Option A: Official installer

1. Download the **LTS** macOS installer (`.pkg`) from **[https://nodejs.org/](https://nodejs.org/)** and run it.
2. Follow the wizard, then open **Terminal** and run:

   ```bash
   node -v
   npm -v
   ```

#### Option B: Homebrew (`brew`)

[Homebrew](https://brew.sh/) is a popular package manager for macOS (and Linux). It installs programs under `/opt/homebrew` (Apple Silicon) or `/usr/local` (Intel) and manages updates with simple commands.

**Install Homebrew** (once per Mac) — in **Terminal**, paste the install script from the official site, or run:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the prompts (password, Xcode Command Line Tools if asked). When it finishes, the installer may print **two lines** to add `brew` to your `PATH` — run those commands (they differ slightly on Apple Silicon vs Intel). Example on Apple Silicon:

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

Then confirm:

```bash
brew --version
```

**Install Node with Homebrew:**

```bash
brew update
brew install node
```

- `brew update` refreshes Homebrew’s package list (optional but good if you have not used `brew` recently).
- `brew install node` installs current stable Node and `npm`.

**Check versions:**

```bash
node -v
npm -v
```

**Useful `brew` commands:** `brew list` (installed formulae), `brew upgrade node` (upgrade Node), `brew uninstall node` (remove). Docs: **[https://docs.brew.sh/](https://docs.brew.sh/)**.

### Linux

Pick one approach for your distribution.

**Debian / Ubuntu (using NodeSource LTS — common for up-to-date Node):**

Follow the current instructions at **[https://github.com/nodesource/distributions](https://github.com/nodesource/distributions)** (they provide a one-line setup script and `apt install nodejs`).

**Debian / Ubuntu (simplest, version may be older):**

```bash
sudo apt update
sudo apt install -y nodejs npm
node -v
npm -v
```

**Fedora:**

```bash
sudo dnf install nodejs npm
node -v
npm -v
```

**Arch Linux:**

```bash
sudo pacman -S nodejs npm
node -v
npm -v
```

If you prefer a version manager (multiple Node versions), tools such as **[nvm](https://github.com/nvm-sh/nvm)** or **[fnm](https://github.com/Schniz/fnm)** work on macOS and Linux (and nvm also supports Windows via WSL or nvm-windows).

---

## Installing the SQLite3 CLI (Windows, macOS, and Linux)

These steps install the **`sqlite3`** **command-line** program (not the Node `sqlite3` npm package — that is installed automatically with `npm install` for this project). You only need the CLI if you want to open `utsav.db` in a terminal as in [How do I inspect tables and run SQL?](#how-do-i-inspect-tables-and-run-sql).

### Windows

#### Option A: winget

If you already use [winget](#option-b-winget-windows-package-manager) for Node, you can install SQLite tools the same way.

1. Search for packages (names can change; search shows the current id):

   ```bash
   winget search sqlite
   ```

   Look for a package that provides the **`sqlite3`** command-line tool (often named like **SQLite** or **sqlite-tools**).

2. Install by **id** (replace the id below if `winget search` shows a different one for your machine):

   ```bash
   winget install --id SQLite.SQLite -e --accept-source-agreements --accept-package-agreements
   ```

   If that id is not found, pick the id from your `winget search sqlite` output and run:

   ```bash
   winget install --id <PackageId> -e --accept-source-agreements --accept-package-agreements
   ```

3. **Close and reopen** the terminal (or sign out / reboot if `sqlite3` is still not on `PATH`).

4. Verify:

   ```bash
   sqlite3 --version
   ```

#### Option B: Official ZIP (manual PATH)

1. Go to **[https://www.sqlite.org/download.html](https://www.sqlite.org/download.html)**.
2. Under **Precompiled Binaries for Windows**, download the **sqlite-tools** ZIP for your CPU (for example `sqlite-tools-win-x64-*.zip`).
3. Extract the ZIP. Put **`sqlite3.exe`** somewhere permanent (for example `C:\sqlite\`).
4. Add that folder to your **PATH** (*Settings → System → About → Advanced system settings → Environment Variables → Path → Edit*), then open a **new** terminal.
5. Check:

   ```bash
   sqlite3 --version
   ```

**Other options:** [Chocolatey](https://chocolatey.org/) `choco install sqlite` or [Scoop](https://scoop.sh/) `scoop install sqlite`, if you already use those tools.

### macOS

Often **`sqlite3` is already installed** (macOS ships a CLI in many versions). Try:

```bash
sqlite3 --version
```

If that works, you do not need to install anything else for basic use.

**If the command is missing**, use **Homebrew** (see [Option B: Homebrew](#option-b-homebrew-brew) under Node.js above — install Homebrew first if needed):

```bash
brew update
brew install sqlite
```

Homebrew puts `sqlite3` on your PATH automatically after `eval "$(brew shellenv)"` (or the PATH lines the installer printed). Open a new terminal and run:

```bash
which sqlite3
sqlite3 --version
```

**Note:** Apple’s system `sqlite3` and Homebrew’s can differ by version; both work for opening `utsav.db` and running SQL.

### Linux

**Debian / Ubuntu:**

```bash
sudo apt update
sudo apt install -y sqlite3
sqlite3 --version
```

**Fedora:**

```bash
sudo dnf install sqlite
sqlite3 --version
```

**Arch Linux:**

```bash
sudo pacman -S sqlite
sqlite3 --version
```
