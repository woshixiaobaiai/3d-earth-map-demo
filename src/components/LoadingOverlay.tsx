/**
 * Loading 遮罩组件
 */

interface LoadingOverlayProps {
  visible: boolean;
  text?: string;
}

export default function LoadingOverlay({ visible, text = '正在定位...' }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
      <p className="loading-text">{text}</p>
    </div>
  );
}
