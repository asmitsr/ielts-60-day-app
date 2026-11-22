# IELTS 60-Day — Android app (WebView wrapper)

Minimal native wrapper around the live web app at
https://ielts-60-day-app.pages.dev. All study content, progress, and
accounts live on the server — this APK just opens the site in a WebView
(no cache, so it always shows the latest version).

- Package: `com.asmitsr.ielts60day`
- Single activity, Kotlin, no dependencies (plain Android SDK + stdlib)
- Only permission: INTERNET
- Icon: Midnight Navy background + Champagne Gold checkmark (do not change
  without asking — the user chose these colours deliberately)

## Building

GitHub Actions builds the debug APK on every push to `main` that touches
`android/` (see `.github/workflows/build-apk.yml`): JDK 17 + Gradle 8.7,
`gradle assembleDebug`. The APK is the `ielts-60day-apk` artifact on the
Actions run. CI uses the `gradle` command via `gradle/actions/setup-gradle`
— the Gradle wrapper jar is deliberately not in the repo.

Local builds use the offline recipe in the workspace (Gradle 8.7, local
Maven repo); the debug keystore backup lives outside this repo and must
never be committed.
