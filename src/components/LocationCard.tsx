/**
 * 地点信息卡片组件
 */

import { Coordinate } from '../utils/config';

interface LocationCardProps {
  location: Coordinate;
  onReturnToEarth: () => void;
  onNewSearch: () => void;
}

export default function LocationCard({
  location,
  onReturnToEarth,
  onNewSearch,
}: LocationCardProps) {
  return (
    <div className="location-card">
      <div className="location-card-header">
        <h3 className="location-card-title">{location.name || '目标地点'}</h3>
        <p className="location-card-address">{location.address || '已定位'}</p>
      </div>

      <div className="location-card-info">
        <div className="info-item">
          <span className="info-label">经度</span>
          <span className="info-value">{location.lng.toFixed(6)}</span>
        </div>
        <div className="info-item">
          <span className="info-label">纬度</span>
          <span className="info-value">{location.lat.toFixed(6)}</span>
        </div>
        <div className="info-item">
          <span className="info-label">视角模式</span>
          <span className="info-value">城市 3D</span>
        </div>
        <div className="info-item">
          <span className="info-label">地图级别</span>
          <span className="info-value">18</span>
        </div>
      </div>

      <div className="location-card-actions">
        <button type="button" className="action-button" onClick={onNewSearch}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
          重新搜索
        </button>
        <button type="button" className="action-button primary" onClick={onReturnToEarth}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2v20M2 12h20" />
          </svg>
          返回地球
        </button>
      </div>
    </div>
  );
}
