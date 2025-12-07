import { AssetImage } from "./components/AssetImage";
import { useEffect, useState, useRef, useCallback } from 'react';
import { loadConfig } from './utils/configLoader';
import { renderCanvas, downloadCanvasAsImage } from './utils/canvasRenderer';
import { getAssetUrl } from './utils/assetLoader';
import { AppConfig, StretchMode } from './types';
import './App.css';

const STRETCH_MODES: Record<StretchMode, string> = {
  stretch: '撑满画布',
  stretch_x: '横向拉伸',
  stretch_y: '纵向拉伸',
  zoom_x: '水平缩放',
  zoom_y: '垂直缩放',
  original: '原始尺寸',
};

function App() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [selectedChar, setSelectedChar] = useState<string>('');
  const [selectedBg, setSelectedBg] = useState<string>('');
  const [selectedEmotion, setSelectedEmotion] = useState<number>(1);
  const [selectedFont, setSelectedFont] = useState<string>('default');
  const [text, setText] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(128);
  const [enableHighlight, setEnableHighlight] = useState<boolean>(true);
  const [stretchMode, setStretchMode] = useState<StretchMode>('zoom_x');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const charImageRef = useRef<HTMLImageElement | null>(null);
  const uiImageRef = useRef<HTMLImageElement | null>(null);

  // Load configuration on mount
  useEffect(() => {
    setIsLoading(true);
    loadConfig()
      .then((response) => {
        setConfig(response);
        if (response.characters && Object.keys(response.characters).length > 0) {
          const firstChar = Object.keys(response.characters)[0];
          setSelectedChar(firstChar);
        }
        if (response.backgrounds && Object.keys(response.backgrounds).length > 0) {
          setSelectedBg(Object.keys(response.backgrounds)[0]);
        }
        if (response.fonts && Object.keys(response.fonts).length > 0) {
          setSelectedFont(Object.keys(response.fonts)[0]);
        }
      })
      .catch((error) => {
        console.error('Failed to load config:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Load UI image (text box overlay)
  useEffect(() => {
    const loadUiImage = async () => {
      try {
        const url = await getAssetUrl('assets/background/ui.png');
        const uiImg = new Image();
        uiImg.crossOrigin = 'anonymous';
        uiImg.src = url;
        uiImg.onerror = (e) => console.error('Failed to load UI image:', e);
        uiImg.onload = () => {
          console.log('UI image loaded');
          uiImageRef.current = uiImg;
          updateCanvas();
        };
      } catch (error) {
        console.error('Error loading UI image:', error);
      }
    };
    loadUiImage();
  }, []);

  // Load background image when selection changes
  useEffect(() => {
    if (!config || !selectedBg) return;
    const bgInfo = config.backgrounds[selectedBg];
    if (!bgInfo) return;

    const loadBgImage = async () => {
      try {
        const url = await getAssetUrl(`assets/backgrounds/${bgInfo.file}`);
        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        bgImg.src = url;
        bgImg.onerror = (e) => console.error('Failed to load background:', bgInfo.file, e);
        bgImg.onload = () => {
          console.log('Background loaded:', bgInfo.file);
          bgImageRef.current = bgImg;
          updateCanvas();
        };
      } catch (error) {
        console.error('Error loading background:', error);
      }
    };
    loadBgImage();
  }, [config, selectedBg]);

  // Load character image when character or emotion changes
  useEffect(() => {
    if (!config || !selectedChar) return;

    const loadCharImage = async () => {
      try {
        const charPath = `assets/chara/${selectedChar}/${selectedChar} (${selectedEmotion}).png`;
        const url = await getAssetUrl(charPath);
        const charImg = new Image();
        charImg.crossOrigin = 'anonymous';
        charImg.src = url;
        charImg.onerror = (e) => console.error('Failed to load character:', charPath, e);
        charImg.onload = () => {
          console.log('Character loaded:', charPath);
          charImageRef.current = charImg;
          updateCanvas();
        };
      } catch (error) {
        console.error('Error loading character:', error);
      }
    };
    loadCharImage();
  }, [config, selectedChar, selectedEmotion]);

  // Update canvas whenever any parameter changes
  const updateCanvas = useCallback(() => {
    if (!canvasRef.current || !config || !selectedChar) return;

    const currentChar = config.characters[selectedChar];
    if (!currentChar) return;

    const textConfigItems = config.text_configs[selectedChar] || [];
    const characterFont = currentChar.font.replace('.ttf', '');
    const userFont = selectedFont === 'default'
      ? 'sans-serif'
      : config.fonts[selectedFont]?.name || 'sans-serif';

    renderCanvas({
      canvas: canvasRef.current,
      backgroundImage: bgImageRef.current,
      characterImage: charImageRef.current,
      uiImage: uiImageRef.current,
      textConfigItems,
      characterFont,
      userText: text,
      userFontSize: fontSize,
      userFont,
      enableHighlight,
      stretchMode,
    });
  }, [config, selectedChar, selectedFont, text, fontSize, enableHighlight, stretchMode]);

  useEffect(() => {
    updateCanvas();
  }, [updateCanvas]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const timestamp = new Date().getTime();
      downloadCanvasAsImage(canvasRef.current, `魔裁文本框-${timestamp}.png`);
    }
  };

  if (isLoading || !config) {
    return (
      <div className="loading-container">
        <h1>加载中...</h1>
      </div>
    );
  }

  const currentCharacter = config.characters[selectedChar];
  const emotionList = currentCharacter ? Array.from({ length: currentCharacter.emotion_count }, (_, i) => i + 1) : [];

  return (
    <div className="app-container">
      <div className="sidebar">
        <h1 className="app-title">魔裁文本框生成器</h1>

        {/* Character Selection */}
        <div className="control-section">
          <h3 className="section-title">角色选择</h3>
          <div className="character-grid">
            {Object.entries(config.characters).map(([id, char]) => (
              <button
                key={id}
                className={`character-card ${selectedChar === id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedChar(id);
                  setSelectedEmotion(1);
                }}
              >
                                <AssetImage
                  src={`assets/chara/${id}/${id} (1).png`}
                  alt={char.full_name}
                  className="character-avatar"
                 />
                <span className="character-name">{char.full_name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Emotion Selection */}
        {currentCharacter && (
          <div className="control-section">
            <h3 className="section-title">表情选择</h3>
            <div className="emotion-grid">
              {emotionList.map((emotion) => (
                <button
                  key={emotion}
                  className={`emotion-btn ${selectedEmotion === emotion ? 'active' : ''}`}
                  onClick={() => setSelectedEmotion(emotion)}
                >
                  {emotion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Background Selection */}
        <div className="control-section">
          <h3 className="section-title">背景选择</h3>
          <div className="background-grid">
            {Object.entries(config.backgrounds).map(([id, bg]) => (
              <button
                key={id}
                className={`background-card ${selectedBg === id ? 'active' : ''}`}
                onClick={() => setSelectedBg(id)}
              >
                                <AssetImage
                  src={`assets/backgrounds/${bg.file}`}
                  alt={bg.name}
                  className="background-thumb"
                 />
              </button>
            ))}
          </div>
        </div>

        {/* Stretch Mode */}
        <div className="control-section">
          <h3 className="section-title">背景缩放</h3>
          <select
            value={stretchMode}
            onChange={(e) => setStretchMode(e.target.value as StretchMode)}
            className="control-select"
          >
            {Object.entries(STRETCH_MODES).map(([mode, label]) => (
              <option key={mode} value={mode}>{label}</option>
            ))}
          </select>
        </div>

        {/* Font Selection */}
        <div className="control-section">
          <h3 className="section-title">字体选择</h3>
          <select
            value={selectedFont}
            onChange={(e) => setSelectedFont(e.target.value)}
            className="control-select"
          >
            <option value="default">默认字体</option>
            {Object.entries(config.fonts).map(([id, font]) => (
              <option key={id} value={id}>{font.name}</option>
            ))}
          </select>
        </div>

        {/* Font Size */}
        <div className="control-section">
          <h3 className="section-title">字号: {fontSize}px</h3>
          <input
            type="range"
            min="32"
            max="256"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="slider"
           />
        </div>

        {/* Highlight Option */}
        <div className="control-section">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={enableHighlight}
              onChange={(e) => setEnableHighlight(e.target.checked)}
             />
            <span>启用突出显示（【】）</span>
          </label>
        </div>

        {/* Text Input */}
        <div className="control-section">
          <h3 className="section-title">文本内容</h3>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="输入文本内容..."
            className="text-input"
            rows={6}
           />
        </div>

        {/* Download Button */}
        <button onClick={handleDownload} className="download-btn">
          下载图片
        </button>
      </div>

      <div className="preview-area">
        <div className="preview-container">
          <canvas
            ref={canvasRef}
            width={2560}
            height={834}
            className="preview-canvas"
           />
        </div>
      </div>
    </div>
  );
}

export default App;
