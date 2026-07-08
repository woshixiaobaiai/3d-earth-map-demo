/**
 * 百度地图 3D 城市组件
 * 显示真实百度地图 3D 建筑白模视图
 */

import { useEffect, useRef, useState } from 'react';
import { Coordinate } from '../utils/config';

interface Baidu3DMapProps {
  location?: Coordinate | null;
  visible?: boolean;
  onReady?: () => void;
}

export default function Baidu3DMap({ location, visible = false, onReady }: Baidu3DMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const mapReadyRef = useRef(false);
  const prevVisibleRef = useRef(false);

  // 页面加载就初始化百度地图
  useEffect(() => {
    if (!containerRef.current || mapReadyRef.current) return;

    const checkBMap = () => {
      const BMap = (window as any).BMapGL;
      if (!BMap) {
        console.warn('⏳ 等待百度地图 API 加载...');
        setTimeout(checkBMap, 500);
        return;
      }

      try {
        console.log('🗺️ 开始初始化百度地图...');

        // 默认中心点（北京）
        const defaultPoint = new BMap.Point(116.404, 39.915);

        // 创建地图实例
        const map = new BMap.Map(containerRef.current);
        mapRef.current = map;

        // 初始化地图
        map.centerAndZoom(defaultPoint, 18);

        // 启用滚轮缩放
        map.enableScrollWheelZoom(true);

        // 启用拖拽
        map.enableDragging();

        // 设置 3D 倾斜视角
        setTimeout(() => {
          map.setTilt(75);
          map.setHeading(45);
          console.log('✅ 已设置 75° 3D 倾斜视角');
        }, 300);

        mapReadyRef.current = true;
        console.log('✅ 百度地图初始化成功');
        onReady?.();

      } catch (error) {
        console.error('❌ 百度地图初始化失败:', error);
      }
    };

    setTimeout(checkBMap, 100);

    return () => {
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  }, [onReady]);

  // ✅ 关键修复：监听 visible 变化，当从 false -> true 时强制重新定位
  useEffect(() => {
    // 只有当 visible 从 false 变为 true，且有 location 时才执行
    if (!prevVisibleRef.current && visible && location && mapRef.current) {
      console.log('🎯 地图显示，立即定位到:', location.name);

      // ✅ 关键：强制地图刷新尺寸（百度地图隐藏后再显示常见问题）
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.resize();
          console.log('🔧 地图尺寸已刷新');
        }
      }, 0);

      performLocation(location);
    }
    prevVisibleRef.current = visible;
  }, [visible, location]);

  // ✅ visible=true 时强制设置 3D 视角（多次重试确保生效）
  useEffect(() => {
    if (visible && mapRef.current) {
      // 强制设置 3D 视角（5 次重试确保生效）
      [0, 100, 200, 400, 600].forEach((delay) => {
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.setTilt(75);
            mapRef.current.setHeading(45);
            console.log(`📍 ${delay}ms 后设置 75° 3D 视角`);
          }
        }, delay);
      });
    }
  }, [visible]);

  // 执行定位
  const performLocation = (loc: Coordinate) => {
    const BMap = (window as any).BMapGL;
    if (!BMap || !mapRef.current) return;

    try {
      const point = new BMap.Point(loc.lng, loc.lat);

      console.log('📍 执行定位:', loc.name, loc.lng, loc.lat);

      // 清除旧标记
      mapRef.current.clearOverlays();

      // ✅ 多次定位确保生效（不同时间点）
      const doLocate = (delay: number, zoom: number) => {
        setTimeout(() => {
          if (!mapRef.current) return;
          mapRef.current.centerAndZoom(point, zoom);
          mapRef.current.setTilt(75);
          mapRef.current.setHeading(45);
          console.log(`📍 ${delay}ms 后定位，缩放: ${zoom}`);
        }, delay);
      };

      // 立即执行 + 多次重试
      doLocate(0, 18);
      doLocate(50, 18);
      doLocate(150, 18);
      doLocate(300, 18);
      doLocate(500, 18);

      // ✅ 额外的 panTo 方式
      setTimeout(() => {
        if (!mapRef.current) return;
        mapRef.current.panTo(point);
        console.log('📍 panTo 定位');
      }, 100);

      setTimeout(() => {
        if (!mapRef.current) return;
        mapRef.current.panTo(point);
        console.log('📍 再次 panTo');
      }, 200);

      // 添加标记
      setTimeout(() => {
        if (!mapRef.current) return;
        const marker = new BMap.Marker(point);
        markerRef.current = marker;
        mapRef.current.addOverlay(marker);
        console.log('📍 已添加定位标记');
      }, 350);

    } catch (error) {
      console.error('❌ 定位失败:', error);
    }
  };

  // location 变化时也重新定位（如果当前可见）
  useEffect(() => {
    if (visible && location && mapRef.current) {
      console.log('📍 位置变化，重新定位:', location.name);
      performLocation(location);
    }
  }, [location, visible]);

  // 百度地图始终渲染，只通过 CSS 控制可见性
  return (
    <div
      ref={containerRef}
      className={`baidu-map-container ${visible ? 'visible' : ''}`}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
