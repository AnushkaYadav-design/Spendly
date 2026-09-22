# Spendly - Personal Finance & Expense Tracker

Spendly is a modern, responsive personal finance and expense tracking Android application built with Kotlin, Jetpack Compose, and an offline-first architecture for college students and personal budgeting.

## Features
- **Wallet + ₹ Branding**: Polished branding with custom adaptive icons and SVG vectors.
- **Income & Expense Tracking**: Categorized financial logging (Food, Canteen, Books, Transport, Fees, Entertainment, Salary, etc.).
- **Automatic Calculations**: Dynamic balance, total income, and total expenses computed locally in real time.
- **Search, Filters & Sorting**: Real-time multi-field search and category filtering.
- **Persistent Local Storage**: Data stored safely on-device with zero external data sharing.

---

## 📱 How to Get the APK on Your Mobile Phone

### Method 1: Download from GitHub Actions (Automated)

1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Spendly"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. Open your repository on GitHub.
3. Click on the **Actions** tab at the top.
4. Click on the latest workflow run: **"Build Android APK"**.
5. Scroll down to the **Artifacts** section at the bottom and click **`Spendly-Debug-APK`**.
6. Extract the downloaded zip file to find `app-debug.apk`.
7. Send the `.apk` file to your Android phone (via Google Drive, WhatsApp, Telegram, or USB).
8. Tap on `app-debug.apk` on your mobile to install (enable *"Install unknown apps"* if prompted).

---

### Method 2: Build APK Locally on Your Computer

If you have Android Studio or the command line installed:
```bash
./gradlew assembleDebug
```
The output APK will be generated at:
`app/build/outputs/apk/debug/app-debug.apk`
