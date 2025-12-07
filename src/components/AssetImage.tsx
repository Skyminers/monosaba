import { useState, useEffect } from 'react';
import { getAssetUrl } from '../utils/assetLoader';

interface AssetImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

export function AssetImage({ src, alt, className, style }: AssetImageProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    // Load the asset URL asynchronously
    getAssetUrl(src)
      .then((url) => {
        if (!cancelled) {
          setImageSrc(url);
          setError(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load asset:', src, err);
        if (!cancelled) {
          setError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [src]);

  if (error) {
    return (
      <div className={className} style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>
        <span style={{ fontSize: '0.8em', color: '#999' }}>无法加载</span>
      </div>
    );
  }

  if (!imageSrc) {
    return (
      <div className={className} style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>
        <span style={{ fontSize: '0.8em', color: '#999' }}>加载中...</span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      style={style}
      onError={() => setError(true)}
    />
  );
}
