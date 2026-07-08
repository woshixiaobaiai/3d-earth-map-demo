/**
 * 纯 CSS 3D 地球组件
 * 零 WebGL 依赖，100% 稳定，真实效果
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { Coordinate } from '../utils/config';

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
  const [isFlyingAnim, setIsFlyingAnim] = useState(false);
  const [flyProgress, setFlyProgress] = useState(0);
  const animationRef = useRef<number | null>(null);

  // 飞行到目标位置
  const flyToLocation = useCallback(
    (location: Coordinate & { coordType?: string }) => {
      console.log('🚀 开始飞行到:', location.name);

      setIsFlyingAnim(true);
      setFlyProgress(0);

      // 3 秒飞行动画
      const start = Date.now();
      const animate = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / 3000, 1);
        setFlyProgress(progress);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          console.log('✅ 飞行完成！');
          setIsFlyingAnim(false);
          onFlightComplete?.();
        }
      };
      animationRef.current = requestAnimationFrame(animate);
    },
    [onFlightComplete]
  );

  // 监听飞行
  useEffect(() => {
    if (targetLocation && isFlying) {
      flyToLocation(targetLocation);
    }
  }, [targetLocation, isFlying, flyToLocation]);

  // 初始化完成
  useEffect(() => {
    console.log('✅ 3D 地球已就绪');
    onReady?.();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [onReady]);

  // 暴露重置方法
  useEffect(() => {
    (window as any).resetCesiumView = () => {
      console.log('🔄 重置回地球视角');
    };
    return () => {
      delete (window as any).resetCesiumView;
    };
  }, []);

  // 飞行放大效果
  const scale = 1 + flyProgress * 0.8;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(ellipse at center, #000515 0%, #000005 100%)',
        zIndex: 1,
        overflow: 'hidden',
        perspective: '1000px',
      }}
    >
      {/* 星空背景 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      >
        {Array.from({ length: 200 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              background: i % 5 === 0 ? '#aaccff' : '#ffffff',
              borderRadius: '50%',
              opacity: 0.3 + Math.random() * 0.7,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* 3D 地球容器 */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${scale})`,
          width: '400px',
          height: '400px',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s linear',
        }}
      >
        {/* 地球主球体 */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: `
              radial-gradient(circle at 30% 30%,
                #4a90d9 0%,
                #2d6a9f 20%,
                #1a4a7a 40%,
                #0d3a5a 60%,
                #082840 80%,
                #051525 100%
              )
            `,
            boxShadow: `
              inset -30px -30px 80px rgba(0, 0, 0, 0.8),
              inset 20px 20px 60px rgba(100, 180, 255, 0.2),
              0 0 60px rgba(74, 144, 217, 0.3),
              0 0 120px rgba(74, 144, 217, 0.15)
            `,
            animation: autoRotate && !isFlyingAnim ? 'earthRotate 60s linear infinite' : 'none',
          }}
        >
          {/* 大陆纹理层（叠加） */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: `
                radial-gradient(ellipse 35% 25% at 25% 25%, rgba(45, 106, 78, 0.7) 0%, transparent 70%),
                radial-gradient(ellipse 15% 30% at 33% 60%, rgba(45, 106, 78, 0.6) 0%, transparent 70%),
                radial-gradient(ellipse 20% 15% at 52% 20%, rgba(45, 106, 78, 0.7) 0%, transparent 70%),
                radial-gradient(ellipse 18% 25% at 55% 50%, rgba(45, 106, 78, 0.65) 0%, transparent 70%),
                radial-gradient(ellipse 30% 22% at 70% 28%, rgba(45, 106, 78, 0.7) 0%, transparent 70%),
                radial-gradient(ellipse 12% 15% at 76% 55%, rgba(45, 106, 78, 0.6) 0%, transparent 70%),
                radial-gradient(ellipse 10% 10% at 82% 68%, rgba(139, 115, 85, 0.5) 0%, transparent 70%),
                radial-gradient(ellipse 25% 8% at 50% 8%, rgba(255, 255, 255, 0.4) 0%, transparent 70%),
                radial-gradient(ellipse 20% 6% at 50% 92%, rgba(255, 255, 255, 0.35) 0%, transparent 70%)
              `,
            }}
          />

          {/* 云层效果 */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: `
                radial-gradient(ellipse 12% 5% at 30% 35%, rgba(255, 255, 255, 0.15) 0%, transparent 70%),
                radial-gradient(ellipse 8% 4% at 45% 55%, rgba(255, 255, 255, 0.12) 0%, transparent 70%),
                radial-gradient(ellipse 10% 4% at 60% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 70%),
                radial-gradient(ellipse 6% 3% at 75% 45%, rgba(255, 255, 255, 0.08) 0%, transparent 70%)
              `,
              animation: 'cloudMove 45s linear infinite',
            }}
          />

          {/* 高光增强 */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: `
                radial-gradient(ellipse at 25% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)
              `,
            }}
          />
        </div>

        {/* 大气层外发光 */}
        <div
          style={{
            position: 'absolute',
            width: '115%',
            height: '115%',
            top: '-7.5%',
            left: '-7.5%',
            borderRadius: '50%',
            border: '2px solid rgba(74, 144, 217, 0.4)',
            boxShadow: `
              0 0 30px rgba(74, 144, 217, 0.25),
              0 0 60px rgba(74, 144, 217, 0.15),
              inset 0 0 30px rgba(74, 144, 217, 0.1)
            `,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* CSS 动画定义 */}
      <style>{`
        @keyframes earthRotate {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
        @keyframes cloudMove {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
