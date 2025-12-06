use tauri::Manager;

mod config;

use config::AppConfig;

// --- Tauri Commands ---

#[tauri::command]
fn get_initial_data(state: tauri::State<'_, AppConfig>) -> &AppConfig {
    state.inner()
}

// --- Main App Setup ---

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            println!("--- App setup starting ---");
            let handle = app.handle();
            let resource_path = handle.path().resource_dir()
                .expect("failed to resolve resource directory");

            println!("Resolved resource path: {:?}", resource_path);

            let config = config::load(handle).map_err(|e| {
                println!("Error loading config: {}", e);
                e
            })?;

            println!("--- Config loaded successfully ---");
            println!("Loaded {} characters", config.characters.len());
            println!("Loaded {} backgrounds", config.backgrounds.len());
            println!("Loaded {} fonts", config.fonts.len());

            app.manage(config);
            println!("--- App setup finished ---");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_initial_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
