// Android loads Tauri through this library target. The React interface is shared
// with the desktop build; Android-specific media-provider commands are the next
// platform implementation step because Windows yt-dlp.exe cannot execute on Android.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running nont");
}
