# nont

Purple-on-black, local-first music app built with React, Vite, and Tauri.

## GitHub-ready

This folder is ready to push as a GitHub repository. It includes the complete web app, Tauri desktop code, Android build files, Vercel configuration, and a `.gitignore` that excludes build artefacts and private Android signing credentials.

Do **not** commit `src-tauri/gen/android/nont-light.jks` or `src-tauri/gen/android/keystore.properties`. Keep both files private and backed up; they are required to publish signed Android updates by **light**.

```bat
cd /d "path\to\nont"
git add .
git commit -m "Initial nont release"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/nont.git
git push -u origin main
```

If the folder is not already a Git repository, run `git init` once before `git add .`.

## Deploy the website to Vercel

1. Push this folder to GitHub.
2. In Vercel, select **Add New → Project** and import the `nont` repository.
3. Leave the detected Vite settings unchanged, then choose **Deploy**.

`vercel.json` runs `npm run build` and deploys `dist` automatically.

The public website is an interactive product demo: its search opens public YouTube results in a new tab. Local audio playback, downloads, yt-dlp installation, and file management require the Windows nont desktop app; they are intentionally unavailable on a hosted website.

## Run locally

```bat
npm.cmd install
npm.cmd run dev
```

## Build

```bat
npm.cmd run build
```

## Desktop and Android

- `start.bat` starts the desktop development app.
- `build-exe.bat` builds the Windows executable.
- `build-apk.bat` builds an Android debug APK.
- `build-signed-apk.bat` builds a signed Android release APK with the **light** signing certificate.
