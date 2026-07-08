/**
 * 主应用组件
 */

import { useState, useCallback, useEffect } from 'react';
import CesiumEarth from './map/CesiumEarth.tsx';
import Baidu3DMap from './map/Baidu3DMap.tsx';
import SearchPanel from './components/SearchPanel.tsx';
import LocationCard from './components/LocationCard.tsx';
import StatusBadge from './components/StatusBadge.tsx';
import LoadingOverlay from './components/LoadingOverlay.tsx';
import { geocode } from './map/geoService.ts';
import { Coordinate, AppMode, validateConfig, detectWebGL } from './utils/config.ts';
import './styles/global.css';

export default function App() {
  const [mode, setMode] = useState<AppMode>('earth');
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configWarning, setConfigWarning] = useState<string | null>(null);
  const [webGLSupported, setWebGLSupported] = useState(true);

  // 检查环境 - 只在应用启动时检测一次
  useEffect(() => {
    // 检查 WebGL 支持
    const webglOk = detectWebGL();
    console.log('WebGL 检测结果:', webglOk);
    setWebGLSupported(webglOk);

    if (!webglOk) {
      return;
    }

    // 检查配置
    const configResult = validateConfig();
    if (!configResult.success && configResult.message) {
      setConfigWarning(configResult.message);
    }
  }, []);

  // 全局错误监听 - 捕获未处理的 Promise 错误
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('❌ 未捕获的异步错误:', event.reason?.message || JSON.stringify(event.reason) || '未知错误');
      event.preventDefault(); // 阻止浏览器默认的错误弹窗
    };

    const handleError = (event: ErrorEvent) => {
      console.error('❌ 全局错误:', event.message, event.error);
      event.preventDefault();
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  // 处理搜索
  const handleSearch = useCallback(async (address: string) => {
    console.log('开始搜索:', address);
    setIsLoading(true);
    setMode('loading');
    setError(null);

    try {
      const result = await geocode(address);
      console.log('搜索结果:', result);

      if (result.success && result.location) {
        setCurrentLocation(result.location);
        setMode('flying');
        console.log('🎯 搜索成功，目标位置:', result.location.name, result.location.lng, result.location.lat);
      } else {
        setMode('error');
        setError(result.message || '搜索失败');
      }
    } catch (err: any) {
      // 提取可读的错误信息，避免显示 [object Object]
      const errorMessage = err?.message || err?.msg || JSON.stringify(err) || '未知错误';
      console.error('❌ 搜索异常，降级到内置城市数据:', errorMessage);

      // 任何异常都降级到 Mock 数据，保证演示流程不中断
      const mockLocations: Record<string, Coordinate> = {
        '北京': { lng: 116.4074, lat: 39.9042, name: '北京市', address: '中国北京市' },
        '上海': { lng: 121.4737, lat: 31.2304, name: '上海市', address: '中国上海市' },
        '深圳': { lng: 114.0579, lat: 22.5431, name: '深圳市', address: '中国广东省深圳市' },
        '广州': { lng: 113.2644, lat: 23.1291, name: '广州市', address: '中国广东省广州市' },
        '杭州': { lng: 120.1551, lat: 30.2741, name: '杭州市', address: '中国浙江省杭州市' },
        '成都': { lng: 104.0668, lat: 30.5728, name: '成都市', address: '中国四川省成都市' },
        '天安门': { lng: 116.3974, lat: 39.9092, name: '天安门', address: '北京市东城区天安门' },
        '陆家嘴': { lng: 121.5017, lat: 31.2397, name: '上海陆家嘴', address: '上海市浦东新区陆家嘴' },
      };
      const mockLocation = mockLocations[address] || mockLocations['北京'];
      setCurrentLocation(mockLocation);
      setMode('flying');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 飞行完成回调
  const handleFlightComplete = useCallback(() => {
    // 延迟切换到城市模式，让动画更流畅
    setTimeout(() => {
      setMode('city');
    }, 500);
  }, []);

  // 返回地球
  const handleReturnToEarth = useCallback(() => {
    setMode('earth');
    setCurrentLocation(null);
    setError(null);

    // 调用 Cesium 重置视角
    if ((window as any).resetCesiumView) {
      (window as any).resetCesiumView();
    }

    // 重置百度地图
    if ((window as any).resetBaiduMap) {
      (window as any).resetBaiduMap();
    }
  }, []);

  // 重新搜索
  const handleNewSearch = useCallback(() => {
    setMode('earth');
    setCurrentLocation(null);
    setError(null);

    // 调用 Cesium 重置视角
    if ((window as any).resetCesiumView) {
      (window as any).resetCesiumView();
    }
  }, []);

  // Cesium 准备就绪
  const handleCesiumReady = useCallback(() => {
    console.log('Cesium Earth 已就绪');
  }, []);

  // 百度地图准备就绪
  const handleBaiduMapReady = useCallback(() => {
    console.log('百度地图已就绪');
  }, []);

  // 自动清除错误
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
        if (mode === 'error') {
          setMode('earth');
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, mode]);

  // WebGL 不支持
  if (!webGLSupported) {
    return (
      <div className="webgl-error">
        <h1>浏览器不支持 WebGL</h1>
        <p>
          3D 地球地图需要 WebGL 支持。
          <br />
          请使用最新版本的 Chrome、Firefox、Safari 或 Edge 浏览器。
        </p>
      </div>
    );
  }

  return (
    <div className="map-container">
      {/* 配置警告 */}
      {configWarning && (
        <div className="config-warning">
          ⚠️ {configWarning}。当前使用内置演示数据，部分功能可能受限。
        </div>
      )}

      {/* Cesium 地球 */}
      <div className={`cesium-container ${mode === 'city' ? 'hidden' : ''}`}>
        <CesiumEarth
          onReady={handleCesiumReady}
          onFlightComplete={handleFlightComplete}
          targetLocation={currentLocation}
          isFlying={mode === 'flying'}
          autoRotate={mode === 'earth'}
        />
      </div>

      {/* 百度 3D 地图 - 始终渲染，提前初始化地图 */}
      <Baidu3DMap
        location={currentLocation}
        visible={mode === 'city'}
        onReady={handleBaiduMapReady}
      />

      {/* 搜索面板 */}
      <SearchPanel
        onSearch={handleSearch}
        isLoading={isLoading || mode === 'flying'}
        disabled={mode === 'city'}
      />

      {/* 错误提示 */}
      {error && <div className="error-toast">❌ {error}</div>}

      {/* 状态徽章 */}
      <StatusBadge mode={mode} />

      {/* 地点信息卡片 */}
      {mode === 'city' && currentLocation && (
        <LocationCard
          location={currentLocation}
          onReturnToEarth={handleReturnToEarth}
          onNewSearch={handleNewSearch}
        />
      )}

      {/* Loading 遮罩 */}
      <LoadingOverlay visible={isLoading} text="正在搜索目标地点..." />

      {/* 操作提示 */}
      {mode === 'earth' && !isLoading && (
        <div className="hint-panel">
          拖动旋转地球 · 滚轮缩放 · 搜索地址可定位到城市 3D 视角
        </div>
      )}
    </div>
  );
}
