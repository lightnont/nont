use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct DownloadRequest { source_url: String, title: String }

/// The UI only sends typed data. The eventual scheduler owns yt-dlp/FFmpeg process
/// arguments and must validate URLs and destination paths before spawning anything.
#[tauri::command]
fn queue_download(request: DownloadRequest) -> Result<(), String> {
    let allowed = ["https://www.youtube.com/", "https://youtu.be/"];
    if !allowed.iter().any(|prefix| request.source_url.starts_with(prefix)) {
        return Err("Only supported public media URLs can be queued.".into());
    }
    Ok(())
}

#[tauri::command]
fn runtime_status() -> serde_json::Value {
    serde_json::json!({ "desktop": true, "downloader": "not-installed", "ffmpeg": "not-installed" })
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![queue_download, runtime_status])
        .run(tauri::generate_context!())
        .expect("error while running nont");
}
