/**
 * 状态徽章组件
 */

import { AppMode } from '../utils/config';

interface StatusBadgeProps {
  mode: AppMode;
}

const MODE_CONFIG = {
  earth: {
    label: '地球模式',
    className: '',
  },
  flying: {
    label: '飞行中...',
    className: 'flying',
  },
  city: {
    label: '城市 3D 模式',
    className: 'city',
  },
  loading: {
    label: '搜索中...',
    className: 'flying',
  },
  error: {
    label: '搜索失败',
    className: 'flying',
  },
};

export default function StatusBadge({ mode }: StatusBadgeProps) {
  const config = MODE_CONFIG[mode] || MODE_CONFIG.earth;

  return (
    <div className="status-badge">
      <div className={`status-dot ${config.className}`} />
      <span className="status-text">{config.label}</span>
    </div>
  );
}
