mod settings;
mod sync;

#[cfg_attr(mobile, tauri_mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            settings::get_setting,
            settings::set_setting,
            settings::validate_token,
            sync::sync_from_sp,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
