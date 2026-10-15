# Install the UI update on your Mac

This update changes the frontend. It does not connect to Bloom or submit real applications. Your existing Python environment, API configuration and synthetic application database can stay in place.

## Recommended: frontend update archive

1. Download `Bloom_Rescue_UI_Update.zip` into Downloads.
2. Stop only the frontend development server with Control+C in its terminal.
3. From Terminal run:

```bash
unzip -o "$HOME/Downloads/Bloom_Rescue_UI_Update.zip" -d "/Users/anu/Documents/projects/bloom-rescue"
cd /Users/anu/Documents/projects/bloom-rescue/frontend
npm run build
npm run dev
```

The archive contains frontend source, index.html and this guide; extraction overwrites those files, without replacing node_modules, backend code, credentials or the database. If the download has a different filename, use that actual name in the command.

4. Keep the backend running on port 8000. Open http://127.0.0.1:5173 and refresh. This revision has a **Dark/Light** button, clearer next actions and a wider evidence/review layout. If you downloaded an earlier update, replace that download or use the actual new filename in the unzip command.
5. No new API key is required. Deterministic and API modes retain their existing meanings. If everything is already submitted, existing persistent state is expected; use the previously documented synthetic-database reset only after stopping the backend if you need a fresh demo.

## Full source option

`Bloom_Rescue_Source.zip` contains the complete updated project and reports. Extract to a separate directory if you want to preserve the current installation, then follow BUILD_AND_RUN.md. Do not copy your .venv or node_modules between different operating systems.

## Quick checks

Open a queue item using the keyboard. Generate/review a draft and verify approval is separate from submission. Enable Reduce Motion in macOS Accessibility settings and confirm the workflow remains clear without animated movement. Test a narrow window for reflow. Existing mock receipts, consent and uncertainty behavior must remain intact.

Try editing an unapproved answer, switching applications, then returning: the text stays available in this page session. Refreshing clears unapproved session edits and restores the server draft. Only the theme preference is stored locally; answer text is not written to browser storage. The selected application can be restored from its allowlisted URL ID, including Back/Forward navigation.

The new visual treatment is a design hypothesis, not evidence of better conversion or general accessibility conformance. UI review and measured results accompany the full source package.
