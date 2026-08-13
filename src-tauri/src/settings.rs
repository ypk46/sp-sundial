use serde_json::Value;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreExt;

const STORE_FILE: &str = "settings.json";
const SP_API_BASE: &str = "http://127.0.0.1:3876";

fn store_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("Could not resolve config dir: {e}"))?;
    Ok(dir.join(STORE_FILE))
}

#[cfg(unix)]
fn lock_down_perms(path: &PathBuf) {
    use std::os::unix::fs::PermissionsExt;
    let _ = std::fs::set_permissions(path, std::fs::Permissions::from_mode(0o600));
}

#[cfg(not(unix))]
fn lock_down_perms(_path: &PathBuf) {}

#[tauri::command]
pub fn get_setting(app: AppHandle, key: String) -> Result<Value, String> {
    let store = app.store(STORE_FILE).map_err(|e| e.to_string())?;
    Ok(store.get(&key).unwrap_or(Value::Null))
}

#[tauri::command]
pub fn set_setting(app: AppHandle, key: String, value: Value) -> Result<(), String> {
    let store = app.store(STORE_FILE).map_err(|e| e.to_string())?;
    store.set(key, value);
    store.save().map_err(|e| e.to_string())?;
    let path = store_path(&app)?;
    lock_down_perms(&path);
    Ok(())
}

#[tauri::command]
pub async fn validate_token(token: String) -> Result<(), String> {
    if token.trim().is_empty() {
        return Err("Token is empty".to_string());
    }

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(5))
        .build()
        .map_err(|e| format!("Failed to build HTTP client: {e}"))?;

    // /health does not require auth; verifies the SP app + REST API are up.
    let health = client
        .get(format!("{SP_API_BASE}/health"))
        .send()
        .await
        .map_err(|_| {
            "Super Productivity API not reachable at 127.0.0.1:3876. Is the desktop app running with the local REST API enabled?".to_string()
        })?;
    if !health.status().is_success() {
        return Err(format!("/health returned HTTP {}", health.status()));
    }

    // /tasks requires a valid bearer token; verifies the token itself.
    let tasks = client
        .get(format!("{SP_API_BASE}/tasks?source=all&includeDone=true"))
        .bearer_auth(&token)
        .send()
        .await
        .map_err(|e| format!("Request to /tasks failed: {e}"))?;

    if tasks.status() == reqwest::StatusCode::UNAUTHORIZED {
        return Err("Invalid API token".to_string());
    }
    if !tasks.status().is_success() {
        return Err(format!("/tasks returned HTTP {}", tasks.status()));
    }

    Ok(())
}
