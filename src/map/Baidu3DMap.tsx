/**
 * 百度地图 3D 城市组件
 * 当百度地图不可用时，显示模拟的城市 3D 视图
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { Coordinate, APP_CONFIG } from '../utils/config';

interface Baidu3DMapProps {
  location?: Coordinate | null;
  visible?: boolean;
  onReady?: () => void;
}

export default function Baidu3DMap({ location, visible = false, onReady }: Baidu3DMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  // 根据城市名称生成不同的城市特征色
  const getCityColor = (name?: string) => {
    const cityColors: Record<string, string> = {
      '北京': '#4a90e2',
      '上海市': '#6366f1',
      '深圳': '#10b981',
      '广州': '#f59e0b',
      '杭州': '#8b5cf6',
      '成都': '#ef4444',
      '西安': '#d97706',
    };
    return cityColors[name || ''] || '#4a90e2';
  };

  // 初始化
  useEffect(() => {
    if (visible && !isReady) {
      console.log('✅ 3D 城市视图已就绪');
      setIsReady(true);
      onReady?.();
    }
  }, [visible, isReady, onReady]);

  if (!visible) return null;

  const cityColor = getCityColor(location?.name);

  return (
    <div
      ref={containerRef}
      className="baidu-map-container visible"
      style={{ width: '100%', height: '100%' }}
    >
      {/* 城市 3D 模拟视图 */}
      <div className="fallback-city-view">
        {/* 视图标题 */}
        <div className="view-mode-badge">
          <span className="mode-icon">🏙️</span>
          <span className="mode-text">3D 城市视图</span>
        </div>

        {/* 城市建筑群 */}
        <div className="city-buildings-container">
          {/* 主塔楼 */}
          <div className="main-tower" style={{ '--color': cityColor } as React.CSSProperties}>
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="tower-floor">
                <div className="floor-window w1" />
                <div className="floor-window w2" />
                <div className="floor-window w3" />
                <div className="floor-window w4" />
              </div>
            ))}
          </div>

          {/* 周边建筑 */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`surrounding-building building-${i + 1}`}
              style={{
                '--height': `${80 + (i % 4) * 40}px`,
                '--color': `${cityColor}cc`,
              } as React.CSSProperties}
            />
          ))}

          {/* 道路网格 */}
          <div className="city-roads-3d">
            <div className="road-h road-1" />
            <div className="road-h road-2" />
            <div className="road-v road-1" />
            <div className="road-v road-2" />
          </div>

          {/* 中心定位标记 */}
          <div className="location-marker-center">
            <div className="marker-pin" />
            <div className="marker-ring-anim" />
            <div className="marker-ring-anim delay-1" />
            <div className="marker-ring-anim delay-2" />
          </div>
        </div>

        {/* 地点信息 */}
        {location && (
          <div className="location-info-bottom">
            <div className="loc-name">{location.name || '目标地点'}</div>
            <div className="loc-coords">
              {location.lng.toFixed(4)}, {location.lat.toFixed(4)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
