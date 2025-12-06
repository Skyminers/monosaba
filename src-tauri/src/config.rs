use anyhow::Result;
use serde::Deserialize;
use std::collections::HashMap;
use tauri::{AppHandle, Manager};

#[derive(Debug, Deserialize, Clone, serde::Serialize)]
pub struct CharacterMeta {
    pub full_name: String,
    pub emotion_count: u32,
    pub font: String,
}

#[derive(Debug, Deserialize, Clone, serde::Serialize)]
pub struct BackgroundVariant {
    pub name: String,
    pub file: String,
}

#[derive(Debug, Deserialize, Clone, serde::Serialize)]
pub struct Background {
    pub name: String,
    pub file: String,
    #[serde(default)]
    pub variants: HashMap<String, BackgroundVariant>,
}

#[derive(Debug, Deserialize, Clone, serde::Serialize)]
pub struct Font {
    pub name: String,
    pub file: String,
}

#[derive(Debug, Deserialize, Clone, serde::Serialize)]
pub struct TextConfigItem {
    pub text: String,
    pub position: [i32; 2],
    pub font_color: [u8; 3],
    pub font_size: f32,
}

#[derive(Debug, Deserialize)]
struct MahoshojoRoot {
    mahoshojo: HashMap<String, CharacterMeta>,
}

#[derive(Debug, Deserialize)]
struct BackgroundsRoot {
    backgrounds: HashMap<String, Background>,
}

#[derive(Debug, Deserialize)]
struct FontsRoot {
    fonts: HashMap<String, Font>,
}

#[derive(Debug, Deserialize)]
struct TextConfigsRoot {
    text_configs: HashMap<String, Vec<TextConfigItem>>,
}

// The main struct to hold all configuration
#[derive(Debug, serde::Serialize, Clone)]
pub struct AppConfig {
    pub characters: HashMap<String, CharacterMeta>,
    pub backgrounds: HashMap<String, Background>,
    pub fonts: HashMap<String, Font>,
    pub text_configs: HashMap<String, Vec<TextConfigItem>>,
}

pub fn load(app_handle: &AppHandle) -> Result<AppConfig> {
    let resource_path = app_handle.path().resource_dir()?;

    let chara_path = resource_path.join("config/chara_meta.yml");
    let backgrounds_path = resource_path.join("config/backgrounds.yml");
    let fonts_path = resource_path.join("config/fonts.yml");
    let text_configs_path = resource_path.join("config/text_configs.yml");

    let chara_content = std::fs::read_to_string(chara_path)?;
    let backgrounds_content = std::fs::read_to_string(backgrounds_path)?;
    let fonts_content = std::fs::read_to_string(fonts_path)?;
    let text_configs_content = std::fs::read_to_string(text_configs_path)?;

    let characters: MahoshojoRoot = serde_yaml::from_str(&chara_content)?;
    let backgrounds: BackgroundsRoot = serde_yaml::from_str(&backgrounds_content)?;
    let fonts: FontsRoot = serde_yaml::from_str(&fonts_content)?;
    let text_configs: TextConfigsRoot = serde_yaml::from_str(&text_configs_content)?;

    Ok(AppConfig {
        characters: characters.mahoshojo,
        backgrounds: backgrounds.backgrounds,
        fonts: fonts.fonts,
        text_configs: text_configs.text_configs,
    })
}
