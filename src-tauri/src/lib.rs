use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            // Log the app data directory path for debugging
            if let Ok(dir) = app.path().app_data_dir() {
                let _db_path = dir.join("proyect-ui.db");
                #[cfg(debug_assertions)]
                println!("[Proyect-UI] App data dir: {:?}", _db_path);
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
