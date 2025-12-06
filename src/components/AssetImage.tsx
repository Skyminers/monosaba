import { useState, useEffect } from 'react';

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
    setImageSrc(`/${src}`);
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
