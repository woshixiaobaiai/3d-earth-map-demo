/**
 * Cesium 3D 地球组件
 * 包含完整错误处理和降级方案
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import * as Cesium from 'cesium';
import { Coordinate, APP_CONFIG } from '../utils/config';

interface CesiumEarthProps {
  onReady?: () => void;
  onFlightComplete?: () => void;
  targetLocation?: Coordinate | null;
  isFlying?: boolean;
  autoRotate?: boolean;
}

export default function CesiumEarth({
  onReady,
  onFlightComplete,
  targetLocation,
  isFlying = false,
  autoRotate = true,
}: CesiumEarthProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const entityRef = useRef<Cesium.Entity | null>(null);
  const rotationIntervalRef = useRef<number | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // 坐标转换：百度坐标系 -> WGS84
  const bd09ToWgs84 = useCallback((lng: number, lat: number): [number, number] => {
    const x = lng - 0.0065;
    const y = lat - 0.006;
    const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * Math.PI);
    const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * Math.PI);
    return [z * Math.cos(theta), z * Math.sin(theta)];
  }, []);

  // 初始化地球
  const initViewer = useCallback(() => {
    if (!containerRef.current || viewerRef.current) return;

    console.log('🚀 开始初始化 Cesium 地球...');

    try {
      // 先检查 WebGL 支持
      if (!window.WebGLRenderingContext) {
        throw new Error('浏览器不支持 WebGL');
      }

      // 最简配置 - 最大化兼容性
      const viewer = new Cesium.Viewer(containerRef.current, {
        animation: false,
        timeline: false,
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        fullscreenButton: false,
        vrButton: false,
        infoBox: false,
        selectionIndicator: false,
        scene3DOnly: true,
        // 使用 OpenStreetMap 影像（稳定、无跨域问题）
        imageryProvider: new Cesium.OpenStreetMapImageryProvider({
          url: 'https://a.tile.openstreetmap.org/',
        }),
        // 禁用地形，减少 WebGL 压力
        terrainProvider: undefined,
        // WebGL 1 优先，最大化兼容性
        contextOptions: {
          webgl: {
            alpha: false,
            depth: true,
            stencil: false,
            antialias: false,
            premultipliedAlpha: true,
            preserveDrawingBuffer: false,
            failIfMajorPerformanceCaveat: false,
          },
          requestWebgl2: false,
        },
      });

      // 隐藏 Cesium Logo 和版权信息
      try {
        viewer.scene.frameState.context.creditContainer.style.display = 'none';
      } catch (e) {
        // 静默失败
      }

      // 基本配置
      const scene = viewer.scene;
      const globe = scene.globe;

      // 禁用所有高级效果，确保稳定性
      globe.enableLighting = false;
      globe.dynamicAtmosphereLighting = false;

      // 深色背景
      scene.backgroundColor = Cesium.Color.fromCssColorString('#0a0a1a');

      // 禁用深度测试穿透
      globe.depthTestAgainstTerrain = false;

      // 禁用地面半透明
      globe.translucency.enabled = false;

      // 禁用天空盒（如果有问题）
      try {
        scene.skyBox = undefined;
      } catch (e) {
        // 静默失败
      }

      // 禁用大气层（如果导致问题）
      try {
        scene.skyAtmosphere.show = false;
      } catch (e) {
        // 静默失败
      }

      // 设置初始视角（太空视角 - 降低高度，避免裁剪问题）
      const { longitude, latitude, heading, pitch } = APP_CONFIG.EARTH_INITIAL_VIEW;
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 30000000), // 3万公里高空
        orientation: {
          heading: Cesium.Math.toRadians(heading),
          pitch: Cesium.Math.toRadians(pitch),
          roll: 0,
        },
      });

      // 全局错误处理 - 捕获 Cesium 渲染错误
      const originalRenderError = scene.renderError;
      scene.renderError.addEventListener((error: any) => {
        console.error('❌ Cesium 渲染错误:', error?.message || JSON.stringify(error));
        // 不阻止继续渲染，只是记录日志
      });

      viewerRef.current = viewer;
      setIsReady(true);

      console.log('✅ Cesium 地球初始化成功！');

      // 启动自动旋转
      if (autoRotate) {
        startAutoRotation();
      }

      onReady?.();
    } catch (error: any) {
      const errorMsg = error?.message || JSON.stringify(error) || '未知错误';
      console.error('❌ Cesium 初始化失败:', errorMsg);
      setInitError(errorMsg);
    }
  }, [onReady, autoRotate]);

  // 自动旋转地球 - 更简单的实现
  const startAutoRotation = useCallback(() => {
    if (rotationIntervalRef.current) {
      cancelAnimationFrame(rotationIntervalRef.current);
    }

    const rotate = () => {
      if (!viewerRef.current || isFlying) {
        rotationIntervalRef.current = requestAnimationFrame(rotate);
        return;
      }

      try {
        const viewer = viewerRef.current;
        // 更慢的旋转速度，避免视觉问题
        viewer.camera.rotateRight(Cesium.Math.toRadians(0.08));
      } catch (e) {
        // 旋转失败，不做处理，继续下一帧
      }

      rotationIntervalRef.current = requestAnimationFrame(rotate);
    };

    rotationIntervalRef.current = requestAnimationFrame(rotate);
  }, [isFlying]);

  // 飞行到目标位置 - 增加容错处理
  const flyToLocation = useCallback(
    (location: Coordinate & { coordType?: string }) => {
      if (!viewerRef.current) {
        console.warn('⚠️ Viewer 未初始化，无法飞行');
        // 即使 Viewer 有问题，也完成回调，让流程能继续
        setTimeout(() => onFlightComplete?.(), 1000);
        return;
      }

      console.log('🚀 开始飞行到:', location.name || '目标地点');

      const viewer = viewerRef.current;

      // 坐标转换
      let finalLng = location.lng;
      let finalLat = location.lat;
      if (location.coordType === 'bd09') {
        const [wgsLng, wgsLat] = bd09ToWgs84(location.lng, location.lat);
        finalLng = wgsLng;
        finalLat = wgsLat;
        console.log('坐标转换: BD09 -> WGS84', finalLng.toFixed(6), finalLat.toFixed(6));
      }

      // 先添加发光标记点
      try {
        const position = Cesium.Cartesian3.fromDegrees(finalLng, finalLat);
        const entity = viewer.entities.add({
          position: position,
          point: {
            pixelSize: 15,
            color: Cesium.Color.fromCssColorString('#00d4ff'),
            outlineColor: Cesium.Color.fromCssColorString('#ffffff'),
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        });
        entityRef.current = entity;
      } catch (e) {
        console.log('添加标记失败，继续飞行');
      }

      // 停止自动旋转
      if (rotationIntervalRef.current) {
        cancelAnimationFrame(rotationIntervalRef.current);
        rotationIntervalRef.current = null;
      }

      // 飞行动画 - 简化版本，更可靠
      try {
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(finalLng, finalLat, 200000),
          duration: 3,
          easingFunction: Cesium.EasingFunction.QUAD_IN_OUT,
          complete: () => {
            console.log('✅ 飞行完成！');
            onFlightComplete?.();
          },
          cancel: () => {
            console.log('飞行被取消，强制完成流程');
            onFlightComplete?.();
          },
        });
      } catch (e) {
        console.error('飞行动画失败，直接完成:', e);
        onFlightComplete?.();
      }
    },
    [onFlightComplete, bd09ToWgs84]
  );

  // 重置回地球视角
  const resetToEarthView = useCallback(() => {
    if (!viewerRef.current) return;

    const viewer = viewerRef.current;
    const { longitude, latitude, heading, pitch } = APP_CONFIG.EARTH_INITIAL_VIEW;

    // 移除所有实体标记
    try {
      viewer.entities.removeAll();
      entityRef.current = null;
    } catch (e) {
      console.log('移除标记失败');
    }

    // 飞回太空视角
    try {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 30000000),
        orientation: {
          heading: Cesium.Math.toRadians(heading),
          pitch: Cesium.Math.toRadians(pitch),
          roll: 0,
        },
        duration: 2,
        easingFunction: Cesium.EasingFunction.QUAD_IN_OUT,
      });
    } catch (e) {
      console.log('飞回太空失败');
    }

    // 恢复自动旋转
    startAutoRotation();
  }, [startAutoRotation]);

  // 监听目标位置变化，触发飞行动画
  useEffect(() => {
    if (targetLocation && isFlying && viewerRef.current) {
      flyToLocation(targetLocation);
    }
  }, [targetLocation, isFlying, flyToLocation]);

  // 初始化
  useEffect(() => {
    initViewer();

    return () => {
      // 清理
      if (rotationIntervalRef.current) {
        cancelAnimationFrame(rotationIntervalRef.current);
      }
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch (e) {
          console.log('销毁 Viewer 失败');
        }
        viewerRef.current = null;
      }
    };
  }, [initViewer]);

  // 暴露方法给父组件
  useEffect(() => {
    (window as any).resetCesiumView = resetToEarthView;
    return () => {
      delete (window as any).resetCesiumView;
    };
  }, [resetToEarthView]);

  // 显示错误提示
  if (initError) {
    return (
      <div className="cesium-fallback">
        <div className="cesium-error-panel">
          <div className="error-icon">🌍</div>
          <h3>3D 地球加载失败</h3>
          <p className="error-message">{initError}</p>
          <p className="error-hint">
            请使用最新版 Chrome、Edge 或 Firefox 浏览器，
            <br />
            或开启 WebGL 硬件加速
          </p>
        </div>
        {/* 依然显示内容区，让流程可以继续 */}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="cesium-container"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
