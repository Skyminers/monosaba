# 包体积优化指南

## 已完成的优化

### 1. Rust 编译优化 (src-tauri/Cargo.toml)
- ✅ `opt-level = "z"` - 体积优先优化
- ✅ `lto = true` - 链接时优化
- ✅ `codegen-units = 1` - 单个代码生成单元
- ✅ `strip = true` - 移除调试符号
- ✅ `panic = "abort"` - 精简 panic 处理

**预期效果**: Rust 二进制减小 40-60%

### 2. 前端构建优化 (vite.config.ts)
- ✅ esbuild 压缩
- ✅ React 代码分割
- ✅ CSS 压缩
- ✅ 小于 4KB 资源内联
- ✅ 资源文件分类组织

**预期效果**: 前端资源减小 20-30%

### 3. Tauri 配置优化 (src-tauri/tauri.conf.json)
- ✅ 移除重复的 assets 打包（避免双重打包）
- ✅ 设置 macOS 最低系统版本

## 进一步优化建议

### 资源文件优化（主要占用 164MB）

当前资源占用分析：
- 字体文件: ~49MB (font1.ttf 19MB + font2.ttf 18MB + font3.ttf 12MB)
- 背景图片: ~100MB+ (多个 2.1MB 的 PNG 文件)

#### 1. 字体优化

**选项 A: 字体子集化（推荐）**
```bash
# 安装 fonttools
pip install fonttools brotli

# 运行优化脚本
./optimize-assets.sh
```
仅保留常用字符，可减少 60-80% 字体大小

**选项 B: 转换为 WOFF2 格式**
WOFF2 比 TTF 小约 30-50%

**选项 C: 按需加载字体**
不将字体打包进应用，改为首次使用时下载

#### 2. 图片优化

**选项 A: PNG 压缩**
```bash
# 安装 pngquant
brew install pngquant

# 运行优化脚本
./optimize-assets.sh
```
可减少 50-70% PNG 大小，视觉质量损失极小

**选项 B: 转换为 WebP 格式**
WebP 比 PNG 小 25-35%

**选项 C: 按需加载资源**
将不常用的背景图改为动态加载，不打包进应用

#### 3. 懒加载策略

修改代码实现资源按需加载：
- 首屏只加载必需资源
- 其他资源在用户切换时动态加载
- 可从外部 CDN 或本地缓存加载

## 当前构建结果

- 二进制文件: 127MB
- .app 包: 275MB
- DMG 安装包: 256MB
- 前端资源: 164MB

## 预期优化效果

如果执行所有建议的资源优化：
- 字体优化后: ~15MB (减少 ~34MB)
- 图片优化后: ~50MB (减少 ~50MB)
- **总包大小预计**: ~170MB (减少约 ~85MB, 33%)

## 下次构建

```bash
# 1. 优化资源（可选）
./optimize-assets.sh

# 2. 清理并重新构建
npm run tauri build
```

## 注意事项

1. 字体子集化会移除未包含的字符，请根据应用实际需求调整字符范围
2. 图片压缩可能会有轻微质量损失，建议先在副本上测试
3. 资源优化是一次性操作，之后新增资源时需要手动优化
