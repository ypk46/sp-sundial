use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

const SP_API_BASE: &str = "http://127.0.0.1:3876";
const STORE_FILE: &str = "settings.json";
const TOKEN_KEY: &str = "api_token";

#[derive(Debug, Serialize, Deserialize)]
pub struct SyncResult {
    pub tasks_synced: u32,
    pub projects_synced: u32,
    pub tags_synced: u32,
    pub last_synced_at: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SyncError {
    pub code: String,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SyncPayload {
    pub result: SyncResult,
    pub tasks: Value,
    pub projects: Value,
    pub tags: Value,
}

/// Extracts the `data` array from the SP API response envelope `{ ok, data }`.
/// Returns the unwrapped data value, or a SyncError if the envelope indicates failure.
fn unwrap_envelope(value: Value, error_code: &str, error_label: &str) -> Result<Value, SyncError> {
    let ok = value.get("ok").and_then(|v| v.as_bool()).unwrap_or(false);
    if !ok {
        let message = value
            .get("error")
            .and_then(|e| e.get("message"))
            .and_then(|m| m.as_str())
            .unwrap_or("Unknown API error")
            .to_string();
        return Err(SyncError {
            code: error_code.to_string(),
            message: format!("{}: {}", error_label, message),
        });
    }
    Ok(value.get("data").cloned().unwrap_or(Value::Array(vec![])))
}

/// Reads the API token from the Tauri store (same store as settings.rs).
fn read_token(app: &AppHandle) -> Result<String, SyncError> {
    let store = app.store(STORE_FILE).map_err(|e| SyncError {
        code: "STORE_ACCESS_FAILED".into(),
        message: e.to_string(),
    })?;
    let token = store
        .get(TOKEN_KEY)
        .and_then(|v| v.as_str().map(|s| s.to_string()))
        .ok_or_else(|| SyncError {
            code: "TOKEN_NOT_FOUND".into(),
            message: "No API token found. Please re-enter your token.".into(),
        })?;
    Ok(token)
}

/// Checks if the Super Productivity API is running.
async fn check_health(client: &reqwest::Client) -> Result<(), SyncError> {
    let res = client
        .get(format!("{}/health", SP_API_BASE))
        .send()
        .await
        .map_err(|_| SyncError {
            code: "API_NOT_RUNNING".into(),
            message: "Super Productivity API not reachable at 127.0.0.1:3876. Is the desktop app running with the local REST API enabled?".into(),
        })?;

    if !res.status().is_success() {
        return Err(SyncError {
            code: "API_NOT_RUNNING".into(),
            message: format!("Health check failed: HTTP {}", res.status()),
        });
    }
    Ok(())
}

#[tauri::command]
pub async fn sync_from_sp(app: AppHandle) -> Result<SyncPayload, SyncError> {
    let token = read_token(&app)?;

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(15))
        .build()
        .map_err(|e| SyncError {
            code: "CLIENT_BUILD_FAILED".into(),
            message: e.to_string(),
        })?;

    check_health(&client).await?;

    let auth_header = format!("Bearer {}", token);

    let (tasks_res, projects_res, tags_res) = tokio::join!(
        client
            .get(format!("{}/tasks?source=all&includeDone=true", SP_API_BASE))
            .header("Authorization", &auth_header)
            .send(),
        client
            .get(format!("{}/projects", SP_API_BASE))
            .header("Authorization", &auth_header)
            .send(),
        client
            .get(format!("{}/tags", SP_API_BASE))
            .header("Authorization", &auth_header)
            .send(),
    );

    let tasks_body: Value = tasks_res
        .map_err(|e| SyncError {
            code: "TASKS_FETCH_FAILED".into(),
            message: e.to_string(),
        })?
        .json()
        .await
        .map_err(|e| SyncError {
            code: "TASKS_PARSE_FAILED".into(),
            message: e.to_string(),
        })?;

    let projects_body: Value = projects_res
        .map_err(|e| SyncError {
            code: "PROJECTS_FETCH_FAILED".into(),
            message: e.to_string(),
        })?
        .json()
        .await
        .map_err(|e| SyncError {
            code: "PROJECTS_PARSE_FAILED".into(),
            message: e.to_string(),
        })?;

    // Tags may fail without breaking the sync (optional)
    let tags_body: Value = match tags_res {
        Ok(res) => res
            .json()
            .await
            .unwrap_or(serde_json::json!({ "ok": true, "data": [] })),
        Err(_) => serde_json::json!({ "ok": true, "data": [] }),
    };

    let tasks = unwrap_envelope(tasks_body, "TASKS_API_ERROR", "Tasks fetch error")?;
    let projects = unwrap_envelope(projects_body, "PROJECTS_API_ERROR", "Projects fetch error")?;
    let tags = unwrap_envelope(tags_body, "TAGS_API_ERROR", "Tags fetch error")?;

    let tasks_count = tasks.as_array().map(|a| a.len() as u32).unwrap_or(0);
    let projects_count = projects.as_array().map(|a| a.len() as u32).unwrap_or(0);
    let tags_count = tags.as_array().map(|a| a.len() as u32).unwrap_or(0);

    let result = SyncResult {
        tasks_synced: tasks_count,
        projects_synced: projects_count,
        tags_synced: tags_count,
        last_synced_at: SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_millis() as i64)
            .unwrap_or(0),
    };

    Ok(SyncPayload {
        result,
        tasks,
        projects,
        tags,
    })
}
