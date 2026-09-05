use serde::{Deserialize, Serialize};
use std::{fs, path::PathBuf, process::Command};
use tauri::{AppHandle, Manager};

const YTDLP_URL: &str = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe";
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Track { id: String, title: String, artist: String, duration: String, source_url: String }
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct DownloadRequest { source_url: String, title: String }

fn ytdlp_path(app: &AppHandle) -> Result<PathBuf, String> { let dir = app.path().app_data_dir().map_err(|e| e.to_string())?.join("tools"); fs::create_dir_all(&dir).map_err(|e| format!("Couldn't create the tools folder: {e}"))?; Ok(dir.join("yt-dlp.exe")) }
fn validate_public_youtube(url: &str) -> Result<(), String> { let permitted = ["https://www.youtube.com/", "https://youtube.com/", "https://youtu.be/"]; if permitted.iter().any(|prefix| url.starts_with(prefix)) { Ok(()) } else { Err("Only public YouTube links are supported.".into()) } }

#[tauri::command]
fn install_ytdlp(app: AppHandle) -> Result<String, String> { let target = ytdlp_path(&app)?; let temp = target.with_extension("download"); let status = Command::new("curl.exe").args(["--fail", "--location", "--silent", "--show-error", "--output", temp.to_string_lossy().as_ref(), YTDLP_URL]).status().map_err(|_| "Couldn't start Windows curl to fetch yt-dlp.".to_string())?; if !status.success() { return Err("Couldn't download yt-dlp. Check your connection and try again.".into()); } fs::rename(&temp, &target).map_err(|e| format!("Couldn't activate yt-dlp: {e}"))?; Ok("yt-dlp is ready".into()) }
#[tauri::command]
fn runtime_status(app: AppHandle) -> serde_json::Value { let ytdlp = ytdlp_path(&app).ok().is_some_and(|path| path.exists()); serde_json::json!({ "desktop": true, "downloader": if ytdlp { "ready" } else { "not-installed" } }) }
#[tauri::command]
fn search_youtube(app: AppHandle, query: String) -> Result<Vec<Track>, String> { let bin = ytdlp_path(&app)?; if !bin.exists() { return Err("Install the free yt-dlp provider in Settings to search YouTube.".into()); } let query = query.trim(); if query.is_empty() { return Ok(vec![]); } let output = Command::new(bin).args(["--dump-single-json", "--flat-playlist", &format!("ytsearch10:{query}")]).output().map_err(|_| "nont couldn't start yt-dlp. Reinstall it from Settings.".to_string())?; if !output.status.success() { return Err("YouTube search didn't complete. Try again shortly.".into()); } let data: serde_json::Value = serde_json::from_slice(&output.stdout).map_err(|_| "Search returned an unreadable result.".to_string())?; Ok(data["entries"].as_array().unwrap_or(&vec![]).iter().filter_map(|entry| { let id = entry["id"].as_str()?.to_string(); Some(Track { source_url: format!("https://www.youtube.com/watch?v={id}"), id, title: entry["title"].as_str().unwrap_or("Untitled").to_string(), artist: entry["channel"].as_str().or(entry["uploader"].as_str()).unwrap_or("YouTube").to_string(), duration: entry["duration_string"].as_str().unwrap_or("—").to_string() }) }).collect()) }
#[tauri::command]
fn resolve_audio(app: AppHandle, source_url: String) -> Result<String, String> { validate_public_youtube(&source_url)?; let bin = ytdlp_path(&app)?; if !bin.exists() { return Err("Install the free yt-dlp provider in Settings first.".into()); } let output = Command::new(bin).args(["--no-playlist", "-f", "bestaudio/best", "-g", &source_url]).output().map_err(|_| "nont couldn't start yt-dlp.".to_string())?; if !output.status.success() { return Err("This public media couldn't be resolved for playback.".into()); } String::from_utf8(output.stdout).map_err(|_| "The audio URL was unreadable.".to_string()).map(|value| value.trim().to_string()) }
#[tauri::command]
fn queue_download(app: AppHandle, request: DownloadRequest) -> Result<(), String> { validate_public_youtube(&request.source_url)?; let bin = ytdlp_path(&app)?; if !bin.exists() { return Err("Install the free yt-dlp provider in Settings first.".into()); } let folder = app.path().download_dir().map_err(|e| e.to_string())?.join("nont"); fs::create_dir_all(&folder).map_err(|e| e.to_string())?; let template = folder.join("%(artist)s - %(title)s.%(ext)s").to_string_lossy().to_string(); let _title = request.title; Command::new(bin).args(["--no-playlist", "-f", "bestaudio/best", "-o", &template, &request.source_url]).spawn().map_err(|_| "Couldn't start the download.".to_string())?; Ok(()) }
fn main() { tauri::Builder::default().invoke_handler(tauri::generate_handler![install_ytdlp, runtime_status, search_youtube, resolve_audio, queue_download]).run(tauri::generate_context!()).expect("error while running nont"); }
