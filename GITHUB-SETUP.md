# Push VELM to GitHub

## 1. Stop the backend (important)

If the backend is running, **stop it** (Ctrl+C in the terminal where you ran `npm run dev` in the `backend` folder).  
Otherwise the database file may be locked and you can get a "file is open in Node.js" error when copying or pushing.

## 2. Create the repository on GitHub

1. Open [https://github.com/new](https://github.com/new).
2. **Repository name:** `VELM` (or e.g. `velm-poc`).
3. Choose **Public**.
4. Do **not** add a README, .gitignore, or license (this project already has them).
5. Click **Create repository**.

## 3. Connect your local folder and push

In a terminal, from the VELM project folder, run (replace `YOUR_USERNAME` with your GitHub username):

```bash
cd c:\Users\thena\OneDrive\Desktop\Cursor\VELM

git remote add origin https://github.com/YOUR_USERNAME/VELM.git
git branch -M main
git push -u origin main
```

If you use SSH:

```bash
git remote add origin git@github.com:YOUR_USERNAME/VELM.git
git branch -M main
git push -u origin main
```

## 4. Optional: set your Git identity

To use your real name and email for commits:

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

For this repo only (without `--global`):

```bash
git config user.name "Your Name"
git config user.email "your-email@example.com"
```
